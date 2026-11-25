'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useAnimationConfig } from './AnimationProvider';
import { cn } from '@/lib/utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function RevealSection({
  children,
  className,
  staggerSelector,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  staggerSelector?: string;
  delay?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { shouldAnimate, duration, yOffset, settings } = useAnimationConfig();

  useGSAP(
    () => {
      if (!shouldAnimate || !containerRef.current) return;

      const ease =
        settings.animation_style === 'architectural'
          ? 'power4.out'
          : settings.animation_style === 'dynamic'
            ? 'back.out(1.2)'
            : 'power3.out';

      const targets = staggerSelector
        ? containerRef.current.querySelectorAll(staggerSelector)
        : containerRef.current;

      if (staggerSelector && (targets as NodeListOf<Element>).length === 0) return;

      gsap.from(targets, {
        y: yOffset,
        opacity: 0,
        duration: duration(0.75),
        delay,
        stagger: staggerSelector ? 0.08 : 0,
        ease,
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 86%',
          once: true,
        },
      });
    },
    { scope: containerRef, dependencies: [shouldAnimate, yOffset, settings.animation_style] }
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

export function AnimatedCounter({
  value,
  suffix = '+',
  className,
}: {
  value: number;
  suffix?: string | null;
  className?: string;
}) {
  const numRef = useRef<HTMLSpanElement>(null);
  const { shouldAnimate, duration } = useAnimationConfig();

  useGSAP(
    () => {
      if (!shouldAnimate || !numRef.current) return;
      const obj = { val: 0 };
      gsap.to(obj, {
        val: value,
        duration: duration(1.6),
        ease: 'power2.out',
        scrollTrigger: {
          trigger: numRef.current,
          start: 'top 88%',
          once: true,
        },
        onUpdate: () => {
          if (numRef.current) {
            numRef.current.textContent = `${Math.round(obj.val).toLocaleString('en-IN')}${suffix || ''}`;
          }
        },
      });
    },
    { dependencies: [shouldAnimate, value, suffix] }
  );

  return (
    <span ref={numRef} className={className}>
      {value.toLocaleString('en-IN')}
      {suffix || ''}
    </span>
  );
}

export function MagneticWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { shouldAnimate, isMobile, settings } = useAnimationConfig();
  const enabled = shouldAnimate && !isMobile && Boolean(settings.hover_effects_enabled);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
    gsap.to(ref.current, { x, y, duration: 0.3, ease: 'power2.out' });
  };

  const handleLeave = () => {
    if (!enabled || !ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.45, ease: 'elastic.out(1, 0.4)' });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={cn('inline-block', className)}
    >
      {children}
    </div>
  );
}
