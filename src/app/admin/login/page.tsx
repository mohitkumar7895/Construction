'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Database,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  User,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HealthStatus {
  ok: boolean;
  database: {
    connected: boolean;
    databaseName?: string;
    tablesReady?: boolean;
    adminInitialized?: boolean;
    code?: string;
    mysqlDetail?: string;
    hint?: string;
  };
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'setup'>('login');
  const [email, setEmail] = useState('sartajkhan4284@gmail.com');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('Sartaj Hussain');
  const [setupKey, setSetupKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(true);

  const checkHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      const data = await res.json();
      setHealth(data);
      if (data?.database?.connected && (!data?.database?.tablesReady || !data?.database?.adminInitialized)) {
        setMode('setup');
      }
    } catch {
      setHealth(null);
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    void checkHealth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Login failed (${res.status}). Check database status above.`);
      } else {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch {
      setError('Unable to reach authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, setupKey }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Setup failed (${res.status}).`);
      } else {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch {
      setError('Unable to reach setup endpoint.');
    } finally {
      setLoading(false);
    }
  };

  const dbConnected = Boolean(health?.database?.connected);

  return (
    <div className="min-h-screen bg-[#0B0F14] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="bg-blueprint-grid absolute inset-0 opacity-40 pointer-events-none" />

      <div className="relative w-full max-w-md space-y-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-white p-1.5 flex items-center justify-center mx-auto mb-3 shadow-xl ring-2 ring-[var(--brand-secondary)]/70 overflow-hidden">
            <img src="/logo-cropped.png" alt="Taj Construction Logo" className="w-full h-full object-contain scale-110" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Command Center</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Dynamic MySQL CMS, Media Library &amp; Inquiry CRM
          </p>
        </div>

        {/* Live Database Status Banner */}
        <div
          className={`rounded-xl border px-4 py-3 text-xs ${
            checkingHealth
              ? 'bg-white/5 border-white/15 text-slate-300'
              : dbConnected
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/70 border-amber-500/50 text-amber-100'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-semibold">
              {checkingHealth ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : dbConnected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>
                {checkingHealth
                  ? 'Checking MySQL connection...'
                  : dbConnected
                    ? `MySQL Connected (${health?.database?.databaseName})`
                    : `MySQL Connection Blocked (${health?.database?.code || 'OFFLINE'})`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => void checkHealth()}
              aria-label="Recheck database connection"
              className="p-1 rounded hover:bg-white/10 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          {!checkingHealth && !dbConnected && health?.database?.mysqlDetail && (
            <p className="mt-2 font-mono text-[11px] text-amber-200/90 break-words">
              {health.database.mysqlDetail}
            </p>
          )}
          {!checkingHealth && dbConnected && !health?.database?.tablesReady && (
            <p className="mt-1.5 text-[11px] text-emerald-200/90 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 shrink-0" />
              <span>Use &ldquo;Create New Admin&rdquo; below to auto-install all 36 tables &amp; sign in!</span>
            </p>
          )}
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/10 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              mode === 'login'
                ? 'bg-[var(--brand-secondary)] text-[#0B0F14]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Admin Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('setup');
              setError(null);
            }}
            className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'setup'
                ? 'bg-[var(--brand-secondary)] text-[#0B0F14]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create New Admin</span>
          </button>
        </div>

        {/* Form Card */}
        <form
          onSubmit={mode === 'login' ? handleLogin : handleSetup}
          className="rounded-2xl bg-white p-7 shadow-2xl border border-slate-200 space-y-4"
        >
          {error && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-xs sm:text-sm text-red-700 font-medium leading-relaxed"
            >
              {error}
            </div>
          )}

          {mode === 'setup' && (
            <div>
              <label htmlFor="admin-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-[var(--brand-secondary)] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="admin-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                placeholder="sartajkhan4284@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-[var(--brand-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)]/30"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {mode === 'login' ? 'Password' : 'New Admin Password (min 8 chars)'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="admin-password"
                type="password"
                required
                minLength={mode === 'setup' ? 8 : 6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-[var(--brand-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)]/30"
              />
            </div>
          </div>

          {mode === 'setup' && (
            <div>
              <label htmlFor="setup-key" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Setup Key (Required only if an admin already exists)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="setup-key"
                  type="password"
                  placeholder="Matches AUTH_SECRET in Vercel env"
                  value={setupKey}
                  onChange={(e) => setSetupKey(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:border-[var(--brand-secondary)] focus:outline-none"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                Leave empty on a brand-new database — automatically installs all 36 tables &amp; signs you in.
              </p>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{mode === 'login' ? 'Verifying Session...' : 'Creating Super Admin...'}</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Create Super Admin & Sign In'}</span>
            )}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[var(--brand-secondary)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
