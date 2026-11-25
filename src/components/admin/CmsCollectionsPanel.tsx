'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type CollectionKey = 'team' | 'testimonials' | 'faqs' | 'statistics' | 'process_steps';

export function CmsCollectionsPanel({
  activeCollection,
}: {
  activeCollection: CollectionKey;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch(`/api/admin/cms?resource=${activeCollection}`);
    if (res.ok) {
      const json = await res.json();
      setItems(json.items || []);
    }
  };

  useEffect(() => {
    setEditing(null);
    setMsg(null);
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCollection]);

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const action = editing.id ? 'update' : 'create';
    const res = await fetch('/api/admin/cms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resource: activeCollection,
        action,
        id: editing.id,
        data: editing,
      }),
    });
    if (res.ok) {
      setEditing(null);
      setMsg('Saved and synced to live website.');
      await load();
    }
  };

  const deleteItem = async (id: number) => {
    await fetch('/api/admin/cms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource: activeCollection, action: 'delete', id }),
    });
    await load();
  };

  const defaultsByCollection: Record<CollectionKey, Record<string, any>> = {
    team: { name: '', designation: '', bio: '', photo_url: '/images/construction-team.jpg', status: 'published', display_order: items.length + 1 },
    testimonials: { client_name: '', designation: '', review: '', rating: 5, project_reference: '', status: 'published', display_order: items.length + 1 },
    faqs: { category: 'general', question: '', answer: '', status: 'published', display_order: items.length + 1 },
    statistics: { stat_key: '', label: '', value: 0, suffix: '+', icon: 'Award', is_visible: 0, display_order: items.length + 1 },
    process_steps: { step_number: `0${items.length + 1}`, title: '', description: '', icon: 'Compass', is_active: 1, display_order: items.length + 1 },
  };

  const titles: Record<CollectionKey, { title: string; subtitle: string }> = {
    team: { title: 'Team Management', subtitle: 'Manage leadership and engineering staff profiles' },
    testimonials: {
      title: 'Client Testimonials',
      subtitle: 'Publish only verified real client reviews (empty by default until added)',
    },
    faqs: { title: 'FAQ Management', subtitle: 'Manage frequently asked questions displayed on the website' },
    statistics: {
      title: 'Animated Statistics Counters',
      subtitle: 'Enter verified company numbers and enable visibility to display animated counters',
    },
    process_steps: {
      title: 'Construction Process Timeline',
      subtitle: 'Configure the step-by-step architectural & construction workflow',
    },
  };

  const inputCls = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{titles[activeCollection].title}</h1>
          <p className="text-sm text-slate-500">{titles[activeCollection].subtitle}</p>
        </div>
        <Button size="sm" onClick={() => setEditing(defaultsByCollection[activeCollection])}>
          <Plus className="w-4 h-4" /> Add New Item
        </Button>
      </div>

      {msg && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-800">
          {msg}
        </div>
      )}

      <div className="rounded-2xl bg-white border border-slate-200 divide-y divide-slate-100">
        {items.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400">
            No entries yet. Click &ldquo;Add New Item&rdquo; to publish verified content.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-sm font-bold text-slate-900">
                  {item.name || item.client_name || item.question || item.label || item.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                  {item.designation ||
                    item.review ||
                    item.answer ||
                    item.description ||
                    `Value: ${item.value}${item.suffix || ''} • ${item.is_visible ? 'Visible on site' : 'Hidden (enter real value & enable)'}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(item)}>
                  Edit
                </Button>
                <button
                  type="button"
                  onClick={() => void deleteItem(item.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={saveItem} className="w-full max-w-lg rounded-2xl bg-white p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">
              {editing.id ? 'Edit Entry' : 'Add Entry'}
            </h2>

            {activeCollection === 'team' && (
              <>
                <input required placeholder="Full Name" className={inputCls} value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                <input required placeholder="Designation" className={inputCls} value={editing.designation || ''} onChange={(e) => setEditing({ ...editing, designation: e.target.value })} />
                <input placeholder="Photo URL" className={inputCls} value={editing.photo_url || ''} onChange={(e) => setEditing({ ...editing, photo_url: e.target.value })} />
                <textarea rows={3} placeholder="Bio" className={inputCls} value={editing.bio || ''} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} />
              </>
            )}

            {activeCollection === 'testimonials' && (
              <>
                <input required placeholder="Client Name" className={inputCls} value={editing.client_name || ''} onChange={(e) => setEditing({ ...editing, client_name: e.target.value })} />
                <input placeholder="Designation / City" className={inputCls} value={editing.designation || ''} onChange={(e) => setEditing({ ...editing, designation: e.target.value })} />
                <input placeholder="Project Reference" className={inputCls} value={editing.project_reference || ''} onChange={(e) => setEditing({ ...editing, project_reference: e.target.value })} />
                <textarea required rows={3} placeholder="Verified Client Review" className={inputCls} value={editing.review || ''} onChange={(e) => setEditing({ ...editing, review: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" min={1} max={5} className={inputCls} value={editing.rating || 5} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} />
                  <select className={inputCls} value={editing.status || 'published'} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </>
            )}

            {activeCollection === 'faqs' && (
              <>
                <input placeholder="Category (general, pricing, turnkey...)" className={inputCls} value={editing.category || 'general'} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
                <input required placeholder="Question" className={inputCls} value={editing.question || ''} onChange={(e) => setEditing({ ...editing, question: e.target.value })} />
                <textarea required rows={4} placeholder="Answer" className={inputCls} value={editing.answer || ''} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} />
              </>
            )}

            {activeCollection === 'statistics' && (
              <>
                <input required placeholder="Label (e.g. Completed Projects)" className={inputCls} value={editing.label || ''} onChange={(e) => setEditing({ ...editing, label: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <input required type="number" min={0} placeholder="Real Verified Value" className={inputCls} value={editing.value ?? 0} onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) })} />
                  <input placeholder="Suffix (e.g. +)" className={inputCls} value={editing.suffix || '+'} onChange={(e) => setEditing({ ...editing, suffix: e.target.value })} />
                </div>
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input type="checkbox" checked={Boolean(editing.is_visible)} onChange={(e) => setEditing({ ...editing, is_visible: e.target.checked ? 1 : 0 })} />
                  Show counter publicly (requires value &gt; 0)
                </label>
              </>
            )}

            {activeCollection === 'process_steps' && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <input required placeholder="Step # (01)" className={inputCls} value={editing.step_number || ''} onChange={(e) => setEditing({ ...editing, step_number: e.target.value })} />
                  <input required placeholder="Step Title" className={`${inputCls} col-span-2`} value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                </div>
                <textarea required rows={3} placeholder="Step Description" className={inputCls} value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                <Save className="w-3.5 h-3.5" /> Save
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
