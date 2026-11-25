import { NextResponse } from 'next/server';
import { getPublishedServices, getServiceCategories } from '@/services/site-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const search = (searchParams.get('q') || '').trim().toLowerCase();

  const [services, categories] = await Promise.all([
    getPublishedServices({ categorySlug: category }),
    getServiceCategories(),
  ]);

  const filtered = search
    ? services.filter(
        (s) =>
          s.title.toLowerCase().includes(search) ||
          s.short_description.toLowerCase().includes(search)
      )
    : services;

  return NextResponse.json({ services: filtered, categories });
}
