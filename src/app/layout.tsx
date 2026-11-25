import React from 'react';
import type { Metadata } from 'next';
import { Inter, Manrope, Space_Grotesk } from 'next/font/google';
import Script from 'next/script';
import { getSiteBundle, getSeoForEntity } from '@/services/site-data';
import { buildPageMetadata } from '@/lib/seo';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const [bundle, globalSeo] = await Promise.all([
    getSiteBundle(),
    getSeoForEntity('global', 'default'),
  ]);

  const base = buildPageMetadata({
    seo: globalSeo,
    fallbackTitle: bundle.website.site_name,
    fallbackDescription:
      bundle.website.tagline ||
      'Construction and Infrastructure Services in Haldwani, Uttarakhand.',
    path: '/',
    website: bundle.website,
  });

  const favicon =
    bundle.website.favicon_url && bundle.website.favicon_url !== '/logo.jpeg'
      ? bundle.website.favicon_url
      : '/icon.png';
  return {
    ...base,
    icons: {
      icon: [{ url: favicon, type: 'image/png' }, { url: '/logo-cropped.png', type: 'image/png' }],
      shortcut: favicon,
      apple: '/apple-icon.png',
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bundle = await getSiteBundle();
  const { theme, website } = bundle;

  const headingFontVar =
    theme.heading_font === 'Manrope'
      ? 'var(--font-manrope)'
      : 'var(--font-space-grotesk)';

  const cssVars = {
    '--brand-primary': theme.primary_color || '#111827',
    '--brand-secondary': theme.secondary_color || '#F5B301',
    '--brand-dark': theme.dark_bg_color || '#0B0F14',
    '--brand-light': theme.light_bg_color || '#F8F9FB',
    '--brand-surface': theme.surface_color || '#FFFFFF',
    '--brand-muted': theme.muted_text_color || '#64748B',
    '--brand-radius': theme.border_radius || '0.5rem',
    '--font-heading': headingFontVar,
    '--font-body': 'var(--font-inter)',
  } as React.CSSProperties;

  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${manrope.variable}`}
      style={cssVars}
    >
      <body className="min-h-screen bg-[var(--brand-light)] text-[var(--brand-primary)] antialiased selection:bg-[var(--brand-secondary)] selection:text-[var(--brand-dark)]">
        {children}
        {website.google_analytics_id ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${website.google_analytics_id}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${website.google_analytics_id}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
