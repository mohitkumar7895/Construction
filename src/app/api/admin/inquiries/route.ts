import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  const { error } = await requireAdmin('inquiries.manage');
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || '';
  const search = (searchParams.get('q') || '').trim();
  const format = searchParams.get('format') || 'json';

  const conds = [`deleted_at IS NULL`];
  const params: unknown[] = [];

  if (status && status !== 'all') {
    conds.push(`status = ?`);
    params.push(status);
  }
  if (search) {
    conds.push(`(full_name LIKE ? OR phone LIKE ? OR email LIKE ? OR project_location LIKE ?)`);
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  const inquiries = await query<any>(
    `SELECT * FROM inquiries WHERE ${conds.join(' AND ')} ORDER BY created_at DESC`,
    params
  );

  if (format === 'csv') {
    const headers = [
      'ID',
      'Name',
      'Phone',
      'Email',
      'Service',
      'Project Type',
      'Location',
      'Budget',
      'Status',
      'Message',
      'Created At',
    ];
    const escapeCsv = (val: unknown) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };
    const rows = [
      headers.join(','),
      ...inquiries.map((inq) =>
        [
          inq.id,
          inq.full_name,
          inq.phone,
          inq.email,
          inq.service_required,
          inq.project_type,
          inq.project_location,
          inq.estimated_budget,
          inq.status,
          inq.message,
          inq.created_at,
        ]
          .map(escapeCsv)
          .join(',')
      ),
    ];

    return new NextResponse(rows.join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="inquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  return NextResponse.json({ inquiries });
}
