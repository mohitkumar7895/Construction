import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { getClientIp, hashPassword, logActivity, requireAdmin } from '@/lib/auth';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin('users.manage');
  if (error || !user) return error!;

  const { id } = await context.params;
  const targetId = Number(id);
  const d = await request.json();

  if (d.password && String(d.password).length >= 8) {
    const hash = await hashPassword(String(d.password));
    await execute(
      `UPDATE admin_users SET role_id=?, name=?, phone=?, is_active=?, password_hash=? WHERE id=?`,
      [Number(d.role_id || 2), d.name, d.phone || null, d.is_active ? 1 : 0, hash, targetId]
    );
  } else {
    await execute(
      `UPDATE admin_users SET role_id=?, name=?, phone=?, is_active=? WHERE id=?`,
      [Number(d.role_id || 2), d.name, d.phone || null, d.is_active ? 1 : 0, targetId]
    );
  }

  await logActivity({
    adminUserId: user.id,
    action: 'update',
    module: 'admin_users',
    entityId: targetId,
    description: `Updated admin user #${targetId}`,
    ipAddress: getClientIp(request),
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAdmin('users.manage');
  if (error || !user) return error!;

  const { id } = await context.params;
  const targetId = Number(id);
  if (targetId === user.id) {
    return NextResponse.json({ error: 'You cannot delete your own active account' }, { status: 400 });
  }

  await execute(`UPDATE admin_users SET deleted_at = NOW(), is_active = 0 WHERE id = ?`, [targetId]);
  await execute(`DELETE FROM admin_sessions WHERE admin_user_id = ?`, [targetId]);

  await logActivity({
    adminUserId: user.id,
    action: 'delete',
    module: 'admin_users',
    entityId: targetId,
    description: `Deactivated admin user #${targetId}`,
    ipAddress: getClientIp(request),
  });

  return NextResponse.json({ success: true });
}
