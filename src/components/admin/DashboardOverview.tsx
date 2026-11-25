'use client';

import React, { useEffect, useState } from 'react';
import {
  Activity,
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  FolderKanban,
  Image as ImageIcon,
  Inbox,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { formatDateShort } from '@/lib/utils';
import type { AdminModuleKey } from './AdminShell';

interface DashboardData {
  counts: {
    total_services: number;
    total_projects: number;
    completed_projects: number;
    ongoing_projects: number;
    total_gallery: number;
    total_inquiries: number;
    new_inquiries: number;
    published_pages: number;
    total_media: number;
  };
  monthlyInquiries: { month: string; count: number }[];
  recentInquiries: any[];
  recentActivity: any[];
}

export function DashboardOverview({
  onNavigate,
}: {
  onNavigate: (key: AdminModuleKey) => void;
}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl skeleton-shimmer" />
        ))}
      </div>
    );
  }

  const c = data.counts;
  const maxMonth = Math.max(1, ...data.monthlyInquiries.map((m) => m.count));

  const kpis: {
    label: string;
    value: number;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
    target: AdminModuleKey;
  }[] = [
    { label: 'Total Services', value: c.total_services, icon: Briefcase, accent: 'bg-slate-900 text-amber-400', target: 'services' },
    { label: 'Total Projects', value: c.total_projects, icon: FolderKanban, accent: 'bg-amber-500/15 text-amber-700', target: 'projects' },
    { label: 'Completed Projects', value: c.completed_projects, icon: CheckCircle2, accent: 'bg-emerald-500/15 text-emerald-700', target: 'projects' },
    { label: 'Ongoing Projects', value: c.ongoing_projects, icon: Clock, accent: 'bg-blue-500/15 text-blue-700', target: 'projects' },
    { label: 'Gallery Images', value: c.total_gallery, icon: ImageIcon, accent: 'bg-purple-500/15 text-purple-700', target: 'gallery' },
    { label: 'Total Inquiries', value: c.total_inquiries, icon: Inbox, accent: 'bg-indigo-500/15 text-indigo-700', target: 'inquiries' },
    { label: 'New Inquiries', value: c.new_inquiries, icon: Inbox, accent: 'bg-red-500/15 text-red-700', target: 'inquiries' },
    { label: 'Published Pages', value: c.published_pages, icon: FileText, accent: 'bg-teal-500/15 text-teal-700', target: 'pages' },
  ];

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Executive Dashboard</h1>
          <p className="text-sm text-slate-500">
            Live database metrics from MySQL (<code className="text-xs">construction</code>)
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Live Stats</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <button
              key={kpi.label}
              type="button"
              onClick={() => onNavigate(kpi.target)}
              className="text-left rounded-2xl bg-white border border-slate-200 p-5 hover:border-[var(--brand-secondary)] hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {kpi.label}
                </span>
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.accent}`}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-slate-900">{kpi.value}</p>
            </button>
          );
        })}
      </div>

      {/* Monthly Inquiries Chart + Media Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Monthly Inquiry Trend</h2>
              <p className="text-xs text-slate-500">Last 6 months of incoming client leads</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('inquiries')}
              className="text-xs font-bold text-slate-900 underline cursor-pointer"
            >
              Open CRM
            </button>
          </div>

          {data.monthlyInquiries.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl">
              No inquiries recorded yet — new submissions from the website will plot here automatically.
            </div>
          ) : (
            <div className="h-48 flex items-end gap-4 pt-4">
              {data.monthlyInquiries.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">{m.count}</span>
                  <div className="w-full bg-slate-100 rounded-t-lg h-32 flex items-end overflow-hidden">
                    <div
                      className="w-full bg-[var(--brand-secondary)] rounded-t-lg transition-all"
                      style={{ height: `${Math.max(12, Math.round((m.count / maxMonth) * 100))}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">{m.month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Log */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--brand-secondary)]" />
              <span>Recent Admin Activity</span>
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('logs')}
              className="text-xs font-bold text-slate-900 underline cursor-pointer"
            >
              All Logs
            </button>
          </div>
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {data.recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400">No activity recorded yet.</p>
            ) : (
              data.recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="text-xs border-b border-slate-100 pb-2.5 last:border-none"
                >
                  <p className="font-semibold text-slate-800">
                    {log.description || `${log.action} on ${log.module}`}
                  </p>
                  <p className="text-slate-400 mt-0.5">
                    {log.admin_name || 'System'} • {formatDateShort(log.created_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Inquiries Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recent Client Inquiries</h2>
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Layers className="w-3.5 h-3.5" />
            {c.total_media} media files indexed
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Service</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.recentInquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-xs">
                    No client inquiries submitted yet.
                  </td>
                </tr>
              ) : (
                data.recentInquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-semibold text-slate-900">{inq.full_name}</td>
                    <td className="px-6 py-3 text-slate-600">{inq.phone}</td>
                    <td className="px-6 py-3 text-slate-600">{inq.service_required || 'General'}</td>
                    <td className="px-6 py-3 text-slate-600">{inq.project_location || '—'}</td>
                    <td className="px-6 py-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-amber-100 text-amber-800">
                        {inq.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500">
                      {formatDateShort(inq.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
