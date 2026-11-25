'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import type { ServiceCategory, ServiceRecord } from '@/types';
import { DynamicIcon } from '@/components/shared/DynamicIcon';
import { cn } from '@/lib/utils';

export function ServicesExplorer({
  services,
  categories,
}: {
  services: ServiceRecord[];
  categories: ServiceCategory[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return services.filter((s) => {
      const catOk = selectedCategory === 'all' || s.category_slug === selectedCategory;
      const qOk =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.short_description.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [services, selectedCategory, search]);

  return (
    <div className="space-y-8">
      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer',
              selectedCategory === 'all'
                ? 'bg-[var(--brand-primary)] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            All Services ({services.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer',
                selectedCategory === cat.slug
                  ? 'bg-[var(--brand-primary)] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
            aria-label="Search construction services"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 focus:border-[var(--brand-secondary)] focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* Services Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-dashed border-slate-300 py-16 text-center text-slate-500">
          No services match your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="group rounded-2xl overflow-hidden bg-white border border-slate-200 hover:border-[var(--brand-secondary)] hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative h-56 overflow-hidden bg-slate-900">
                <img
                  src={service.featured_image || '/images/commercial-project.jpg'}
                  alt={service.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14]/80 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 w-10 h-10 rounded-lg bg-[var(--brand-secondary)] text-[#0B0F14] flex items-center justify-center shadow">
                  <DynamicIcon name={service.icon} className="w-5 h-5" />
                </div>
                {Boolean(service.is_featured) && (
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0B0F14]/80 text-[var(--brand-secondary)] text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    Featured
                  </span>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col">
                {service.category_name && (
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-secondary)] mb-1">
                    {service.category_name}
                  </span>
                )}
                <h2 className="text-xl font-bold text-slate-900 group-hover:text-[var(--brand-primary)]">
                  {service.title}
                </h2>
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed flex-1">
                  {service.short_description}
                </p>
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-800 group-hover:text-[var(--brand-secondary)]">
                  <span>Explore Service</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
