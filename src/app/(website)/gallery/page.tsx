import React from 'react';
import type { Metadata } from 'next';
import { getGalleryData, getSeoForEntity, getSiteBundle } from '@/services/site-data';
import { buildPageMetadata, getSiteUrl } from '@/lib/seo';
import { InnerPageHero } from '@/components/website/InnerPageHero';
import { GalleryShowcase } from '@/components/website/GalleryShowcase';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const [bundle, seo] = await Promise.all([
    getSiteBundle(),
    getSeoForEntity('page', 'gallery'),
  ]);
  return buildPageMetadata({
    seo,
    fallbackTitle: 'Our Gallery',
    fallbackDescription:
      'Explore residential duplexes, modern villas, commercial structures, interiors, and engineering photography.',
    path: '/gallery',
    website: bundle.website,
  });
}

export default async function GalleryPage() {
  const [bundle, gallery] = await Promise.all([getSiteBundle(), getGalleryData()]);

  return (
    <>
      <InnerPageHero
        eyebrow="Visual Archive"
        title="Our Construction & Architectural Gallery"
        subtitle="Filter by architectural category or project, click any frame to open the full-screen lightbox with keyboard and touch swipe controls."
        imageUrl="/images/modern-villa.jpg"
        siteUrl={getSiteUrl(bundle.website)}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Our Gallery', href: '/gallery' },
        ]}
      />

      <section className="py-16 lg:py-24 bg-[var(--brand-light)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <GalleryShowcase
            categories={gallery.categories}
            images={gallery.images}
            showProjectFilter
          />
        </div>
      </section>
    </>
  );
}
