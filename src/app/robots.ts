import type { MetadataRoute } from 'next';
import { getSiteBundle } from '@/services/site-data';
import { getSiteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const bundle = await getSiteBundle();
  const baseUrl = getSiteUrl(bundle.website);

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
