import { NextResponse } from 'next/server';
import { clearSessionCookie, getAdminSession, getClientIp, logActivity } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getAdminSession();
  const ip = getClientIp(request);

  if (user) {
    await logActivity({
      adminUserId: user.id,
      action: 'logout',
      module: 'auth',
      entityId: user.id,
      description: `Admin signed out: ${user.email}`,
      ipAddress: ip,
    });
  }

  await clearSessionCookie();
  return NextResponse.json({ success: true });
}
