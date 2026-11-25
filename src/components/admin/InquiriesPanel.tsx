'use client';

import React, { useEffect, useState } from 'react';
import {
  Download,
  MessageCircle,
  Phone,
  Search,
  Send,
  Trash2,
  Eye,
} from 'lucide-react';
import type { InquiryNote, InquiryRecord } from '@/types';
import { buildTelUrl, buildWhatsAppUrl, formatDateShort } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const STATUSES: InquiryRecord['status'][] = [
  'new',
  'contacted',
  'in_progress',
  'quotation_sent',
  'converted',
  'closed',
];

export function InquiriesPanel() {
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<InquiryRecord | null>(null);
  const [notes, setNotes] = useState<InquiryNote[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<InquiryRecord | null>(null);

  const load = async () => {
    const qs = new URLSearchParams();
    if (statusFilter !== 'all') qs.set('status', statusFilter);
    if (search.trim()) qs.set('q', search.trim());
    const res = await fetch(`/api/admin/inquiries?${qs.toString()}`);
    if (res.ok) {
      const json = await res.json();
      setInquiries(json.inquiries || []);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const openDetail = async (inq: InquiryRecord) => {
    setSelected(inq);
    const res = await fetch(`/api/admin/inquiries/${inq.id}`);
    if (res.ok) {
      const json = await res.json();
      setSelected(json.inquiry);
      setNotes(json.notes || []);
    }
  };

  const updateStatus = async (id: number, status: InquiryRecord['status']) => {
    await fetch(`/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (selected?.id === id) setSelected({ ...selected, status });
    await load();
  };

  const addNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !noteInput.trim()) return;
    await fetch(`/api/admin/inquiries/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: noteInput.trim() }),
    });
    setNoteInput('');
    await openDetail(selected);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await fetch(`/api/admin/inquiries/${deleteTarget.id}`, { method: 'DELETE' });
    if (selected?.id === deleteTarget.id) setSelected(null);
    setDeleteTarget(null);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inquiry Management CRM</h1>
          <p className="text-sm text-slate-500">
            Track leads, update quotation pipeline statuses, add notes, and contact clients directly
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            window.location.href = '/api/admin/inquiries?format=csv';
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B0F14] text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
        >
          <Download className="w-4 h-4 text-[var(--brand-secondary)]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void load()}
            placeholder="Search by name, phone, email, or location..."
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"
        >
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ').toUpperCase()}
            </option>
          ))}
        </select>
        <Button size="sm" variant="dark" onClick={load}>
          Search
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Service / Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                      No inquiries found.
                    </td>
                  </tr>
                ) : (
                  inquiries.map((inq) => (
                    <tr
                      key={inq.id}
                      className={`hover:bg-slate-50 ${selected?.id === inq.id ? 'bg-amber-50/50' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900">{inq.full_name}</p>
                        <p className="text-slate-500">{inq.phone}</p>
                        <p className="text-[10px] text-slate-400">{formatDateShort(inq.created_at)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{inq.service_required || 'General'}</p>
                        <p className="text-slate-500">{inq.project_location || '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          aria-label={`Status for ${inq.full_name}`}
                          value={inq.status}
                          onChange={(e) =>
                            void updateStatus(inq.id, e.target.value as InquiryRecord['status'])
                          }
                          className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold bg-white"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => void openDetail(inq)}
                            title="View Details"
                            className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={buildTelUrl(inq.phone)}
                            title="Call Client"
                            className="p-1.5 rounded bg-slate-900 text-amber-400"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={buildWhatsAppUrl(
                              inq.phone,
                              `Hello ${inq.full_name}, thank you for contacting us regarding ${inq.service_required || 'construction services'}.`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Send WhatsApp"
                            className="p-1.5 rounded bg-[#25D366] text-white"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(inq)}
                            title="Delete"
                            className="p-1.5 rounded text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail & Notes Panel */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-6 space-y-5">
          {!selected ? (
            <div className="h-64 flex items-center justify-center text-sm text-slate-400 text-center">
              Select an inquiry on the left to inspect full details and log follow-up notes.
            </div>
          ) : (
            <>
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-lg font-bold text-slate-900">{selected.full_name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selected.phone} {selected.email ? `• ${selected.email}` : ''}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  {selected.service_required && (
                    <span className="px-2.5 py-1 rounded bg-slate-100 font-semibold">
                      {selected.service_required}
                    </span>
                  )}
                  {selected.project_type && (
                    <span className="px-2.5 py-1 rounded bg-slate-100 font-semibold">
                      {selected.project_type}
                    </span>
                  )}
                  {selected.estimated_budget && (
                    <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-semibold">
                      {selected.estimated_budget}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Client Message
                </p>
                <p className="text-sm text-slate-700 bg-slate-50 rounded-xl p-4 border border-slate-200 whitespace-pre-wrap">
                  {selected.message}
                </p>
              </div>

              <form onSubmit={addNote} className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Add Internal Note
                </label>
                <div className="flex gap-2">
                  <input
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="e.g., Site visit scheduled for Friday 11 AM..."
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  />
                  <Button type="submit" size="sm">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </form>

              <div className="space-y-2.5 max-h-56 overflow-y-auto">
                {notes.map((n) => (
                  <div key={n.id} className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs">
                    <p className="text-slate-800">{n.note}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {n.admin_name || 'Admin'} • {formatDateShort(n.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Client Inquiry?"
        description={`This will permanently archive the inquiry from ${deleteTarget?.full_name}.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
