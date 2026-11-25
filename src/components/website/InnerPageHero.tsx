import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { buildBreadcrumbJsonLd } from '@/lib/seo';

interface BreadcrumbItem {
  name: string;
  href: string;
}

export function InnerPageHero({
  eyebrow,
  title,
  subtitle,
  imageUrl = '/images/hero-duplex.jpg',
  breadcrumbs,
  siteUrl = 'http://localhost:3000',
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  breadcrumbs: BreadcrumbItem[];
  siteUrl?: string;
}) {
  const jsonLd = buildBreadcrumbJsonLd(siteUrl, breadcrumbs);

  return (
    <section className="relative bg-[#0B0F14] pt-36 pb-20 lg:pt-40 lg:pb-24 overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {imageUrl && (
        <div className="absolute inset-0">
          <img
            src={imageUrl}
            alt={title}
            fetchPriority="high"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F14] via-[#0B0F14]/85 to-[#0B0F14]/65" />
          <div className="bg-blueprint-grid absolute inset-0 opacity-35 pointer-events-none" />
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <li key={crumb.href} className="inline-flex items-center gap-2">
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
                  {isLast ? (
                    <span className="text-[var(--brand-secondary)] font-semibold">{crumb.name}</span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-white transition-colors">
                      {crumb.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-secondary)] mb-3">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-4xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
