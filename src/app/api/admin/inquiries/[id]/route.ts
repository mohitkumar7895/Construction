import { NextResponse } from 'next/server';
import { execute, query, queryOne } from '@/lib/db';
import { getClientIp, logActivity, requireAdmin } from '@/lib/auth';

const VALID_STATUSES = ['new', 'contacted', 'in_progress', 'quotation_sent', 'converted', 'closed'];

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin('inquiries.manage');
  if (error) return error;

  const { id } = await context.params;
  const inquiryId = Number(id);

  const [inquiry, notes] = await Promise.all([
    queryOne(`SELECT * FROM inquiries WHERE id = ? AND deleted_at IS NULL LIMIT 1`, [inquiryId]),
    query(
      `SELECT n.*, u.name AS admin_name
       FROM inquiry_notes n
       LEFT JOIN admin_users u ON u.id = n.admin_user_id
       WHERE n.inquiry_id = ?
       ORDER BY n.created_at DESC`,
      [inquiryId]
    ),
  ]);

  if (!inquiry) return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
  return NextResponse.json({ inquiry, notes });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin('inquiries.manage');
  if (error || !user) return error!;

  const { id } = await context.params;
  const inquiryId = Number(id);
  const body = await request.json();

  if (body.status && VALID_STATUSES.includes(body.status)) {
    await execute(`UPDATE inquiries SET status = ? WHERE id = ?`, [body.status, inquiryId]);
    await logActivity({
      adminUserId: user.id,
      action: 'update_status',
      module: 'inquiries',
      entityId: inquiryId,
      description: `Changed inquiry #${inquiryId} status to ${body.status}`,
      ipAddress: getClientIp(request),
    });
  }

  if (typeof body.note === 'string' && body.note.trim().length > 0) {
    await execute(
      `INSERT INTO inquiry_notes (inquiry_id, admin_user_id, note) VALUES (?, ?, ?)`,
      [inquiryId, user.id, body.note.trim()]
    );
    await logActivity({
      adminUserId: user.id,
      action: 'add_note',
      module: 'inquiries',
      entityId: inquiryId,
      description: `Added note to inquiry #${inquiryId}`,
      ipAddress: getClientIp(request),
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin('inquiries.manage');
  if (error || !user) return error!;

  const { id } = await context.params;
  const inquiryId = Number(id);
  await execute(`UPDATE inquiries SET deleted_at = NOW() WHERE id = ?`, [inquiryId]);

  await logActivity({
    adminUserId: user.id,
    action: 'delete',
    module: 'inquiries',
    entityId: inquiryId,
    description: `Soft-deleted inquiry #${inquiryId}`,
    ipAddress: getClientIp(request),
  });

  return NextResponse.json({ success: true });
}
