'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Search } from 'lucide-react';
import type { ProjectCategory, ProjectRecord } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'upcoming', label: 'Upcoming' },
];

export function ProjectsExplorer({
  projects,
  categories,
}: {
  projects: ProjectRecord[];
  categories: ProjectCategory[];
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(9);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      const catOk = selectedCategory === 'all' || p.category_slug === selectedCategory;
      const statusOk = selectedStatus === 'all' || p.project_status === selectedStatus;
      const qOk =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q);
      return catOk && statusOk && qOk;
    });
  }, [projects, selectedCategory, selectedStatus, search]);

  const displayed = filtered.slice(0, visibleCount);

  return (
    <div className="space-y-8">
      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'px-3.5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors',
              selectedCategory === 'all'
                ? 'bg-[var(--brand-primary)] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={cn(
                'px-3.5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors',
                selectedCategory === cat.slug
                  ? 'bg-[var(--brand-primary)] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedStatus(opt.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors',
                  selectedStatus === opt.value
                    ? 'bg-[var(--brand-secondary)] text-[#0B0F14]'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects or location..."
              aria-label="Search projects"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-sm text-slate-900 focus:border-[var(--brand-secondary)] focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {displayed.length === 0 ? (
        <div className="rounded-2xl bg-white border border-dashed border-slate-300 py-16 text-center text-slate-500">
          No projects found matching your filter selection.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {displayed.map((project) => (
              <article
                key={project.id}
                className="group rounded-2xl overflow-hidden bg-white border border-slate-200 hover:border-[var(--brand-secondary)] hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <Link
                  href={`/projects/${project.slug}`}
                  className="relative block aspect-[16/11] overflow-hidden bg-slate-900"
                >
                  <img
                    src={project.featured_image || '/images/residential-duplex.jpg'}
                    alt={project.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2">
                    {project.category_name && (
                      <span className="px-2.5 py-1 rounded bg-[#0B0F14]/80 text-white text-[11px] font-bold uppercase tracking-wider">
                        {project.category_name}
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded bg-[var(--brand-secondary)] text-[#0B0F14] text-[11px] font-bold uppercase tracking-wider">
                      {project.project_status}
                    </span>
                  </div>
                  {Boolean(project.is_concept) && (
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-black/75 text-amber-300 text-[10px] font-semibold uppercase tracking-wider">
                      Architectural Concept Illustration
                    </span>
                  )}
                </Link>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-[var(--brand-secondary)]" />
                    <span>{project.location}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    <Link href={`/projects/${project.slug}`} className="hover:text-[var(--brand-primary)]">
                      {project.title}
                    </Link>
                  </h2>
                  <p className="mt-2.5 text-sm text-slate-600 line-clamp-3 flex-1">
                    {project.short_description}
                  </p>
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      {project.construction_area || 'Custom Area'}
                    </span>
                    <Link
                      href={`/projects/${project.slug}`}
                      className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-900 hover:text-[var(--brand-secondary)]"
                    >
                      <span>View Project</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {visibleCount < filtered.length && (
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="px-6 py-3 rounded-[var(--brand-radius)] bg-[var(--brand-primary)] text-white text-sm font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Load More Projects
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
