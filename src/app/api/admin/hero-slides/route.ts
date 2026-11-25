import { NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { getClientIp, logActivity, requireAdmin } from '@/lib/auth';
import { revalidatePublicSite } from '@/lib/revalidate';

export async function GET() {
  const { error } = await requireAdmin('content.manage');
  if (error) return error;

  const slides = await query(`SELECT * FROM hero_slides ORDER BY display_order ASC, id ASC`);
  return NextResponse.json({ slides });
}

export async function POST(request: Request) {
  const { user, error } = await requireAdmin('content.manage');
  if (error || !user) return error!;

  try {
    const d = await request.json();
    if (!d.heading || !d.image_url) {
      return NextResponse.json({ error: 'Heading and image URL are required' }, { status: 400 });
    }

    const res = await execute(
      `INSERT INTO hero_slides (
        eyebrow, heading, description, image_url, image_alt,
        primary_cta_label, primary_cta_link, secondary_cta_label, secondary_cta_link,
        show_whatsapp_cta, overlay_opacity, animation_preset, is_active, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.eyebrow || null,
        d.heading,
        d.description || null,
        d.image_url,
        d.image_alt || d.heading,
        d.primary_cta_label || 'Explore Our Projects',
        d.primary_cta_link || '/projects',
        d.secondary_cta_label || 'Get a Free Consultation',
        d.secondary_cta_link || '/contact',
        d.show_whatsapp_cta ? 1 : 0,
        Number(d.overlay_opacity ?? 0.55),
        d.animation_preset || 'zoom-reveal',
        d.is_active !== undefined ? (d.is_active ? 1 : 0) : 1,
        Number(d.display_order ?? 0),
      ]
    );

    await logActivity({
      adminUserId: user.id,
      action: 'create',
      module: 'hero_slides',
      entityId: res.insertId,
      description: `Created hero slide: ${d.heading}`,
      ipAddress: getClientIp(request),
    });

    revalidatePublicSite(['/']);
    return NextResponse.json({ success: true, id: res.insertId }, { status: 201 });
  } catch (err) {
    console.error('Hero slide POST error:', err);
    return NextResponse.json({ error: 'Failed to create hero slide' }, { status: 500 });
  }
}
