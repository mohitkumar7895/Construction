'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import type { RedirectRule, SeoMetadata } from '@/types';
import { Button } from '@/components/ui/Button';

export function SeoPanel() {
  const [seoList, setSeoList] = useState<SeoMetadata[]>([]);
  const [redirects, setRedirects] = useState<RedirectRule[]>([]);
  const [editing, setEditing] = useState<Partial<SeoMetadata> | null>(null);
  const [newRedir, setNewRedir] = useState({ source_path: '', destination_path: '', status_code: 301 });
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch('/api/admin/seo');
    if (res.ok) {
      const json = await res.json();
      setSeoList(json.seoList || []);
      setRedirects(json.redirects || []);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing?.entity_type || !editing?.entity_slug) return;
    const res = await fetch('/api/admin/seo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      setEditing(null);
      setMsg('SEO metadata updated & sitemap revalidated.');
      await load();
    }
  };

  const addRedirect = async () => {
    if (!newRedir.source_path || !newRedir.destination_path) return;
    await fetch('/api/admin/seo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'redirect', ...newRedir }),
    });
    setNewRedir({ source_path: '', destination_path: '', status_code: 301 });
    await load();
  };

  const inputCls = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900';

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dynamic SEO &amp; Redirects Manager</h1>
          <p className="text-sm text-slate-500">
            Configure meta titles, descriptions, Open Graph, Twitter cards, robots directives, and URL redirects
          </p>
        </div>
        <Button
          size="sm"
          onClick={() =>
            setEditing({
              entity_type: 'page',
              entity_slug: '',
              meta_title: '',
              meta_description: '',
              focus_keyword: '',
              robots_index: 1,
              robots_follow: 1,
            })
          }
        >
          <Plus className="w-4 h-4" /> Add / Override SEO Entry
        </Button>
      </div>

      {msg && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-800">
          {msg}
        </div>
      )}

      {/* SEO Records Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Meta Title &amp; Keyword</th>
                <th className="px-4 py-3">Robots</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {seoList.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-mono font-bold">
                    {row.entity_type}/{row.entity_slug}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{row.meta_title}</p>
                    <p className="text-slate-500 line-clamp-1">{row.focus_keyword || row.meta_description}</p>
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {row.robots_index ? 'index' : 'noindex'}, {row.robots_follow ? 'follow' : 'nofollow'}
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" onClick={() => setEditing(row)}>
                      Edit SEO
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Redirects Manager */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">Editable URL Redirects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            placeholder="Source path (e.g. /old-page)"
            className={inputCls}
            value={newRedir.source_path}
            onChange={(e) => setNewRedir({ ...newRedir, source_path: e.target.value })}
          />
          <input
            placeholder="Destination (e.g. /services)"
            className={inputCls}
            value={newRedir.destination_path}
            onChange={(e) => setNewRedir({ ...newRedir, destination_path: e.target.value })}
          />
          <select
            className={inputCls}
            value={newRedir.status_code}
            onChange={(e) => setNewRedir({ ...newRedir, status_code: Number(e.target.value) })}
          >
            <option value={301}>301 Permanent</option>
            <option value={302}>302 Temporary</option>
          </select>
          <Button onClick={addRedirect}>Add Redirect</Button>
        </div>

        <div className="divide-y divide-slate-100">
          {redirects.map((r) => (
            <div key={r.id} className="py-2.5 flex items-center justify-between text-xs">
              <span className="font-mono">
                {r.source_path} → <strong>{r.destination_path}</strong> ({r.status_code})
              </span>
              <button
                type="button"
                onClick={async () => {
                  await fetch('/api/admin/seo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ kind: 'redirect', action: 'delete', id: r.id }),
                  });
                  await load();
                }}
                className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SEO Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={saveSeo} className="w-full max-w-2xl rounded-2xl bg-white p-6 space-y-4 shadow-2xl my-8">
            <h2 className="text-lg font-bold text-slate-900">Edit SEO Metadata</h2>
            <div className="grid grid-cols-2 gap-3">
              <select
                className={inputCls}
                value={editing.entity_type || 'page'}
                onChange={(e) => setEditing({ ...editing, entity_type: e.target.value as any })}
              >
                <option value="global">global</option>
                <option value="page">page</option>
                <option value="service">service</option>
                <option value="project">project</option>
              </select>
              <input
                required
                placeholder="Entity slug (e.g. home, residential-construction)"
                className={inputCls}
                value={editing.entity_slug || ''}
                onChange={(e) => setEditing({ ...editing, entity_slug: e.target.value })}
              />
            </div>
            <input placeholder="Meta Title" className={inputCls} value={editing.meta_title || ''} onChange={(e) => setEditing({ ...editing, meta_title: e.target.value })} />
            <textarea rows={2} placeholder="Meta Description" className={inputCls} value={editing.meta_description || ''} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Focus Keyword" className={inputCls} value={editing.focus_keyword || ''} onChange={(e) => setEditing({ ...editing, focus_keyword: e.target.value })} />
              <input placeholder="Canonical URL (Optional)" className={inputCls} value={editing.canonical_url || ''} onChange={(e) => setEditing({ ...editing, canonical_url: e.target.value })} />
              <input placeholder="OG Title" className={inputCls} value={editing.og_title || ''} onChange={(e) => setEditing({ ...editing, og_title: e.target.value })} />
              <input placeholder="OG Image URL" className={inputCls} value={editing.og_image || ''} onChange={(e) => setEditing({ ...editing, og_image: e.target.value })} />
            </div>
            <div className="flex gap-5 text-xs font-semibold">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={Boolean(editing.robots_index)} onChange={(e) => setEditing({ ...editing, robots_index: e.target.checked ? 1 : 0 })} />
                Robots Index
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={Boolean(editing.robots_follow)} onChange={(e) => setEditing({ ...editing, robots_follow: e.target.checked ? 1 : 0 })} />
                Robots Follow
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                <Save className="w-3.5 h-3.5" /> Save SEO
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
