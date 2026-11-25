import { NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { getClientIp, logActivity, requireAdmin } from '@/lib/auth';
import { animationSchema } from '@/lib/validation';
import { revalidatePublicSite } from '@/lib/revalidate';

export async function GET() {
  const { error } = await requireAdmin('dashboard.view');
  if (error) return error;

  const animations = await queryOne(`SELECT * FROM animation_settings ORDER BY id ASC LIMIT 1`);
  return NextResponse.json({ animations });
}

export async function PATCH(request: Request) {
  const { user, error } = await requireAdmin('settings.manage');
  if (error || !user) return error!;

  try {
    const body = await request.json();
    const parsed = animationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid animation configuration' },
        { status: 400 }
      );
    }

    const d = parsed.data;
    await execute(
      `UPDATE animation_settings SET
        animations_enabled = ?, smooth_scroll_enabled = ?, parallax_enabled = ?,
        hero_animations_enabled = ?, project_animations_enabled = ?, hover_effects_enabled = ?,
        mobile_animations_enabled = ?, animation_style = ?, duration_multiplier = ?, intensity = ?
       WHERE id = 1`,
      [
        d.animations_enabled ? 1 : 0,
        d.smooth_scroll_enabled ? 1 : 0,
        d.parallax_enabled ? 1 : 0,
        d.hero_animations_enabled ? 1 : 0,
        d.project_animations_enabled ? 1 : 0,
        d.hover_effects_enabled ? 1 : 0,
        d.mobile_animations_enabled ? 1 : 0,
        d.animation_style,
        d.duration_multiplier,
        d.intensity,
      ]
    );

    await logActivity({
      adminUserId: user.id,
      action: 'update',
      module: 'animations',
      entityId: 1,
      description: `Updated GSAP animation settings (${d.animation_style})`,
      ipAddress: getClientIp(request),
    });

    revalidatePublicSite();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Animation PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update animation settings' }, { status: 500 });
  }
}
