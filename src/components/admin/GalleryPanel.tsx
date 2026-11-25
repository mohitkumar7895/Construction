'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Loader2, Save, Trash2, UploadCloud } from 'lucide-react';
import type { GalleryCategory, GalleryImage } from '@/types';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function GalleryPanel() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [projects, setProjects] = useState<{ id: number; title: string }[]>([]);
  const [uploadCatId, setUploadCatId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [newCat, setNewCat] = useState('');
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GalleryImage | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const res = await fetch('/api/admin/gallery');
    if (res.ok) {
      const json = await res.json();
      setImages(json.images || []);
      setCategories(json.categories || []);
      setProjects(json.projects || []);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  // Multi-image upload directly into Media Library + Gallery table!
  const handleBulkUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('folder', 'gallery');
      Array.from(fileList).forEach((f) => fd.append('files', f));

      const uploadRes = await fetch('/api/admin/media', { method: 'POST', body: fd });
      const uploadJson = await uploadRes.json();
      if (uploadRes.ok && Array.isArray(uploadJson.uploaded)) {
        const items = uploadJson.uploaded.map((u: any, idx: number) => ({
          category_id: uploadCatId ? Number(uploadCatId) : null,
          title: u.title || u.originalName,
          caption: '',
          alt_text: u.alt_text || u.title,
          media_type: u.mimeType?.startsWith('video/') ? 'video' : 'image',
          media_url: u.url,
          thumbnail_url: u.url,
          is_concept: 0,
          status: 'published',
          display_order: images.length + idx + 1,
        }));
        await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });
        await load();
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const moveItem = async (idx: number, delta: -1 | 1) => {
    const target = idx + delta;
    if (target < 0 || target >= images.length) return;
    const copy = [...images];
    const [moved] = copy.splice(idx, 1);
    copy.splice(target, 0, moved);
    setImages(copy);
    await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reorder', orderedIds: copy.map((i) => i.id) }),
    });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await fetch(`/api/admin/gallery/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    setEditing(null);
    await load();
  };

  const addCategory = async () => {
    if (!newCat.trim()) return;
    await fetch('/api/admin/cms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resource: 'gallery_categories',
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
          <h1 className="text-2xl font-bold text-slate-900">Gallery &amp; Categories</h1>
          <p className="text-sm text-slate-500">
            Upload multiple images simultaneously, reorder items, assign categories, and edit captions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={uploadCatId}
            onChange={(e) => setUploadCatId(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
          >
            <option value="">Assign Category (Optional)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            <span>Multi-Upload to Gallery</span>
          </Button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            className="hidden"
            onChange={(e) => void handleBulkUpload(e.target.files)}
          />
        </div>
      </div>

      {/* Categories Bar */}
      <div className="rounded-xl bg-white border border-slate-200 p-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase text-slate-500 mr-2">Categories:</span>
        {categories.map((cat) => (
          <span
            key={cat.id}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold"
          >
            {cat.name}
            <button
              type="button"
              onClick={async () => {
                await fetch('/api/admin/cms', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ resource: 'gallery_categories', action: 'delete', id: cat.id }),
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

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {images.map((item, idx) => (
          <div key={item.id} className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
            <div className="aspect-[16/10] bg-slate-900 relative">
              {item.media_type === 'video' ? (
                <video src={item.media_url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={item.media_url} alt={item.alt_text || item.title} className="w-full h-full object-cover" />
              )}
              {item.category_name && (
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-amber-300 text-[10px] font-bold uppercase">
                  {item.category_name}
                </span>
              )}
            </div>
            <div className="p-3.5 space-y-2">
              <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
              <p className="text-[11px] text-slate-500 line-clamp-1">{item.caption || 'No caption'}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => void moveItem(idx, -1)}
                    className="p-1 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void moveItem(idx, 1)}
                    className="p-1 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditing(item)}
                    className="px-2.5 py-1 rounded border border-slate-200 text-[11px] font-semibold cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={saveEdit} className="w-full max-w-lg rounded-2xl bg-white p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">Edit Gallery Item</h2>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Title</label>
              <input
                required
                className={inputCls}
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
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
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Linked Project</label>
                <select
                  className={inputCls}
                  value={editing.project_id || ''}
                  onChange={(e) =>
                    setEditing({ ...editing, project_id: e.target.value ? Number(e.target.value) : null })
                  }
                >
                  <option value="">None</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Caption</label>
              <input
                className={inputCls}
                value={editing.caption || ''}
                onChange={(e) => setEditing({ ...editing, caption: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Alt Text (SEO)</label>
              <input
                className={inputCls}
                value={editing.alt_text || ''}
                onChange={(e) => setEditing({ ...editing, alt_text: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={Boolean(editing.is_concept)}
                onChange={(e) => setEditing({ ...editing, is_concept: e.target.checked ? 1 : 0 })}
              />
              Architectural Concept Illustration Label
            </label>
            <div className="flex justify-end gap-2">
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

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Gallery Item?"
        description={`Remove "${deleteTarget?.title}" from the gallery?`}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await fetch(`/api/admin/gallery/${deleteTarget.id}`, { method: 'DELETE' });
          setDeleteTarget(null);
          await load();
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
