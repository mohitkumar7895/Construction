import { NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { getClientIp, logActivity, requireAdmin } from '@/lib/auth';
import { seoSchema } from '@/lib/validation';
import { revalidatePublicSite } from '@/lib/revalidate';

export async function GET() {
  const { error } = await requireAdmin('seo.manage');
  if (error) return error;

  const [seoList, redirects] = await Promise.all([
    query(`SELECT * FROM seo_metadata ORDER BY entity_type ASC, entity_slug ASC`),
    query(`SELECT * FROM redirects ORDER BY id DESC`),
  ]);

  return NextResponse.json({ seoList, redirects });
}

export async function POST(request: Request) {
  const { user, error } = await requireAdmin('seo.manage');
  if (error || !user) return error!;

  try {
    const body = await request.json();

    // Handle redirect rules
    if (body.kind === 'redirect') {
      if (body.action === 'delete' && body.id) {
        await execute(`DELETE FROM redirects WHERE id = ?`, [Number(body.id)]);
        return NextResponse.json({ success: true });
      }
      if (!body.source_path || !body.destination_path) {
        return NextResponse.json({ error: 'Source and destination paths required' }, { status: 400 });
      }
      await execute(
        `INSERT INTO redirects (source_path, destination_path, status_code, is_active)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE destination_path = VALUES(destination_path), status_code = VALUES(status_code), is_active = VALUES(is_active)`,
        [
          body.source_path.startsWith('/') ? body.source_path : `/${body.source_path}`,
          body.destination_path,
          Number(body.status_code || 301),
          body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
        ]
      );
      await logActivity({
        adminUserId: user.id,
        action: 'upsert_redirect',
        module: 'seo',
        description: `Configured redirect ${body.source_path} -> ${body.destination_path}`,
        ipAddress: getClientIp(request),
      });
      return NextResponse.json({ success: true });
    }

    const parsed = seoSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid SEO payload' },
        { status: 400 }
      );
    }

    const d = parsed.data;
    await execute(
      `INSERT INTO seo_metadata (
        entity_type, entity_slug, meta_title, meta_description, focus_keyword, canonical_url,
        og_title, og_description, og_image, twitter_title, twitter_description, twitter_image,
        robots_index, robots_follow, structured_data_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        meta_title = VALUES(meta_title),
        meta_description = VALUES(meta_description),
        focus_keyword = VALUES(focus_keyword),
        canonical_url = VALUES(canonical_url),
        og_title = VALUES(og_title),
        og_description = VALUES(og_description),
        og_image = VALUES(og_image),
        twitter_title = VALUES(twitter_title),
        twitter_description = VALUES(twitter_description),
        twitter_image = VALUES(twitter_image),
        robots_index = VALUES(robots_index),
        robots_follow = VALUES(robots_follow),
        structured_data_json = VALUES(structured_data_json)`,
      [
        d.entity_type,
        d.entity_slug,
        d.meta_title || null,
        d.meta_description || null,
        d.focus_keyword || null,
        d.canonical_url || null,
        d.og_title || null,
        d.og_description || null,
        d.og_image || null,
        d.twitter_title || null,
        d.twitter_description || null,
        d.twitter_image || null,
        d.robots_index !== undefined ? (d.robots_index ? 1 : 0) : 1,
        d.robots_follow !== undefined ? (d.robots_follow ? 1 : 0) : 1,
        d.structured_data_json || null,
      ]
    );

    await logActivity({
      adminUserId: user.id,
      action: 'upsert_seo',
      module: 'seo',
      entityId: `${d.entity_type}:${d.entity_slug}`,
      description: `Updated SEO metadata for ${d.entity_type}/${d.entity_slug}`,
      ipAddress: getClientIp(request),
    });

    revalidatePublicSite();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('SEO POST error:', err);
    return NextResponse.json({ error: 'Failed to save SEO settings' }, { status: 500 });
  }
}
