import React from 'react';
import { getSiteBundle } from '@/services/site-data';
import { AnimationProvider } from '@/components/animations/AnimationProvider';
import { Header } from '@/components/website/Header';
import { Footer } from '@/components/website/Footer';
import { FloatingActions } from '@/components/website/FloatingActions';
import { buildLocalBusinessJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bundle = await getSiteBundle();
  const localBusinessJsonLd = buildLocalBusinessJsonLd(bundle.website, bundle.contact);

  return (
    <AnimationProvider settings={bundle.animations}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <div className="min-h-screen flex flex-col">
        <Header bundle={bundle} />
        <main className="flex-1">{children}</main>
        <Footer bundle={bundle} />
        <FloatingActions contact={bundle.contact} />
      </div>
    </AnimationProvider>
  );
}
