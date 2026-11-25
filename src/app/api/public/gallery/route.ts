import { NextResponse } from 'next/server';
import { getGalleryData } from '@/services/site-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const projectId = searchParams.get('projectId');

  const data = await getGalleryData();
  let images = data.images;

  if (category && category !== 'all') {
    images = images.filter((img) => img.category_slug === category);
  }
  if (projectId) {
    images = images.filter((img) => String(img.project_id) === projectId);
  }

  return NextResponse.json({ categories: data.categories, images });
}
