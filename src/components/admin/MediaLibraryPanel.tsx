'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Image as ImageIcon,
  Loader2,
  Search,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import type { MediaItem } from '@/types';
import { formatFileSize } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function MediaLibraryPanel({
  onSelectUrl,
}: {
  onSelectUrl?: (url: string, item: MediaItem) => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('all');
  const [uploadFolder, setUploadFolder] = useState('general');
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const qs = new URLSearchParams();
    if (search) qs.set('q', search);
    if (folder !== 'all') qs.set('folder', folder);
    const res = await fetch(`/api/admin/media?${qs.toString()}`);
    if (res.ok) {
      const json = await res.json();
      setItems(json.media || []);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder]);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('folder', uploadFolder);
      Array.from(fileList).forEach((file) => formData.append('files', file));

      const res = await fetch('/api/admin/media', { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json.error || 'Upload failed');
      } else {
        setMessage(`Uploaded ${json.uploaded?.length || 1} file(s) with WebP optimization.`);
        await load();
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleSaveMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const res = await fetch(`/api/admin/media/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editing.title,
        alt_text: editing.alt_text,
        caption: editing.caption,
        folder: editing.folder,
      }),
    });
    if (res.ok) {
      setEditing(null);
      await load();
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/admin/media/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleteTarget(null);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Centralized Media Library</h1>
          <p className="text-sm text-slate-500">
            Upload single or multiple images/videos with automatic WebP compression &amp; magic-byte validation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={uploadFolder}
            onChange={(e) => setUploadFolder(e.target.value)}
            aria-label="Target upload folder"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
          >
            <option value="general">Folder: General</option>
            <option value="hero">Folder: Hero</option>
            <option value="services">Folder: Services</option>
            <option value="projects">Folder: Projects</option>
            <option value="gallery">Folder: Gallery</option>
            <option value="about">Folder: About</option>
          </select>
          <Button size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            <span>Upload Media</span>
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </div>

      {/* Drag & Drop Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? 'border-[var(--brand-secondary)] bg-amber-50' : 'border-slate-300 bg-white'
        }`}
      >
        <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">
          Drag &amp; drop JPG, PNG, WebP, MP4 or WebM files here
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Executable files are blocked on the server. Images are automatically resized &amp; converted to WebP.
        </p>
        {message && <p className="mt-3 text-xs font-semibold text-emerald-700">{message}</p>}
      </div>

      {/* Search & Folder Filter */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void load()}
            placeholder="Search by title, filename, or alt text..."
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs"
          />
        </div>
        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
        >
          <option value="all">All Folders</option>
          <option value="hero">Hero</option>
          <option value="services">Services</option>
          <option value="projects">Projects</option>
          <option value="gallery">Gallery</option>
          <option value="about">About</option>
          <option value="general">General</option>
        </select>
        <Button size="sm" variant="dark" onClick={load}>
          Filter
        </Button>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm flex flex-col"
          >
            <div className="aspect-[16/10] bg-slate-900 relative overflow-hidden">
              {item.mime_type.startsWith('video/') ? (
                <video src={item.url} className="w-full h-full object-cover" muted />
              ) : (
                <img
                  src={item.url}
                  alt={item.alt_text || item.title || item.original_name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              )}
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] font-bold uppercase text-amber-300">
                {item.folder}
              </span>
            </div>

            <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {item.title || item.original_name}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {item.width && item.height ? `${item.width}×${item.height} • ` : ''}
                  {item.file_size > 0 ? formatFileSize(item.file_size) : 'Bundled Asset'}
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {onSelectUrl ? (
                  <Button size="sm" className="flex-1" onClick={() => onSelectUrl(item.url, item)}>
                    Select
                  </Button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(item.url);
                      setCopiedId(item.id);
                      setTimeout(() => setCopiedId(null), 1500);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === item.id ? 'Copied' : 'Copy URL'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditing(item)}
                  className="py-1.5 px-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  aria-label="Delete media"
                  onClick={() => setDeleteTarget(item)}
                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Metadata Inline Panel */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveMeta}
            className="w-full max-w-md rounded-2xl bg-white p-6 space-y-4 shadow-2xl"
          >
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[var(--brand-secondary)]" />
              <span>Edit Media Metadata</span>
            </h2>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Title</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={editing.title || ''}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Alt Text (SEO)</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={editing.alt_text || ''}
                onChange={(e) => setEditing({ ...editing, alt_text: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Caption</label>
              <textarea
                rows={2}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={editing.caption || ''}
                onChange={(e) => setEditing({ ...editing, caption: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Media File?"
        description={`Are you sure you want to delete "${deleteTarget?.title || deleteTarget?.original_name}" from the media library?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
