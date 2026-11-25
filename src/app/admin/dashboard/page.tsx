import React from 'react';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { AdminShell } from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user = await getAdminSession();
  if (!user) {
    redirect('/admin/login');
  }

  return <AdminShell user={user} />;
}
