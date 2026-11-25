'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import type { PageRecord, PageSection } from '@/types';
import { Button } from '@/components/ui/Button';

const SECTION_TYPES: PageSection['section_type'][] = [
  'hero',
  'text_image',
  'services_grid',
  'project_grid',
  'gallery',
  'statistics',
  'testimonials',
  'faq',
  'contact_form',
  'cta',
  'rich_text',
  'video',
  'custom_banner',
  'process_timeline',
  'why_choose_us',
];

export function PageBuilderPanel({
  initialView = 'builder',
}: {
  initialView?: 'builder' | 'pages';
}) {
  const [view, setView] = useState<'builder' | 'pages'>(initialView);
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<number>(1);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [editingPage, setEditingPage] = useState<Partial<PageRecord> | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  const loadPages = async () => {
    const res = await fetch('/api/admin/pages');
    if (res.ok) {
      const json = await res.json();
      setPages(json.pages || []);
    }
  };

  const loadSections = async (pageId: number) => {
    const res = await fetch(`/api/admin/sections?pageId=${pageId}`);
    if (res.ok) {
      const json = await res.json();
      setSections(json.sections || []);
    }
  };

  useEffect(() => {
    void loadPages();
  }, []);

  useEffect(() => {
    void loadSections(selectedPageId);
  }, [selectedPageId]);

  const reorder = async (next: PageSection[]) => {
    setSections(next);
    await fetch('/api/admin/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reorder', orderedIds: next.map((s) => s.id) }),
    });
    setMsg('Section order saved and published.');
  };

  const moveSection = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= sections.length) return;
    const copy = [...sections];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    void reorder(copy);
  };

  const handleAddSection = async (type: PageSection['section_type']) => {
    const res = await fetch('/api/admin/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page_id: selectedPageId,
        section_key: `${type}_${Date.now().toString().slice(-4)}`,
        section_type: type,
        heading: `New ${type.replace('_', ' ')} Section`,
        status: 'published',
        is_visible: 1,
        display_order: sections.length + 1,
      }),
    });
    if (res.ok) {
      await loadSections(selectedPageId);
      setMsg('New section added to page.');
    }
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;
    await fetch(`/api/admin/sections/${editingSection.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingSection),
    });
    setEditingSection(null);
    await loadSections(selectedPageId);
    setMsg('Section updated and published.');
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage?.title) return;
    const isEdit = Boolean(editingPage.id);
    const res = await fetch(isEdit ? `/api/admin/pages/${editingPage.id}` : '/api/admin/pages', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingPage),
    });
    if (res.ok) {
      setEditingPage(null);
      await loadPages();
      setMsg(isEdit ? 'Page updated!' : 'Custom page created!');
    }
  };

  const inputCls = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {view === 'builder' ? 'Dynamic Section Page Builder' : 'Custom & Legal Pages'}
          </h1>
          <p className="text-sm text-slate-500">
            Drag-and-drop sections, edit headings, visibility, drafts, and custom pages dynamically
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setView('builder')}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer ${
              view === 'builder' ? 'bg-[#0B0F14] text-[var(--brand-secondary)]' : 'bg-white border border-slate-200'
            }`}
          >
            Section Builder
          </button>
          <button
            type="button"
            onClick={() => setView('pages')}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer ${
              view === 'pages' ? 'bg-[#0B0F14] text-[var(--brand-secondary)]' : 'bg-white border border-slate-200'
            }`}
          >
            All Pages ({pages.length})
          </button>
        </div>
      </div>

      {msg && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs font-semibold text-emerald-800">
          {msg}
        </div>
      )}

      {view === 'builder' ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold uppercase text-slate-600">Select Page:</label>
              <select
                value={selectedPageId}
                onChange={(e) => setSelectedPageId(Number(e.target.value))}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
              >
                {pages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} (/{p.slug === 'home' ? '' : p.slug})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Add section type"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) {
                    void handleAddSection(e.target.value as PageSection['section_type']);
                    e.target.value = '';
                  }
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold bg-[var(--brand-secondary)] text-[#0B0F14]"
              >
                <option value="">+ Add Section Block...</option>
                {SECTION_TYPES.map((st) => (
                  <option key={st} value={st}>
                    {st.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2.5">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                draggable
                onDragStart={() => setDragIdx(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragIdx === null || dragIdx === idx) return;
                  const copy = [...sections];
                  const [moved] = copy.splice(dragIdx, 1);
                  copy.splice(idx, 0, moved);
                  setDragIdx(null);
                  void reorder(copy);
                }}
                className="rounded-xl bg-white border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-400 text-[10px] font-bold uppercase">
                        {sec.section_type}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {sec.heading || sec.section_key}
                      </span>
                      {sec.status === 'draft' && (
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-bold uppercase">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {sec.description || sec.subheading || sec.section_key}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => moveSection(idx, -1)}
                    className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(idx, 1)}
                    className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch(`/api/admin/sections/${sec.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...sec, is_visible: sec.is_visible ? 0 : 1 }),
                      });
                      await loadSections(selectedPageId);
                    }}
                    className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    title="Toggle visibility"
                  >
                    {sec.is_visible ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch('/api/admin/sections', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'duplicate', sectionId: sec.id }),
                      });
                      await loadSections(selectedPageId);
                    }}
                    className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <Button size="sm" variant="outline" onClick={() => setEditingSection(sec)}>
                    Edit
                  </Button>
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch(`/api/admin/sections/${sec.id}`, { method: 'DELETE' });
                      await loadSections(selectedPageId);
                    }}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Button
            size="sm"
            onClick={() =>
              setEditingPage({
                title: '',
                slug: '',
                page_type: 'custom',
                status: 'published',
                is_indexable: 1,
                content: '',
              })
            }
          >
            <Plus className="w-4 h-4" /> Create Custom Page
          </Button>

          <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Page Title</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pages.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-bold text-slate-900">{p.title}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">/{p.slug}</td>
                    <td className="px-4 py-3 uppercase">{p.page_type}</td>
                    <td className="px-4 py-3 uppercase">{p.status}</td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingPage(p)}>
                        Edit
                      </Button>
                      {p.page_type !== 'system' && (
                        <button
                          type="button"
                          onClick={async () => {
                            await fetch(`/api/admin/pages/${p.id}`, { method: 'DELETE' });
                            await loadPages();
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveSection}
            className="w-full max-w-xl rounded-2xl bg-white p-6 space-y-4 shadow-2xl"
          >
            <h2 className="text-lg font-bold text-slate-900">Edit Section ({editingSection.section_type})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Heading</label>
                <input
                  className={inputCls}
                  value={editingSection.heading || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, heading: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Subheading</label>
                <input
                  className={inputCls}
                  value={editingSection.subheading || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, subheading: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Button Text</label>
                <input
                  className={inputCls}
                  value={editingSection.button_text || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, button_text: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Button Link</label>
                <input
                  className={inputCls}
                  value={editingSection.button_link || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, button_link: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Image URL</label>
                <input
                  className={inputCls}
                  value={editingSection.image_url || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, image_url: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Background Color</label>
                <input
                  className={inputCls}
                  placeholder="#FFFFFF"
                  value={editingSection.background_color || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, background_color: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Description / Sanitized HTML</label>
              <textarea
                rows={4}
                className={inputCls}
                value={editingSection.description || ''}
                onChange={(e) => setEditingSection({ ...editingSection, description: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between pt-2">
              <select
                value={editingSection.status}
                onChange={(e) =>
                  setEditingSection({ ...editingSection, status: e.target.value as 'draft' | 'published' })
                }
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditingSection(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  <Save className="w-3.5 h-3.5" /> Save Section
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Edit / Create Page Modal */}
      {editingPage && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSavePage}
            className="w-full max-w-2xl rounded-2xl bg-white p-6 space-y-4 shadow-2xl"
          >
            <h2 className="text-lg font-bold text-slate-900">
              {editingPage.id ? `Edit Page: ${editingPage.title}` : 'Create Custom Page'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Title *</label>
                <input
                  required
                  className={inputCls}
                  value={editingPage.title || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">URL Slug</label>
                <input
                  className={inputCls}
                  disabled={editingPage.page_type === 'system'}
                  value={editingPage.slug || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Hero Title</label>
                <input
                  className={inputCls}
                  value={editingPage.hero_title || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, hero_title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Status</label>
                <select
                  className={inputCls}
                  value={editingPage.status || 'published'}
                  onChange={(e) => setEditingPage({ ...editingPage, status: e.target.value as any })}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Rich Content (Safe HTML — Scripts Stripped)
              </label>
              <textarea
                rows={8}
                className={inputCls}
                value={editingPage.content || ''}
                onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingPage(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Page
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
