'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';
import type { AnimationSettings } from '@/types';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, Flip);
}

interface AnimationContextValue {
  settings: AnimationSettings;
  shouldAnimate: boolean;
  isReducedMotion: boolean;
  isMobile: boolean;
  duration: (base: number) => number;
  yOffset: number;
}

const AnimationContext = createContext<AnimationContextValue | null>(null);

export function AnimationProvider({
  settings,
  children,
}: {
  settings: AnimationSettings;
  children: React.ReactNode;
}) {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqMobile = window.matchMedia('(max-width: 767px)');

    const sync = () => {
      setIsReducedMotion(mqMotion.matches);
      setIsMobile(mqMobile.matches);
    };
    sync();

    mqMotion.addEventListener('change', sync);
    mqMobile.addEventListener('change', sync);
    return () => {
      mqMotion.removeEventListener('change', sync);
      mqMobile.removeEventListener('change', sync);
    };
  }, []);

  const shouldAnimate = useMemo(() => {
    if (!settings.animations_enabled) return false;
    if (isReducedMotion) return false;
    if (isMobile && !settings.mobile_animations_enabled) return false;
    return true;
  }, [settings.animations_enabled, settings.mobile_animations_enabled, isReducedMotion, isMobile]);

  // Lenis Smooth Scroll synchronized with GSAP ticker
  useEffect(() => {
    if (!shouldAnimate || !settings.smooth_scroll_enabled || isMobile) return;

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, [shouldAnimate, settings.smooth_scroll_enabled, isMobile]);

  const value = useMemo<AnimationContextValue>(() => {
    const mult = Number(settings.duration_multiplier) || 1;
    const yOffset =
      settings.intensity === 'subtle' ? 20 : settings.intensity === 'bold' ? 56 : 36;

    return {
      settings,
      shouldAnimate,
      isReducedMotion,
      isMobile,
      duration: (base: number) => Math.max(0.2, base * mult),
      yOffset,
    };
  }, [settings, shouldAnimate, isReducedMotion, isMobile]);

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimationConfig(): AnimationContextValue {
  const ctx = useContext(AnimationContext);
  if (!ctx) {
    return {
      settings: {
        id: 1,
        animations_enabled: 1,
        smooth_scroll_enabled: 1,
        parallax_enabled: 1,
        hero_animations_enabled: 1,
        project_animations_enabled: 1,
        hover_effects_enabled: 1,
        mobile_animations_enabled: 0,
        animation_style: 'cinematic',
        duration_multiplier: 1,
        intensity: 'medium',
      },
      shouldAnimate: true,
      isReducedMotion: false,
      isMobile: false,
      duration: (b) => b,
      yOffset: 36,
    };
  }
  return ctx;
}
