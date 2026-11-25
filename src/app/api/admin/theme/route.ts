import { NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { getClientIp, logActivity, requireAdmin } from '@/lib/auth';
import { themeSchema } from '@/lib/validation';
import { revalidatePublicSite } from '@/lib/revalidate';

export async function GET() {
  const { error } = await requireAdmin('dashboard.view');
  if (error) return error;

  const theme = await queryOne(`SELECT * FROM theme_settings ORDER BY id ASC LIMIT 1`);
  return NextResponse.json({ theme });
}

export async function PATCH(request: Request) {
  const { user, error } = await requireAdmin('settings.manage');
  if (error || !user) return error!;

  try {
    const body = await request.json();
    const parsed = themeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid theme settings' },
        { status: 400 }
      );
    }

    const d = parsed.data;
    await execute(
      `UPDATE theme_settings SET
        primary_color = ?, secondary_color = ?, dark_bg_color = ?, light_bg_color = ?,
        surface_color = ?, muted_text_color = ?, heading_font = ?, body_font = ?,
        border_radius = ?, header_style = ?
       WHERE id = 1`,
      [
        d.primary_color,
        d.secondary_color,
        d.dark_bg_color,
        d.light_bg_color,
        d.surface_color,
        d.muted_text_color,
        d.heading_font,
        d.body_font,
        d.border_radius || '0.5rem',
        d.header_style || 'transparent-overlay',
      ]
    );

    await logActivity({
      adminUserId: user.id,
      action: 'update',
      module: 'theme',
      entityId: 1,
      description: 'Updated theme colors and typography',
      ipAddress: getClientIp(request),
    });

    revalidatePublicSite();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Theme PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update theme' }, { status: 500 });
  }
}
