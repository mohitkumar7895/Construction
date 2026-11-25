'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ChevronLeft, ChevronRight, Expand, Images, Play, X } from 'lucide-react';
import type { GalleryCategory, GalleryImage } from '@/types';
import { cn } from '@/lib/utils';
import { useAnimationConfig } from '@/components/animations/AnimationProvider';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(Flip);
}

export function GalleryShowcase({
  categories,
  images,
  showProjectFilter = false,
  initialVisibleCount,
}: {
  categories: GalleryCategory[];
  images: GalleryImage[];
  showProjectFilter?: boolean;
  initialVisibleCount?: number;
}) {
  // Strictly deduplicate by normalized media_url so no duplicate image is ever displayed
  const uniqueImages = useMemo(() => {
    const seen = new Set<string>();
    const out: GalleryImage[] = [];
    for (const img of images) {
      const key = decodeURIComponent(img.media_url || '').trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(img);
    }
    return out;
  }, [images]);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeProject, setActiveProject] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState<number>(
    initialVisibleCount ?? uniqueImages.length
  );
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStartX = useRef<number | null>(null);
  const { shouldAnimate } = useAnimationConfig();

  const projectOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const img of uniqueImages) {
      if (img.project_id && img.project_title) {
        map.set(String(img.project_id), img.project_title);
      }
    }
    return Array.from(map.entries());
  }, [uniqueImages]);

  const filtered = useMemo(() => {
    return uniqueImages.filter((img) => {
      const matchCat = activeCategory === 'all' || img.category_slug === activeCategory;
      const matchProj =
        activeProject === 'all' || String(img.project_id || '') === activeProject;
      return matchCat && matchProj;
    });
  }, [uniqueImages, activeCategory, activeProject]);

  const displayed = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  const handleCategoryChange = (slug: string) => {
    if (initialVisibleCount) {
      setVisibleCount(initialVisibleCount);
    }
    if (!gridRef.current || !shouldAnimate || filtered.length > 36) {
      setActiveCategory(slug);
      return;
    }
    const state = Flip.getState(gridRef.current.querySelectorAll('[data-flip-card]'));
    setActiveCategory(slug);
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.45,
        ease: 'power2.inOut',
        stagger: 0.02,
        absolute: false,
        onEnter: (els) =>
          gsap.fromTo(els, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.35 }),
      });
    });
  };

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  };

  const closeLightbox = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog && dialog.open) {
      dialog.close();
    }
    setLightboxIndex(null);
  }, []);

  const showPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : (prev - 1 + filtered.length) % filtered.length
    );
  }, [filtered.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : (prev + 1) % filtered.length
    );
  }, [filtered.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, showPrev, showNext]);

  // Pointer-position light-dismiss fallback when closedby is unsupported
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || typeof HTMLDialogElement === 'undefined') return;
    if ('closedBy' in HTMLDialogElement.prototype) return;

    let pressedOutside = false;
    const isOutside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };
    const onDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };
    const onUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e)) dialog.close();
    };
    dialog.addEventListener('pointerdown', onDown);
    dialog.addEventListener('pointerup', onUp);
    return () => {
      dialog.removeEventListener('pointerdown', onDown);
      dialog.removeEventListener('pointerup', onUp);
    };
  }, []);

  const currentItem = lightboxIndex !== null ? filtered[lightboxIndex] : null;
  const remaining = Math.max(0, filtered.length - displayed.length);

  return (
    <div>
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Gallery categories">
          <button
            type="button"
            onClick={() => handleCategoryChange('all')}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer',
              activeCategory === 'all'
                ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-[var(--brand-secondary)]'
            )}
          >
            All Photos ({uniqueImages.length})
          </button>
          {categories.map((cat) => {
            const count = uniqueImages.filter((i) => i.category_slug === cat.slug).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.slug)}
                className={cn(
                  'px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer',
                  activeCategory === cat.slug
                    ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-[var(--brand-secondary)]'
                )}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {showProjectFilter && projectOptions.length > 0 && (
          <select
            aria-label="Filter gallery by project"
            value={activeProject}
            onChange={(e) => setActiveProject(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 focus:border-[var(--brand-secondary)] focus:outline-none"
          >
            <option value="all">All Projects</option>
            {projectOptions.map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Responsive Masonry Layout */}
      {displayed.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500 text-sm">
          No gallery items match this filter yet.
        </div>
      ) : (
        <>
          <div
            ref={gridRef}
            className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4"
          >
            {displayed.map((item, idx) => (
              <div
                key={item.id}
                data-flip-card
                className="break-inside-avoid group relative overflow-hidden rounded-xl bg-slate-900 shadow-sm border border-slate-200/70"
              >
                <button
                  type="button"
                  onClick={() => openLightbox(idx)}
                  className="block w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-secondary)]"
                >
                  <div className="relative overflow-hidden">
                    {item.media_type === 'video' ? (
                      <div className="relative aspect-video bg-slate-900">
                        <video
                          src={item.media_url}
                          poster={item.thumbnail_url || undefined}
                          preload="none"
                          muted
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                          <span className="w-12 h-12 rounded-full bg-[var(--brand-secondary)] text-[#0B0F14] flex items-center justify-center shadow-lg">
                            <Play className="w-5 h-5 ml-0.5" />
                          </span>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.media_url}
                        alt={item.alt_text || item.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}

                    {/* Subtle Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14]/90 via-[#0B0F14]/20 to-transparent opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        {item.category_name && (
                          <span className="px-2 py-0.5 rounded bg-[#0B0F14]/75 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-[var(--brand-secondary)]">
                            {item.category_name}
                          </span>
                        )}
                        <span className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm text-white flex items-center justify-center ml-auto">
                          <Expand className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      <div>
                        <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                          {item.title}
                        </p>
                        {item.caption && (
                          <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
                            {item.caption}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>

          {remaining > 0 && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 24)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--brand-radius)] bg-[var(--brand-primary)] text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Images className="w-4 h-4 text-[var(--brand-secondary)]" />
                <span>Load More Photos ({remaining} more)</span>
              </button>
              <button
                type="button"
                onClick={() => setVisibleCount(filtered.length)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-[var(--brand-radius)] bg-[var(--brand-secondary)] text-[#0B0F14] text-xs font-bold uppercase tracking-wider hover:brightness-105 transition-all cursor-pointer"
              >
                <span>Show All {filtered.length} Photos</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Native Accessible Modal Lightbox (<dialog>) */}
      <dialog
        ref={dialogRef}
        {...({ closedby: 'any' } as any)}
        aria-label={currentItem ? currentItem.title : 'Gallery preview'}
        onClose={() => {
          if (dialogRef.current) dialogRef.current.returnValue = '';
          setLightboxIndex(null);
        }}
        onTouchStart={(e) => {
          touchStartX.current = e.changedTouches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return;
          const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
          if (delta > 50) showPrev();
          if (delta < -50) showNext();
          touchStartX.current = null;
        }}
        className="w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl"
      >
        {currentItem && (
          <div className="bg-[#0B0F14] text-white border border-white/15 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
              <div>
                <h1 className="text-base font-bold text-white">{currentItem.title}</h1>
                <p className="text-xs text-slate-400">
                  {(lightboxIndex ?? 0) + 1} / {filtered.length}
                  {currentItem.category_name ? ` • ${currentItem.category_name}` : ''}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close lightbox"
                onClick={closeLightbox}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative bg-black flex items-center justify-center max-h-[74vh] overflow-hidden">
              {currentItem.media_type === 'video' ? (
                <video
                  src={currentItem.media_url}
                  controls
                  autoPlay
                  className="max-h-[74vh] w-auto"
                />
              ) : (
                <img
                  src={currentItem.media_url}
                  alt={currentItem.alt_text || currentItem.title}
                  className="max-h-[74vh] w-auto object-contain"
                />
              )}

              {filtered.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={showPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-[var(--brand-secondary)] hover:text-[#0B0F14] text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={showNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-[var(--brand-secondary)] hover:text-[#0B0F14] text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {currentItem.caption && (
              <div className="px-5 py-3.5 text-sm text-slate-300 border-t border-white/10">
                {currentItem.caption}
              </div>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
