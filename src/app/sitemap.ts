import type { MetadataRoute } from 'next';
import { query } from '@/lib/db';
import { getSiteBundle } from '@/services/site-data';
import { getSiteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const bundle = await getSiteBundle();
  const baseUrl = getSiteUrl(bundle.website);

  try {
    const [pages, services, projects] = await Promise.all([
      query<{ slug: string; updated_at: string }>(
        `SELECT slug, updated_at FROM pages WHERE deleted_at IS NULL AND status = 'published' AND is_indexable = 1`
      ),
      query<{ slug: string; updated_at: string }>(
        `SELECT slug, updated_at FROM services WHERE deleted_at IS NULL AND status = 'published'`
      ),
      query<{ slug: string; updated_at: string }>(
        `SELECT slug, updated_at FROM projects WHERE deleted_at IS NULL AND status = 'published'`
      ),
    ]);

    const entries: MetadataRoute.Sitemap = [];

    for (const p of pages) {
      const path = p.slug === 'home' ? '' : `/${p.slug}`;
      entries.push({
        url: `${baseUrl}${path}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: p.slug === 'home' ? 'weekly' : 'monthly',
        priority: p.slug === 'home' ? 1.0 : 0.8,
      });
    }

    for (const s of services) {
      entries.push({
        url: `${baseUrl}/services/${s.slug}`,
        lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.85,
      });
    }

    for (const pr of projects) {
      entries.push({
        url: `${baseUrl}/projects/${pr.slug}`,
        lastModified: pr.updated_at ? new Date(pr.updated_at) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }

    return entries;
  } catch {
    return [{ url: baseUrl, lastModified: new Date(), priority: 1.0 }];
  }
}
