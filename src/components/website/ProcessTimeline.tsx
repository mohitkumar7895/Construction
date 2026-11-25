'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { ProcessStep } from '@/types';
import { DynamicIcon } from '@/components/shared/DynamicIcon';
import { useAnimationConfig } from '@/components/animations/AnimationProvider';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export function ProcessTimeline({ steps }: { steps: ProcessStep[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const { shouldAnimate, duration } = useAnimationConfig();

  useGSAP(
    () => {
      if (!shouldAnimate || !wrapRef.current) return;

      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            transformOrigin: 'left center',
            duration: duration(1.1),
            ease: 'power2.out',
            scrollTrigger: {
              trigger: wrapRef.current,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }

      gsap.from(wrapRef.current.querySelectorAll('[data-step-card]'), {
        y: 30,
        opacity: 0,
        duration: duration(0.65),
        stagger: 0.09,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: {
          trigger: wrapRef.current,
          start: 'top 82%',
          once: true,
        },
      });
    },
    { scope: wrapRef, dependencies: [shouldAnimate] }
  );

  return (
    <div ref={wrapRef} className="relative">
      <div
        ref={lineRef}
        className="hidden lg:block absolute top-8 left-6 right-6 h-0.5 bg-gradient-to-r from-[var(--brand-secondary)] via-[var(--brand-secondary)]/60 to-white/15"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((step) => (
          <div
            key={step.id}
            data-step-card
            className="relative rounded-xl bg-white/5 border border-white/10 p-6 hover:border-[var(--brand-secondary)]/60 transition-colors"
          >
            <div className="flex items-center justify-between mb-5">
              <span className="w-11 h-11 rounded-lg bg-[var(--brand-secondary)] text-[#0B0F14] flex items-center justify-center shadow-md">
                <DynamicIcon name={step.icon} className="w-5 h-5" />
              </span>
              <span className="text-2xl font-extrabold text-white/20 font-mono">
                {step.step_number}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{step.title}</h3>
            <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
