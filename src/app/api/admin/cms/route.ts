import { NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { getClientIp, logActivity, requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import { revalidatePublicSite } from '@/lib/revalidate';

// Unified secure CMS controller for modular collections:
// team, testimonials, faqs, statistics, process_steps,
// service_categories, project_categories, gallery_categories,
// navigation, social_links, footer_sections, footer_links

const ALLOWED_RESOURCES = new Set([
  'team',
  'testimonials',
  'faqs',
  'statistics',
  'process_steps',
  'service_categories',
  'project_categories',
  'gallery_categories',
  'navigation',
  'social_links',
  'footer_sections',
  'footer_links',
]);

export async function GET(request: Request) {
  const { error } = await requireAdmin('content.manage');
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const resource = searchParams.get('resource') || '';
  if (!ALLOWED_RESOURCES.has(resource)) {
    return NextResponse.json({ error: 'Invalid CMS resource' }, { status: 400 });
  }

  let rows: any[] = [];
  switch (resource) {
    case 'team':
      rows = await query(`SELECT * FROM team_members WHERE deleted_at IS NULL ORDER BY display_order ASC, id ASC`);
      break;
    case 'testimonials':
      rows = await query(`SELECT * FROM testimonials WHERE deleted_at IS NULL ORDER BY display_order ASC, id DESC`);
      break;
    case 'faqs':
      rows = await query(`SELECT * FROM faqs WHERE deleted_at IS NULL ORDER BY display_order ASC, id ASC`);
      break;
    case 'statistics':
      rows = await query(`SELECT * FROM statistics ORDER BY display_order ASC, id ASC`);
      break;
    case 'process_steps':
      rows = await query(`SELECT * FROM process_steps ORDER BY display_order ASC, id ASC`);
      break;
    case 'service_categories':
      rows = await query(`SELECT * FROM service_categories ORDER BY display_order ASC, id ASC`);
      break;
    case 'project_categories':
      rows = await query(`SELECT * FROM project_categories ORDER BY display_order ASC, id ASC`);
      break;
    case 'gallery_categories':
      rows = await query(`SELECT * FROM gallery_categories ORDER BY display_order ASC, id ASC`);
      break;
    case 'navigation':
      rows = await query(`SELECT * FROM navigation_items ORDER BY display_order ASC, id ASC`);
      break;
    case 'social_links':
      rows = await query(`SELECT * FROM social_links ORDER BY display_order ASC, id ASC`);
      break;
    case 'footer_sections':
      rows = await query(`SELECT * FROM footer_sections ORDER BY display_order ASC, id ASC`);
      break;
    case 'footer_links':
      rows = await query(
        `SELECT fl.*, fs.title AS section_title
         FROM footer_links fl
         LEFT JOIN footer_sections fs ON fs.id = fl.footer_section_id
         ORDER BY fl.footer_section_id ASC, fl.display_order ASC`
      );
      break;
  }

  return NextResponse.json({ items: rows });
}

export async function POST(request: Request) {
  const { user, error } = await requireAdmin('content.manage');
  if (error || !user) return error!;

  try {
    const body = await request.json();
    const { resource, action, id, data } = body as {
      resource: string;
      action: 'create' | 'update' | 'delete';
      id?: number;
      data?: Record<string, any>;
    };

    if (!ALLOWED_RESOURCES.has(resource)) {
      return NextResponse.json({ error: 'Invalid CMS resource' }, { status: 400 });
    }

    const d = data || {};
    let entityId: number | string = id || '';

    if (resource === 'team') {
      if (action === 'delete' && id) {
        await execute(`UPDATE team_members SET deleted_at = NOW() WHERE id = ?`, [id]);
      } else if (action === 'update' && id) {
        await execute(
          `UPDATE team_members SET name=?, designation=?, bio=?, photo_url=?, email=?, phone=?, linkedin_url=?, is_leadership=?, status=?, display_order=? WHERE id=?`,
          [d.name, d.designation, d.bio || null, d.photo_url || null, d.email || null, d.phone || null, d.linkedin_url || null, d.is_leadership ? 1 : 0, d.status || 'published', Number(d.display_order || 0), id]
        );
      } else {
        const res = await execute(
          `INSERT INTO team_members (name, designation, bio, photo_url, email, phone, linkedin_url, is_leadership, status, display_order) VALUES (?,?,?,?,?,?,?,?,?,?)`,
          [d.name, d.designation, d.bio || null, d.photo_url || null, d.email || null, d.phone || null, d.linkedin_url || null, d.is_leadership ? 1 : 0, d.status || 'published', Number(d.display_order || 0)]
        );
        entityId = res.insertId;
      }
    } else if (resource === 'testimonials') {
      if (action === 'delete' && id) {
        await execute(`UPDATE testimonials SET deleted_at = NOW() WHERE id = ?`, [id]);
      } else if (action === 'update' && id) {
        await execute(
          `UPDATE testimonials SET client_name=?, client_photo=?, designation=?, review=?, rating=?, project_reference=?, status=?, display_order=? WHERE id=?`,
          [d.client_name, d.client_photo || null, d.designation || null, d.review, Math.min(5, Math.max(1, Number(d.rating || 5))), d.project_reference || null, d.status || 'draft', Number(d.display_order || 0), id]
        );
      } else {
        const res = await execute(
          `INSERT INTO testimonials (client_name, client_photo, designation, review, rating, project_reference, status, display_order) VALUES (?,?,?,?,?,?,?,?)`,
          [d.client_name, d.client_photo || null, d.designation || null, d.review, Math.min(5, Math.max(1, Number(d.rating || 5))), d.project_reference || null, d.status || 'draft', Number(d.display_order || 0)]
        );
        entityId = res.insertId;
      }
    } else if (resource === 'faqs') {
      if (action === 'delete' && id) {
        await execute(`UPDATE faqs SET deleted_at = NOW() WHERE id = ?`, [id]);
      } else if (action === 'update' && id) {
        await execute(
          `UPDATE faqs SET category=?, question=?, answer=?, status=?, display_order=? WHERE id=?`,
          [d.category || 'general', d.question, d.answer, d.status || 'published', Number(d.display_order || 0), id]
        );
      } else {
        const res = await execute(
          `INSERT INTO faqs (category, question, answer, status, display_order) VALUES (?,?,?,?,?)`,
          [d.category || 'general', d.question, d.answer, d.status || 'published', Number(d.display_order || 0)]
        );
        entityId = res.insertId;
      }
    } else if (resource === 'statistics') {
      if (action === 'delete' && id) {
        await execute(`DELETE FROM statistics WHERE id = ?`, [id]);
      } else if (action === 'update' && id) {
        await execute(
          `UPDATE statistics SET label=?, value=?, suffix=?, icon=?, is_visible=?, display_order=? WHERE id=?`,
          [d.label, Math.max(0, Number(d.value || 0)), d.suffix || '+', d.icon || 'Award', d.is_visible ? 1 : 0, Number(d.display_order || 0), id]
        );
      } else {
        const res = await execute(
          `INSERT INTO statistics (stat_key, label, value, suffix, icon, is_visible, display_order) VALUES (?,?,?,?,?,?,?)`,
          [slugify(d.stat_key || d.label), d.label, Math.max(0, Number(d.value || 0)), d.suffix || '+', d.icon || 'Award', d.is_visible ? 1 : 0, Number(d.display_order || 0)]
        );
        entityId = res.insertId;
      }
    } else if (resource === 'process_steps') {
      if (action === 'delete' && id) {
        await execute(`DELETE FROM process_steps WHERE id = ?`, [id]);
      } else if (action === 'update' && id) {
        await execute(
          `UPDATE process_steps SET step_number=?, title=?, description=?, icon=?, is_active=?, display_order=? WHERE id=?`,
          [d.step_number || '01', d.title, d.description, d.icon || 'Compass', d.is_active ? 1 : 0, Number(d.display_order || 0), id]
        );
      } else {
        const res = await execute(
          `INSERT INTO process_steps (step_number, title, description, icon, is_active, display_order) VALUES (?,?,?,?,?,?)`,
          [d.step_number || '01', d.title, d.description, d.icon || 'Compass', d.is_active !== false ? 1 : 0, Number(d.display_order || 0)]
        );
        entityId = res.insertId;
      }
    } else if (
      resource === 'service_categories' ||
      resource === 'project_categories' ||
      resource === 'gallery_categories'
    ) {
      const table = resource;
      if (action === 'delete' && id) {
        await execute(`DELETE FROM ${table} WHERE id = ?`, [id]);
      } else if (action === 'update' && id) {
        await execute(
          `UPDATE ${table} SET name=?, slug=?, description=?, display_order=?, is_active=? WHERE id=?`,
          [d.name, slugify(d.slug || d.name), d.description || null, Number(d.display_order || 0), d.is_active ? 1 : 0, id]
        );
      } else {
        const res = await execute(
          `INSERT INTO ${table} (name, slug, description, display_order, is_active) VALUES (?,?,?,?,?)`,
          [d.name, slugify(d.slug || d.name), d.description || null, Number(d.display_order || 0), d.is_active !== false ? 1 : 0]
        );
        entityId = res.insertId;
      }
    } else if (resource === 'navigation') {
      if (action === 'delete' && id) {
        await execute(`DELETE FROM navigation_items WHERE id = ?`, [id]);
      } else if (action === 'update' && id) {
        await execute(
          `UPDATE navigation_items SET label=?, href=?, target=?, is_visible=?, display_order=? WHERE id=?`,
          [d.label, d.href, d.target || '_self', d.is_visible ? 1 : 0, Number(d.display_order || 0), id]
        );
      } else {
        const res = await execute(
          `INSERT INTO navigation_items (label, href, target, is_visible, display_order) VALUES (?,?,?,?,?)`,
          [d.label, d.href, d.target || '_self', d.is_visible !== false ? 1 : 0, Number(d.display_order || 0)]
        );
        entityId = res.insertId;
      }
    } else if (resource === 'social_links') {
      if (action === 'delete' && id) {
        await execute(`DELETE FROM social_links WHERE id = ?`, [id]);
      } else if (action === 'update' && id) {
        await execute(
          `UPDATE social_links SET platform=?, label=?, url=?, icon=?, is_visible=?, display_order=? WHERE id=?`,
          [d.platform, d.label || d.platform, d.url, d.icon || d.platform, d.is_visible ? 1 : 0, Number(d.display_order || 0), id]
        );
      } else {
        const res = await execute(
          `INSERT INTO social_links (platform, label, url, icon, is_visible, display_order) VALUES (?,?,?,?,?,?)`,
          [d.platform, d.label || d.platform, d.url, d.icon || d.platform, d.is_visible !== false ? 1 : 0, Number(d.display_order || 0)]
        );
        entityId = res.insertId;
      }
    } else if (resource === 'footer_links') {
      if (action === 'delete' && id) {
        await execute(`DELETE FROM footer_links WHERE id = ?`, [id]);
      } else if (action === 'update' && id) {
        await execute(
          `UPDATE footer_links SET footer_section_id=?, label=?, href=?, target=?, is_visible=?, display_order=? WHERE id=?`,
          [Number(d.footer_section_id || 1), d.label, d.href, d.target || '_self', d.is_visible ? 1 : 0, Number(d.display_order || 0), id]
        );
      } else {
        const res = await execute(
          `INSERT INTO footer_links (footer_section_id, label, href, target, is_visible, display_order) VALUES (?,?,?,?,?,?)`,
          [Number(d.footer_section_id || 1), d.label, d.href, d.target || '_self', d.is_visible !== false ? 1 : 0, Number(d.display_order || 0)]
        );
        entityId = res.insertId;
      }
    }

    await logActivity({
      adminUserId: user.id,
      action,
      module: resource,
      entityId,
      description: `${action} on ${resource}`,
      ipAddress: getClientIp(request),
    });

    revalidatePublicSite();
    return NextResponse.json({ success: true, id: entityId });
  } catch (err: any) {
    if (err?.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Duplicate slug or key exists' }, { status: 409 });
    }
    console.error('CMS POST error:', err);
    return NextResponse.json({ error: 'CMS operation failed' }, { status: 500 });
  }
}
