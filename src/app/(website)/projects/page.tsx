import React from 'react';
import type { Metadata } from 'next';
import {
  getProjectCategories,
  getPublishedProjects,
  getSeoForEntity,
  getSiteBundle,
} from '@/services/site-data';
import { buildPageMetadata, getSiteUrl } from '@/lib/seo';
import { InnerPageHero } from '@/components/website/InnerPageHero';
import { ProjectsExplorer } from '@/components/website/ProjectsExplorer';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const [bundle, seo] = await Promise.all([
    getSiteBundle(),
    getSeoForEntity('page', 'projects'),
  ]);
  return buildPageMetadata({
    seo,
    fallbackTitle: 'Projects Portfolio',
    fallbackDescription:
      'Explore residential duplexes, villas, commercial centers, renovation concepts, and infrastructure projects across Haldwani and Uttarakhand.',
    path: '/projects',
    website: bundle.website,
  });
}

export default async function ProjectsPage() {
  const [bundle, projects, categories] = await Promise.all([
    getSiteBundle(),
    getPublishedProjects(),
    getProjectCategories(),
  ]);

  return (
    <>
      <InnerPageHero
        eyebrow="Construction Portfolio"
        title="Projects & Architectural Concepts"
        subtitle="Browse our residential duplexes, luxury hillside villas, commercial complexes, industrial warehouses, and civil infrastructure capabilities."
        imageUrl="/images/residential-duplex.jpg"
        siteUrl={getSiteUrl(bundle.website)}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Projects', href: '/projects' },
        ]}
      />

      <section className="py-16 lg:py-24 bg-[var(--brand-light)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ProjectsExplorer projects={projects} categories={categories} />
        </div>
      </section>
    </>
  );
}
