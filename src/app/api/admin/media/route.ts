import { NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { getClientIp, logActivity, requireAdmin } from '@/lib/auth';
import { processAndStoreUpload } from '@/lib/media';

export async function GET(request: Request) {
  const { error } = await requireAdmin('media.manage');
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('q') || '').trim();
  const folder = (searchParams.get('folder') || '').trim();

  const conds = [`deleted_at IS NULL`];
  const params: unknown[] = [];

  if (search) {
    conds.push(`(title LIKE ? OR original_name LIKE ? OR alt_text LIKE ?)`);
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (folder && folder !== 'all') {
    conds.push(`folder = ?`);
    params.push(folder);
  }

  const media = await query(
    `SELECT * FROM media_library WHERE ${conds.join(' AND ')} ORDER BY created_at DESC, id DESC LIMIT 200`,
    params
  );

  return NextResponse.json({ media });
}

export async function POST(request: Request) {
  const { user, error } = await requireAdmin('media.manage');
  if (error || !user) return error!;

  try {
    const formData = await request.formData();
    const folder = String(formData.get('folder') || 'general');
    const files = formData.getAll('files').filter((f): f is File => f instanceof File);

    // Also support single 'file' field
    const single = formData.get('file');
    if (single instanceof File && files.length === 0) {
      files.push(single);
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided for upload' }, { status: 400 });
    }

    const uploaded: any[] = [];
    for (const file of files) {
      const processed = await processAndStoreUpload(file, folder);
      const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ');
      const res = await execute(
        `INSERT INTO media_library (
          filename, original_name, url, webp_url, mime_type, file_size,
          width, height, title, alt_text, folder, uploaded_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          processed.filename,
          processed.originalName,
          processed.url,
          processed.webpUrl,
          processed.mimeType,
          processed.fileSize,
          processed.width,
          processed.height,
          title,
          title,
          folder,
          user.id,
        ]
      );
      uploaded.push({
        id: res.insertId,
        ...processed,
        title,
        alt_text: title,
        folder,
      });
    }

    await logActivity({
      adminUserId: user.id,
      action: 'upload',
      module: 'media_library',
      entityId: uploaded.map((u) => u.id).join(','),
      description: `Uploaded ${uploaded.length} media file(s) to ${folder}`,
      ipAddress: getClientIp(request),
    });

    return NextResponse.json({ success: true, uploaded }, { status: 201 });
  } catch (err: any) {
    console.error('Media upload error:', err);
    return NextResponse.json(
      { error: err?.message || 'File upload failed validation' },
      { status: 400 }
    );
  }
}
