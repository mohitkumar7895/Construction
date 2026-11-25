import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { queryOne } from '@/lib/db';
import { getPageWithSections, getSeoForEntity, getSiteBundle } from '@/services/site-data';
import { buildPageMetadata, getSiteUrl } from '@/lib/seo';
import { InnerPageHero } from '@/components/website/InnerPageHero';
import { SafeHtml } from '@/components/shared/SafeHtml';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [bundle, pageData, seo] = await Promise.all([
    getSiteBundle(),
    getPageWithSections(slug),
    getSeoForEntity('page', slug),
  ]);
  if (!pageData) return { title: 'Page Not Found' };

  return buildPageMetadata({
    seo,
    fallbackTitle: pageData.page.title,
    fallbackDescription: pageData.page.hero_subtitle || pageData.page.title,
    path: `/${slug}`,
    website: bundle.website,
  });
}

export default async function CustomDynamicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Check dynamic SEO redirects table first
  const redir = await queryOne<{ destination_path: string }>(
    `SELECT destination_path FROM redirects WHERE source_path = ? AND is_active = 1 LIMIT 1`,
    [`/${slug}`]
  ).catch(() => null);
  if (redir?.destination_path) {
    redirect(redir.destination_path);
  }

  const [bundle, pageData] = await Promise.all([getSiteBundle(), getPageWithSections(slug)]);
  if (!pageData) notFound();

  const { page, sections } = pageData;

  return (
    <>
      <InnerPageHero
        title={page.hero_title || page.title}
        subtitle={page.hero_subtitle}
        imageUrl={page.hero_image_url || '/images/hero-duplex.jpg'}
        siteUrl={getSiteUrl(bundle.website)}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: page.title, href: `/${page.slug}` },
        ]}
      />

      {page.content && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <SafeHtml html={page.content} />
          </div>
        </section>
      )}

      {sections.map((sec) => (
        <section
          key={sec.id}
          style={{ backgroundColor: sec.background_color || '#F8F9FB' }}
          className="py-16 border-t border-slate-200/60"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {sec.subheading && (
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-secondary)] mb-2">
                {sec.subheading}
              </p>
            )}
            {sec.heading && (
              <h2 className="text-3xl font-bold text-[var(--brand-primary)] mb-4">
                {sec.heading}
              </h2>
            )}
            {sec.image_url && (
              <img
                src={sec.image_url}
                alt={sec.heading || page.title}
                loading="lazy"
                className="w-full max-h-[480px] object-cover rounded-2xl mb-6"
              />
            )}
            {sec.description && <SafeHtml html={sec.description} />}
            {sec.button_text && sec.button_link && (
              <div className="mt-6">
                <Link
                  href={sec.button_link}
                  className="inline-flex items-center px-6 py-3 rounded-[var(--brand-radius)] bg-[var(--brand-secondary)] text-[#0B0F14] font-bold text-sm"
                >
                  {sec.button_text}
                </Link>
              </div>
            )}
          </div>
        </section>
      ))}
    </>
  );
}
