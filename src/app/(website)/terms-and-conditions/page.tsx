import React from 'react';
import type { Metadata } from 'next';
import { getPageWithSections, getSeoForEntity, getSiteBundle } from '@/services/site-data';
import { buildPageMetadata, getSiteUrl } from '@/lib/seo';
import { InnerPageHero } from '@/components/website/InnerPageHero';
import { SafeHtml } from '@/components/shared/SafeHtml';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const [bundle, seo] = await Promise.all([
    getSiteBundle(),
    getSeoForEntity('page', 'terms-and-conditions'),
  ]);
  return buildPageMetadata({
    seo,
    fallbackTitle: 'Terms and Conditions',
    fallbackDescription: 'Terms and Conditions governing website use and construction quotations.',
    path: '/terms-and-conditions',
    website: bundle.website,
  });
}

export default async function TermsPage() {
  const [bundle, pageData] = await Promise.all([
    getSiteBundle(),
    getPageWithSections('terms-and-conditions'),
  ]);

  const page = pageData?.page;

  return (
    <>
      <InnerPageHero
        eyebrow="Legal Documentation"
        title={page?.hero_title || 'Terms and Conditions'}
        subtitle={page?.hero_subtitle || 'Terms governing use of this website and quotations.'}
        imageUrl={page?.hero_image_url || '/images/architectural-planning.jpg'}
        siteUrl={getSiteUrl(bundle.website)}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Terms & Conditions', href: '/terms-and-conditions' },
        ]}
      />
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <SafeHtml
            html={
              page?.content ||
              '<p>Online inquiries and preliminary consultations are non-binding until a formal written agreement and BOQ are signed.</p>'
            }
          />
        </div>
      </section>
    </>
  );
}
