import React from 'react';
import type { Metadata } from 'next';
import {
  getPublishedServices,
  getSeoForEntity,
  getServiceCategories,
  getSiteBundle,
} from '@/services/site-data';
import { buildPageMetadata, getSiteUrl } from '@/lib/seo';
import { InnerPageHero } from '@/components/website/InnerPageHero';
import { ServicesExplorer } from '@/components/website/ServicesExplorer';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const [bundle, seo] = await Promise.all([
    getSiteBundle(),
    getSeoForEntity('page', 'services'),
  ]);
  return buildPageMetadata({
    seo,
    fallbackTitle: 'Construction Services',
    fallbackDescription:
      'Residential construction, commercial buildings, architectural planning, structural design, and turnkey contracting in Haldwani, Uttarakhand.',
    path: '/services',
    website: bundle.website,
  });
}

export default async function ServicesPage() {
  const [bundle, services, categories] = await Promise.all([
    getSiteBundle(),
    getPublishedServices(),
    getServiceCategories(),
  ]);

  return (
    <>
      <InnerPageHero
        eyebrow="Engineering & Contracting Capabilities"
        title="Our Construction Services"
        subtitle="Comprehensive residential, commercial, industrial, architectural planning, and turnkey building solutions tailored for Haldwani and Uttarakhand."
        imageUrl="/images/commercial-project.jpg"
        siteUrl={getSiteUrl(bundle.website)}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Services', href: '/services' },
        ]}
      />

      <section className="py-16 lg:py-24 bg-[var(--brand-light)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ServicesExplorer services={services} categories={categories} />
        </div>
      </section>
    </>
  );
}
