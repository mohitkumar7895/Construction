'use client';

import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ThemeAnimationsPanel({
  initialTab = 'theme',
}: {
  initialTab?: 'theme' | 'animations';
}) {
  const [tab, setTab] = useState<'theme' | 'animations'>(initialTab);
  const [theme, setTheme] = useState<any>({
    primary_color: '#111827',
    secondary_color: '#F5B301',
    dark_bg_color: '#0B0F14',
    light_bg_color: '#F8F9FB',
    surface_color: '#FFFFFF',
    muted_text_color: '#64748B',
    heading_font: 'Space Grotesk',
    body_font: 'Inter',
    border_radius: '0.5rem',
    header_style: 'transparent-overlay',
  });
  const [anim, setAnim] = useState<any>({
    animations_enabled: 1,
    smooth_scroll_enabled: 1,
    parallax_enabled: 1,
    hero_animations_enabled: 1,
    project_animations_enabled: 1,
    hover_effects_enabled: 1,
    mobile_animations_enabled: 0,
    animation_style: 'cinematic',
    duration_multiplier: 1.0,
    intensity: 'medium',
  });
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    void Promise.all([
      fetch('/api/admin/theme').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/admin/animations').then((r) => (r.ok ? r.json() : null)),
    ]).then(([t, a]) => {
      if (t?.theme) setTheme(t.theme);
      if (a?.animations)
        setAnim({
          ...a.animations,
          duration_multiplier: Number(a.animations.duration_multiplier || 1),
        });
    });
  }, []);

  const saveTheme = async () => {
    const res = await fetch('/api/admin/theme', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(theme),
    });
    setMsg(res.ok ? 'Theme palette & typography saved to MySQL!' : 'Failed to update theme.');
  };

  const saveAnimations = async () => {
    const res = await fetch('/api/admin/animations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...anim,
        duration_multiplier: Number(anim.duration_multiplier),
      }),
    });
    setMsg(res.ok ? 'GSAP animation controls saved to MySQL!' : 'Failed to update animations.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {tab === 'theme' ? 'Theme & Brand Palette Studio' : 'GSAP Animation Controls'}
          </h1>
          <p className="text-sm text-slate-500">
            {tab === 'theme'
              ? 'Customize architectural colors, typography, and surface geometry'
              : 'Configure GSAP ScrollTrigger, Lenis smooth scrolling, parallax, and mobile performance'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab('theme')}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer ${
              tab === 'theme' ? 'bg-[#0B0F14] text-[var(--brand-secondary)]' : 'bg-white border border-slate-200'
            }`}
          >
            Theme Settings
          </button>
          <button
            type="button"
            onClick={() => setTab('animations')}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer ${
              tab === 'animations' ? 'bg-[#0B0F14] text-[var(--brand-secondary)]' : 'bg-white border border-slate-200'
            }`}
          >
            GSAP Animations
          </button>
        </div>
      </div>

      {msg && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-semibold text-emerald-800">
          {msg}
        </div>
      )}

      {tab === 'theme' ? (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(
              [
                ['primary_color', 'Primary Color (Deep Charcoal)'],
                ['secondary_color', 'Secondary Accent (Construction Gold)'],
                ['dark_bg_color', 'Dark Section Background'],
                ['light_bg_color', 'Light Section Background'],
                ['surface_color', 'Card Surface Color'],
                ['muted_text_color', 'Muted Gray Text'],
              ] as [string, string][]
            ).map(([key, label]) => (
              <div key={key} className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-slate-600">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme[key] || '#111827'}
                    onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                    className="h-10 w-14 rounded border cursor-pointer"
                  />
                  <input
                    value={theme[key] || ''}
                    onChange={(e) => setTheme({ ...theme, [key]: e.target.value })}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Heading Font</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={theme.heading_font}
                onChange={(e) => setTheme({ ...theme, heading_font: e.target.value })}
              >
                <option value="Space Grotesk">Space Grotesk</option>
                <option value="Manrope">Manrope</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Body Font</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={theme.body_font}
                onChange={(e) => setTheme({ ...theme, body_font: e.target.value })}
              >
                <option value="Inter">Inter</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Border Radius</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={theme.border_radius}
                onChange={(e) => setTheme({ ...theme, border_radius: e.target.value })}
              >
                <option value="0.25rem">Sharp Architectural (0.25rem)</option>
                <option value="0.5rem">Modern Precision (0.5rem)</option>
                <option value="0.75rem">Soft Contemporary (0.75rem)</option>
              </select>
            </div>
          </div>

          <Button onClick={saveTheme}>
            <Save className="w-4 h-4" /> Save Theme Settings
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            {(
              [
                ['animations_enabled', 'Master Animations Enabled'],
                ['smooth_scroll_enabled', 'Lenis Smooth Scrolling'],
                ['parallax_enabled', 'Hero & Section Parallax'],
                ['hero_animations_enabled', 'Cinematic Hero Entrance'],
                ['project_animations_enabled', 'Project Grid Reveal'],
                ['hover_effects_enabled', 'Magnetic CTA & Hover Effects'],
                ['mobile_animations_enabled', 'Enable Animations on Mobile'],
              ] as [string, string][]
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50"
              >
                <span className="font-medium text-slate-800 text-xs">{label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(anim[key])}
                  onChange={(e) => setAnim({ ...anim, [key]: e.target.checked ? 1 : 0 })}
                  className="h-4 w-4 accent-[#111827]"
                />
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Animation Style</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={anim.animation_style}
                onChange={(e) => setAnim({ ...anim, animation_style: e.target.value })}
              >
                <option value="cinematic">Cinematic</option>
                <option value="architectural">Architectural Precision</option>
                <option value="minimal">Minimal Subtle</option>
                <option value="dynamic">Dynamic Expressive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Duration Multiplier ({anim.duration_multiplier}x)
              </label>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.1}
                value={anim.duration_multiplier}
                onChange={(e) => setAnim({ ...anim, duration_multiplier: Number(e.target.value) })}
                className="w-full mt-2 accent-[#F5B301]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Motion Intensity</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={anim.intensity}
                onChange={(e) => setAnim({ ...anim, intensity: e.target.value })}
              >
                <option value="subtle">Subtle</option>
                <option value="medium">Medium</option>
                <option value="bold">Bold</option>
              </select>
            </div>
          </div>

          <Button onClick={saveAnimations}>
            <Save className="w-4 h-4" /> Save Animation Controls
          </Button>
        </div>
      )}
    </div>
  );
}
