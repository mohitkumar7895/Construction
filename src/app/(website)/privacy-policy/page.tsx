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
    getSeoForEntity('page', 'privacy-policy'),
  ]);
  return buildPageMetadata({
    seo,
    fallbackTitle: 'Privacy Policy',
    fallbackDescription: 'Privacy Policy for inquiry data and website usage.',
    path: '/privacy-policy',
    website: bundle.website,
  });
}

export default async function PrivacyPolicyPage() {
  const [bundle, pageData] = await Promise.all([
    getSiteBundle(),
    getPageWithSections('privacy-policy'),
  ]);

  const page = pageData?.page;

  return (
    <>
      <InnerPageHero
        eyebrow="Legal Documentation"
        title={page?.hero_title || 'Privacy Policy'}
        subtitle={page?.hero_subtitle || 'How we handle and protect client inquiry information.'}
        imageUrl={page?.hero_image_url || '/images/architectural-planning.jpg'}
        siteUrl={getSiteUrl(bundle.website)}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Privacy Policy', href: '/privacy-policy' },
        ]}
      />
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <SafeHtml
            html={
              page?.content ||
              '<p>We respect your privacy and use inquiry details solely to respond to your construction consultation request.</p>'
            }
          />
        </div>
      </section>
    </>
  );
}
