import type { Metadata } from 'next';
import type { ContactSettings, SeoMetadata, WebsiteSettings } from '@/types';

export function getSiteUrl(website?: WebsiteSettings | null): string {
  const raw = website?.domain_name || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return raw.replace(/\/+$/, '');
}

export function buildPageMetadata(params: {
  seo?: SeoMetadata | null;
  fallbackTitle: string;
  fallbackDescription: string;
  path: string;
  website?: WebsiteSettings | null;
  fallbackImage?: string;
}): Metadata {
  const siteUrl = getSiteUrl(params.website);
  const siteName = params.website?.site_name || 'Sartaj Construction';
  const title = params.seo?.meta_title || `${params.fallbackTitle} | ${siteName}`;
  const description = params.seo?.meta_description || params.fallbackDescription;
  const canonical = params.seo?.canonical_url || `${siteUrl}${params.path}`;
  const ogImage = params.seo?.og_image || params.fallbackImage || '/images/hero-duplex.jpg';
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  const index = params.seo ? Boolean(params.seo.robots_index) : true;
  const follow = params.seo ? Boolean(params.seo.robots_follow) : true;

  return {
    title,
    description,
    keywords: params.seo?.focus_keyword ? [params.seo.focus_keyword] : undefined,
    alternates: {
      canonical,
    },
    robots: {
      index,
      follow,
    },
    openGraph: {
      title: params.seo?.og_title || title,
      description: params.seo?.og_description || description,
      url: canonical,
      siteName,
      type: 'website',
      images: [{ url: fullOgImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: params.seo?.twitter_title || params.seo?.og_title || title,
      description: params.seo?.twitter_description || params.seo?.og_description || description,
      images: [params.seo?.twitter_image || fullOgImage],
    },
    verification: params.website?.google_search_console_code
      ? { google: params.website.google_search_console_code }
      : undefined,
  };
}

export function buildLocalBusinessJsonLd(
  website: WebsiteSettings,
  contact: ContactSettings
): Record<string, unknown> {
  const siteUrl = getSiteUrl(website);
  return {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    name: website.site_name,
    description: website.tagline || 'Construction and Infrastructure Services in Haldwani, Uttarakhand',
    url: siteUrl,
    telephone: contact.phone,
    email: contact.email,
    founder: {
      '@type': 'Person',
      name: contact.owner_name,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.address_line,
      addressLocality: contact.city,
      addressRegion: contact.state,
      postalCode: contact.pin_code,
      addressCountry: 'IN',
    },
    areaServed: ['Haldwani', 'Nainital', 'Uttarakhand'],
    openingHours: contact.working_hours || 'Mo-Sa 09:00-19:00',
  };
}

export function buildBreadcrumbJsonLd(
  siteUrl: string,
  items: { name: string; href: string }[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.href}`,
    })),
  };
}

export function buildServiceJsonLd(params: {
  siteUrl: string;
  companyName: string;
  title: string;
  description: string;
  slug: string;
  areaServed?: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: params.title,
    description: params.description,
    url: `${params.siteUrl}/services/${params.slug}`,
    provider: {
      '@type': 'GeneralContractor',
      name: params.companyName,
    },
    areaServed: params.areaServed || 'Haldwani, Nainital, Uttarakhand, India',
  };
}
