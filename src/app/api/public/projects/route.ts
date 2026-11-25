import { NextResponse } from 'next/server';
import { getProjectCategories, getPublishedProjects } from '@/services/site-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || undefined;
  const status = searchParams.get('status') || undefined;
  const search = (searchParams.get('q') || '').trim().toLowerCase();

  const [projects, categories] = await Promise.all([
    getPublishedProjects({ categorySlug: category, projectStatus: status }),
    getProjectCategories(),
  ]);

  const filtered = search
    ? projects.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.location.toLowerCase().includes(search) ||
          p.short_description.toLowerCase().includes(search)
      )
    : projects;

  return NextResponse.json({ projects: filtered, categories });
}
