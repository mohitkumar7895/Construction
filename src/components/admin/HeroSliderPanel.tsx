'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import type { HeroSlide } from '@/types';
import { Button } from '@/components/ui/Button';

export function HeroSliderPanel() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [editing, setEditing] = useState<Partial<HeroSlide> | null>(null);

  const load = async () => {
    const res = await fetch('/api/admin/hero-slides');
    if (res.ok) {
      const json = await res.json();
      setSlides(json.slides || []);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.heading || !editing?.image_url) return;
    const isEdit = Boolean(editing.id);
    const res = await fetch(
      isEdit ? `/api/admin/hero-slides/${editing.id}` : '/api/admin/hero-slides',
      {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      }
    );
    if (res.ok) {
      setEditing(null);
      await load();
    }
  };

  const inputCls = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hero Slider Management</h1>
          <p className="text-sm text-slate-500">Manage full-width cinematic hero slides, headlines, and CTAs</p>
        </div>
        <Button
          size="sm"
          onClick={() =>
            setEditing({
              eyebrow: 'HALDWANI & UTTARAKHAND',
              heading: '',
              description: '',
              image_url: '/images/hero-duplex.jpg',
              primary_cta_label: 'Explore Our Projects',
              primary_cta_link: '/projects',
              secondary_cta_label: 'Get a Free Consultation',
              secondary_cta_link: '/contact',
              show_whatsapp_cta: 1,
              overlay_opacity: 0.58,
              is_active: 1,
              display_order: slides.length + 1,
            })
          }
        >
          <Plus className="w-4 h-4" /> Add Hero Slide
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {slides.map((slide) => (
          <div key={slide.id} className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
            <div className="aspect-[16/9] bg-slate-900 relative">
              <img src={slide.image_url} alt={slide.heading} className="w-full h-full object-cover" />
              <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/75 text-white text-[10px] font-bold uppercase">
                {slide.is_active ? 'Active' : 'Hidden'}
              </span>
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-bold text-slate-900 line-clamp-1">{slide.heading}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{slide.description}</p>
              <div className="pt-2 flex items-center justify-between">
                <Button size="sm" variant="outline" onClick={() => setEditing(slide)}>
                  Edit Slide
                </Button>
                <button
                  type="button"
                  onClick={async () => {
                    await fetch(`/api/admin/hero-slides/${slide.id}`, { method: 'DELETE' });
                    await load();
                  }}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSave} className="w-full max-w-xl rounded-2xl bg-white p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">{editing.id ? 'Edit Hero Slide' : 'New Hero Slide'}</h2>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Eyebrow Label</label>
              <input
                className={inputCls}
                value={editing.eyebrow || ''}
                onChange={(e) => setEditing({ ...editing, eyebrow: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Headline *</label>
              <input
                required
                className={inputCls}
                value={editing.heading || ''}
                onChange={(e) => setEditing({ ...editing, heading: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Description</label>
              <textarea
                rows={3}
                className={inputCls}
                value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Background Image URL *</label>
              <input
                required
                className={inputCls}
                value={editing.image_url || ''}
                onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Primary CTA Label</label>
                <input
                  className={inputCls}
                  value={editing.primary_cta_label || ''}
                  onChange={(e) => setEditing({ ...editing, primary_cta_label: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Primary CTA Link</label>
                <input
                  className={inputCls}
                  value={editing.primary_cta_link || ''}
                  onChange={(e) => setEditing({ ...editing, primary_cta_link: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Secondary CTA Label</label>
                <input
                  className={inputCls}
                  value={editing.secondary_cta_label || ''}
                  onChange={(e) => setEditing({ ...editing, secondary_cta_label: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Secondary CTA Link</label>
                <input
                  className={inputCls}
                  value={editing.secondary_cta_link || ''}
                  onChange={(e) => setEditing({ ...editing, secondary_cta_link: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center gap-5 text-xs font-semibold">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(editing.is_active)}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked ? 1 : 0 })}
                />
                Active
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(editing.show_whatsapp_cta)}
                  onChange={(e) => setEditing({ ...editing, show_whatsapp_cta: e.target.checked ? 1 : 0 })}
                />
                Show WhatsApp CTA
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                <Save className="w-3.5 h-3.5" /> Save Slide
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
