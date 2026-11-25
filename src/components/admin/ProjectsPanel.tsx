'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import type { ProjectCategory, ProjectRecord } from '@/types';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function ProjectsPanel() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [editing, setEditing] = useState<Partial<ProjectRecord> | null>(null);
  const [newCat, setNewCat] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ProjectRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch('/api/admin/projects');
    if (res.ok) {
      const json = await res.json();
      setProjects(json.projects || []);
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
      isEdit ? `/api/admin/projects/${editing.id}` : '/api/admin/projects',
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
      setError(json.error || 'Could not save project');
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
        resource: 'project_categories',
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
          <h1 className="text-2xl font-bold text-slate-900">Projects Portfolio &amp; Categories</h1>
          <p className="text-sm text-slate-500">
            Manage completed, ongoing, upcoming projects, specifications, and architectural concept labels
          </p>
        </div>
        <Button
          size="sm"
          onClick={() =>
            setEditing({
              title: '',
              location: 'Haldwani, Uttarakhand',
              project_status: 'ongoing',
              is_concept: 0,
              short_description: '',
              full_description: '',
              specifications_json: '{"Structure":"RCC Framed","Execution":"Turnkey"}',
              featured_image: '/images/residential-duplex.jpg',
              status: 'published',
              is_featured: 1,
              display_order: projects.length + 1,
            })
          }
        >
          <Plus className="w-4 h-4" /> Add New Project
        </Button>
      </div>

      {/* Category Bar */}
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
                  body: JSON.stringify({ resource: 'project_categories', action: 'delete', id: cat.id }),
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

      {/* Projects Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Project Status</th>
                <th className="px-4 py-3">Publish</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{p.title}</p>
                    <p className="text-slate-500">
                      {p.location} {p.is_concept ? '• Concept Label On' : '• Live Project'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.category_name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold uppercase">
                      {p.project_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 uppercase font-semibold">{p.status}</td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(p)}>
                      Edit
                    </Button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(p)}
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

      {/* Project Form Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSave} className="w-full max-w-2xl rounded-2xl bg-white p-6 space-y-4 shadow-2xl my-8">
            <h2 className="text-lg font-bold text-slate-900">
              {editing.id ? `Edit Project: ${editing.title}` : 'Add Project'}
            </h2>
            {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Project Name *</label>
                <input
                  required
                  className={inputCls}
                  value={editing.title || ''}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Location *</label>
                <input
                  required
                  className={inputCls}
                  value={editing.location || ''}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
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
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Project Status</label>
                <select
                  className={inputCls}
                  value={editing.project_status || 'ongoing'}
                  onChange={(e) => setEditing({ ...editing, project_status: e.target.value as any })}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Construction Area</label>
                <input
                  className={inputCls}
                  placeholder="e.g. 2,800 sq. ft."
                  value={editing.construction_area || ''}
                  onChange={(e) => setEditing({ ...editing, construction_area: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Duration</label>
                <input
                  className={inputCls}
                  placeholder="e.g. 12 Months"
                  value={editing.duration || ''}
                  onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
                />
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
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Publish Status</label>
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
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Before Image URL (Optional)</label>
                <input
                  className={inputCls}
                  value={editing.before_image || ''}
                  onChange={(e) => setEditing({ ...editing, before_image: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">After Image URL (Optional)</label>
                <input
                  className={inputCls}
                  value={editing.after_image || ''}
                  onChange={(e) => setEditing({ ...editing, after_image: e.target.value })}
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
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Full Description (Safe HTML)</label>
              <textarea
                rows={4}
                className={inputCls}
                value={editing.full_description || ''}
                onChange={(e) => setEditing({ ...editing, full_description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Specifications JSON</label>
              <textarea
                rows={2}
                className={`${inputCls} font-mono text-xs`}
                value={editing.specifications_json || '{}'}
                onChange={(e) => setEditing({ ...editing, specifications_json: e.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-5 text-xs font-semibold">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(editing.is_featured)}
                  onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked ? 1 : 0 })}
                />
                Featured Project
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(editing.is_concept)}
                  onChange={(e) => setEditing({ ...editing, is_concept: e.target.checked ? 1 : 0 })}
                />
                Label as Architectural Concept Visual
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                <Save className="w-3.5 h-3.5" /> Save Project
              </Button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Project?"
        description={`Delete "${deleteTarget?.title}" from the portfolio?`}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await fetch(`/api/admin/projects/${deleteTarget.id}`, { method: 'DELETE' });
          setDeleteTarget(null);
          await load();
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
