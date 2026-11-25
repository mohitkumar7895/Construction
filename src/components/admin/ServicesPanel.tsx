'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import type { ServiceCategory, ServiceRecord } from '@/types';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function ServicesPanel() {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [editing, setEditing] = useState<Partial<ServiceRecord> | null>(null);
  const [newCat, setNewCat] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ServiceRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch('/api/admin/services');
    if (res.ok) {
      const json = await res.json();
      setServices(json.services || []);
      setCategories(json.categories || []);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.title) return;
    setError(null);
    const isEdit = Boolean(editing.id);
    const res = await fetch(
      isEdit ? `/api/admin/services/${editing.id}` : '/api/admin/services',
      {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editing,
          category_id: editing.category_id ? Number(editing.category_id) : null,
          display_order: Number(editing.display_order || 0),
        }),
      }
    );
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || 'Could not save service');
    } else {
      setEditing(null);
      await load();
    }
  };

  const addCategory = async () => {
    if (!newCat.trim()) return;
    await fetch('/api/admin/cms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resource: 'service_categories',
        action: 'create',
        data: { name: newCat.trim(), display_order: categories.length + 1 },
      }),
    });
    setNewCat('');
    await load();
  };

  const inputCls = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Construction Services &amp; Categories</h1>
          <p className="text-sm text-slate-500">Create, reorder, publish, and customize service detail pages</p>
        </div>
        <Button
          size="sm"
          onClick={() =>
            setEditing({
              title: '',
              slug: '',
              icon: 'Building2',
              short_description: '',
              detailed_content: '',
              featured_image: '/images/commercial-project.jpg',
              status: 'published',
              is_featured: 0,
              display_order: services.length + 1,
            })
          }
        >
          <Plus className="w-4 h-4" /> Add New Service
        </Button>
      </div>

      {/* Category Quick Bar */}
      <div className="rounded-xl bg-white border border-slate-200 p-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase text-slate-500 mr-2">Categories:</span>
        {categories.map((cat) => (
          <span
            key={cat.id}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-800"
          >
            {cat.name}
            <button
              type="button"
              onClick={async () => {
                await fetch('/api/admin/cms', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ resource: 'service_categories', action: 'delete', id: cat.id }),
                });
                await load();
              }}
              className="text-slate-400 hover:text-red-600 cursor-pointer"
            >
              ×
            </button>
          </span>
        ))}
        <div className="flex items-center gap-1.5 ml-auto">
          <input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="New category..."
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs"
          />
          <Button size="sm" variant="dark" onClick={addCategory}>
            Add
          </Button>
        </div>
      </div>

      {/* Services Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono">{s.display_order}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{s.title}</p>
                    <p className="text-slate-500 font-mono text-[11px]">/services/{s.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{s.category_name || 'Uncategorized'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        s.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(s)}>
                      Edit
                    </Button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(s)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSave} className="w-full max-w-2xl rounded-2xl bg-white p-6 space-y-4 shadow-2xl my-8">
            <h2 className="text-lg font-bold text-slate-900">
              {editing.id ? `Edit Service: ${editing.title}` : 'Create New Service'}
            </h2>
            {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Title *</label>
                <input
                  required
                  className={inputCls}
                  value={editing.title || ''}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">URL Slug</label>
                <input
                  className={inputCls}
                  placeholder="auto-generated if blank"
                  value={editing.slug || ''}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Category</label>
                <select
                  className={inputCls}
                  value={editing.category_id || ''}
                  onChange={(e) =>
                    setEditing({ ...editing, category_id: e.target.value ? Number(e.target.value) : null })
                  }
                >
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Featured Image URL</label>
                <input
                  className={inputCls}
                  value={editing.featured_image || ''}
                  onChange={(e) => setEditing({ ...editing, featured_image: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Status</label>
                <select
                  className={inputCls}
                  value={editing.status || 'published'}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value as any })}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Display Order</label>
                <input
                  type="number"
                  className={inputCls}
                  value={editing.display_order ?? 0}
                  onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Short Description *</label>
              <textarea
                required
                rows={2}
                className={inputCls}
                value={editing.short_description || ''}
                onChange={(e) => setEditing({ ...editing, short_description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Detailed Content (Safe HTML)</label>
              <textarea
                rows={5}
                className={inputCls}
                value={editing.detailed_content || ''}
                onChange={(e) => setEditing({ ...editing, detailed_content: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={Boolean(editing.is_featured)}
                onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked ? 1 : 0 })}
              />
              Mark as Featured Service
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                <Save className="w-3.5 h-3.5" /> Save Service
              </Button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Service?"
        description={`Delete "${deleteTarget?.title}"? It will be unpublished immediately.`}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await fetch(`/api/admin/services/${deleteTarget.id}`, { method: 'DELETE' });
          setDeleteTarget(null);
          await load();
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
