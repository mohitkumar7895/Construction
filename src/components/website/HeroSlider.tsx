'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight, ChevronLeft, ChevronRight, MessageCircle, ShieldCheck } from 'lucide-react';
import type { ContactSettings, HeroSlide } from '@/types';
import { buildWhatsAppUrl, cn } from '@/lib/utils';
import { useAnimationConfig } from '@/components/animations/AnimationProvider';
import { MagneticWrapper } from '@/components/animations/GsapPrimitives';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function HeroSlider({
  slides,
  contact,
  companyName,
}: {
  slides: HeroSlide[];
  contact: ContactSettings;
  companyName: string;
}) {
  const activeSlides =
    slides.length > 0
      ? slides
      : [
          {
            id: 1,
            eyebrow: 'HALDWANI & UTTARAKHAND • ARCHITECTURAL CONSTRUCTION',
            heading: 'Building Your Vision. Creating Your Future.',
            description:
              'Delivering professional construction, engineering, architectural planning, and infrastructure solutions in Haldwani and across Uttarakhand.',
            image_url: '/images/hero-duplex.jpg',
            image_alt: 'Modern luxury duplex construction in Haldwani Uttarakhand',
            primary_cta_label: 'Explore Our Projects',
            primary_cta_link: '/projects',
            secondary_cta_label: 'Get a Free Consultation',
            secondary_cta_link: '/contact',
            show_whatsapp_cta: 1,
            overlay_opacity: 0.58,
            animation_preset: 'zoom-reveal',
            is_active: 1,
            display_order: 1,
          },
        ];

  const [current, setCurrent] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { shouldAnimate, settings, duration } = useAnimationConfig();

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(nextSlide, 7500);
    return () => clearInterval(timer);
  }, [activeSlides.length, nextSlide]);

  // Staggered cinematic headline entrance on slide change
  useGSAP(
    () => {
      if (!shouldAnimate || !settings.hero_animations_enabled || !contentRef.current) return;
      const items = contentRef.current.querySelectorAll('[data-hero-reveal]');
      gsap.fromTo(
        items,
        { y: 32, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: duration(0.85),
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        }
      );
    },
    { scope: heroRef, dependencies: [current, shouldAnimate, settings.hero_animations_enabled] }
  );

  // Subtle GPU-composited scroll parallax on hero background
  useGSAP(
    () => {
      if (!shouldAnimate || !settings.parallax_enabled || !bgRef.current || !heroRef.current) return;
      gsap.to(bgRef.current, {
        yPercent: 14,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    },
    { scope: heroRef, dependencies: [shouldAnimate, settings.parallax_enabled] }
  );

  const slide = activeSlides[current] || activeSlides[0];
  const whatsappUrl = buildWhatsAppUrl(contact.whatsapp_number, contact.whatsapp_default_message);

  return (
    <section
      ref={heroRef}
      aria-label="Hero showcase"
      className="relative min-h-[92vh] lg:min-h-[96vh] flex items-center bg-[#0B0F14] overflow-hidden pt-28 pb-20"
    >
      {/* Parallax Background Slides */}
      <div ref={bgRef} className="absolute inset-0 will-change-transform">
        {activeSlides.map((item, idx) => {
          const isActive = idx === current;
          return (
            <div
              key={item.id}
              aria-hidden={!isActive}
              className={cn(
                'absolute inset-0 transition-opacity duration-1000 ease-out',
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              )}
            >
              <img
                src={item.image_url}
                alt={item.image_alt || item.heading}
                fetchPriority={idx === 0 ? 'high' : 'low'}
                loading={idx === 0 ? 'eager' : 'lazy'}
                className={cn(
                  'w-full h-full object-cover transition-transform duration-[8000ms] ease-out',
                  isActive && shouldAnimate ? 'scale-105' : 'scale-100'
                )}
              />
            </div>
          );
        })}

        {/* Architectural Dark Gradient & Blueprint Overlay */}
        <div
          className="absolute inset-0 z-20"
          style={{
            background: `linear-gradient(105deg, rgba(11,15,20,${Math.min(
              0.92,
              Number(slide.overlay_opacity || 0.58) + 0.25
            )}) 0%, rgba(11,15,20,${Number(slide.overlay_opacity || 0.58)}) 52%, rgba(11,15,20,0.45) 100%)`,
          }}
        />
        <div className="bg-blueprint-grid absolute inset-0 z-20 opacity-35 pointer-events-none" />
      </div>

      {/* Hero Foreground Content */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div ref={contentRef} className="max-w-3xl">
          <div
            data-hero-reveal
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-secondary)] mb-6"
          >
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>{slide.eyebrow || `${companyName} • Haldwani, Uttarakhand`}</span>
          </div>

          <h1
            data-hero-reveal
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-[1.06] tracking-tight"
          >
            {slide.heading}
          </h1>

          {slide.description && (
            <p
              data-hero-reveal
              className="mt-6 text-base sm:text-lg lg:text-xl text-slate-200/90 leading-relaxed max-w-2xl"
            >
              {slide.description}
            </p>
          )}

          {/* Action CTAs */}
          <div data-hero-reveal className="mt-9 flex flex-wrap items-center gap-3.5">
            {slide.primary_cta_label && (
              <MagneticWrapper>
                <Link
                  href={slide.primary_cta_link || '/projects'}
                  className="inline-flex items-center gap-2.5 px-7 py-4 rounded-[var(--brand-radius)] bg-[var(--brand-secondary)] text-[#0B0F14] font-bold text-sm uppercase tracking-wider hover:brightness-105 transition-all shadow-lg"
                >
                  <span>{slide.primary_cta_label}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticWrapper>
            )}

            {slide.secondary_cta_label && (
              <MagneticWrapper>
                <Link
                  href={slide.secondary_cta_link || '/contact'}
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-[var(--brand-radius)] border border-white/30 bg-white/10 backdrop-blur-md text-white font-semibold text-sm uppercase tracking-wider hover:bg-white/20 transition-all"
                >
                  <span>{slide.secondary_cta_label}</span>
                </Link>
              </MagneticWrapper>
            )}

            {Boolean(slide.show_whatsapp_cta) && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-4 rounded-[var(--brand-radius)] bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold text-sm tracking-wide transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Inquiry</span>
              </a>
            )}
          </div>

          {/* Subtle Location & Concept Disclaimer Bar */}
          <div
            data-hero-reveal
            className="mt-12 pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300"
          >
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span>
                <strong className="text-white">Leadership:</strong> {contact.owner_name}
              </span>
              <span>
                <strong className="text-white">Location:</strong> {contact.city}, {contact.district},{' '}
                {contact.state}
              </span>
              <span>
                <strong className="text-white">Direct Line:</strong> {contact.phone}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Architectural Concept &amp; Engineering Visualization
            </span>
          </div>
        </div>
      </div>

      {/* Slide Controls */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-7 right-4 sm:right-8 z-30 flex items-center gap-3">
          <div className="flex items-center gap-1.5 mr-2">
            {activeSlides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                onClick={() => setCurrent(idx)}
                className={cn(
                  'h-1.5 rounded-full transition-all cursor-pointer',
                  idx === current
                    ? 'w-9 bg-[var(--brand-secondary)]'
                    : 'w-2.5 bg-white/35 hover:bg-white/60'
                )}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={prevSlide}
            className="w-10 h-10 rounded-full border border-white/25 bg-black/30 backdrop-blur-md text-white hover:border-[var(--brand-secondary)] hover:text-[var(--brand-secondary)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={nextSlide}
            className="w-10 h-10 rounded-full border border-white/25 bg-black/30 backdrop-blur-md text-white hover:border-[var(--brand-secondary)] hover:text-[var(--brand-secondary)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </section>
  );
}
