'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ChevronLeft, ChevronRight, Expand, Play, X } from 'lucide-react';
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
}: {
  categories: GalleryCategory[];
  images: GalleryImage[];
  showProjectFilter?: boolean;
}) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeProject, setActiveProject] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStartX = useRef<number | null>(null);
  const { shouldAnimate } = useAnimationConfig();

  const projectOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const img of images) {
      if (img.project_id && img.project_title) {
        map.set(String(img.project_id), img.project_title);
      }
    }
    return Array.from(map.entries());
  }, [images]);

  const filtered = useMemo(() => {
    return images.filter((img) => {
      const matchCat = activeCategory === 'all' || img.category_slug === activeCategory;
      const matchProj =
        activeProject === 'all' || String(img.project_id || '') === activeProject;
      return matchCat && matchProj;
    });
  }, [images, activeCategory, activeProject]);

  const handleCategoryChange = (slug: string) => {
    if (!gridRef.current || !shouldAnimate) {
      setActiveCategory(slug);
      return;
    }
    const state = Flip.getState(gridRef.current.querySelectorAll('[data-flip-card]'));
    setActiveCategory(slug);
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.45,
        ease: 'power2.inOut',
        stagger: 0.03,
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

  // Keyboard navigation in lightbox
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
            All ({images.length})
          </button>
          {categories.map((cat) => (
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
              {cat.name}
            </button>
          ))}
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
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500 text-sm">
          No gallery items match this filter yet.
        </div>
      ) : (
        <div
          ref={gridRef}
          className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5"
        >
          {filtered.map((item, idx) => (
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
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}

                  {/* Subtle Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14]/90 via-[#0B0F14]/20 to-transparent opacity-85 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                    <div className="flex items-center justify-between gap-2">
                      {item.category_name && (
                        <span className="px-2.5 py-1 rounded bg-[#0B0F14]/70 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-[var(--brand-secondary)]">
                          {item.category_name}
                        </span>
                      )}
                      <span className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm text-white flex items-center justify-center ml-auto">
                        <Expand className="w-4 h-4" />
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-white leading-snug">{item.title}</p>
                      {item.caption && (
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2">{item.caption}</p>
                      )}
                      {Boolean(item.is_concept) && (
                        <span className="inline-block mt-1.5 text-[10px] uppercase tracking-wider text-amber-300/90 font-semibold">
                          Architectural Concept Visual
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
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
                  {currentItem.is_concept ? ' • Architectural Concept Illustration' : ''}
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

            <div className="relative bg-black flex items-center justify-center max-h-[70vh] overflow-hidden">
              {currentItem.media_type === 'video' ? (
                <video
                  src={currentItem.media_url}
                  controls
                  autoPlay
                  className="max-h-[70vh] w-auto"
                />
              ) : (
                <img
                  src={currentItem.media_url}
                  alt={currentItem.alt_text || currentItem.title}
                  className="max-h-[70vh] w-auto object-contain"
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
