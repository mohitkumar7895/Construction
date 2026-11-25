'use client';

import React, { useEffect, useState } from 'react';
import { KeyRound, Plus, Shield, Trash2 } from 'lucide-react';
import { formatDateShort } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function SecurityUsersPanel({
  initialTab = 'users',
}: {
  initialTab?: 'users' | 'logs' | 'password';
}) {
  const [tab, setTab] = useState<'users' | 'logs' | 'password'>(initialTab);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role_id: 2, phone: '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const loadUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const json = await res.json();
      setUsers(json.users || []);
      setRoles(json.roles || []);
    }
  };

  const loadLogs = async () => {
    const res = await fetch('/api/admin/logs');
    if (res.ok) {
      const json = await res.json();
      setLogs(json.logs || []);
    }
  };

  useEffect(() => {
    if (tab === 'users') void loadUsers();
    if (tab === 'logs') void loadLogs();
  }, [tab]);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newUser, role_id: Number(newUser.role_id) }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMsg({ type: 'err', text: json.error || 'Could not create admin user' });
    } else {
      setMsg({ type: 'ok', text: 'Admin user created successfully.' });
      setNewUser({ name: '', email: '', password: '', role_id: 2, phone: '' });
      await loadUsers();
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setMsg({ type: 'err', text: 'New passwords do not match.' });
      return;
    }
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setMsg({ type: 'err', text: json.error || 'Failed to update password' });
    } else {
      setMsg({ type: 'ok', text: 'Password updated successfully.' });
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const inputCls = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Security, RBAC Users &amp; Audit Logs</h1>
          <p className="text-sm text-slate-500">Manage Super Admin / Content Editor roles, audit trails, and password security</p>
        </div>
        <div className="flex gap-2">
          {(
            [
              ['users', 'Admin Users'],
              ['logs', 'Activity Logs'],
              ['password', 'Change Password'],
            ] as ['users' | 'logs' | 'password', string][]
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer ${
                tab === k ? 'bg-[#0B0F14] text-[var(--brand-secondary)]' : 'bg-white border border-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {msg && (
        <div
          className={`rounded-lg px-4 py-2.5 text-xs font-semibold ${
            msg.type === 'ok'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {msg.text}
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-6">
          <form onSubmit={createUser} className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[var(--brand-secondary)]" />
              <span>Add New Admin User</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <input required placeholder="Full Name" className={inputCls} value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
              <input required type="email" placeholder="Email" className={inputCls} value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              <input required type="password" minLength={8} placeholder="Initial Password (8+ chars)" className={inputCls} value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
              <select className={inputCls} value={newUser.role_id} onChange={(e) => setNewUser({ ...newUser, role_id: Number(e.target.value) })}>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <Button type="submit">
                <Plus className="w-4 h-4" /> Add User
              </Button>
            </div>
          </form>

          <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Last Login</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold">{u.role_name}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDateShort(u.last_login_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={async () => {
                          await fetch(`/api/admin/users/${u.id}`, { method: 'DELETE' });
                          await loadUsers();
                        }}
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
      )}

      {tab === 'logs' && (
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td className="px-4 py-2.5 text-slate-500">{l.created_at}</td>
                    <td className="px-4 py-2.5 font-semibold">{l.admin_name || 'System'}</td>
                    <td className="px-4 py-2.5 font-mono uppercase">{l.action}</td>
                    <td className="px-4 py-2.5">{l.module}</td>
                    <td className="px-4 py-2.5 text-slate-600">{l.description}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-400">{l.ip_address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'password' && (
        <form onSubmit={changePassword} className="max-w-md rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[var(--brand-secondary)]" />
            <span>Update Your Admin Password</span>
          </h2>
          <input
            required
            type="password"
            placeholder="Current Password"
            className={inputCls}
            value={pwdForm.currentPassword}
            onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
          />
          <input
            required
            type="password"
            placeholder="New Password (min 8 chars, 1 uppercase, 1 number)"
            className={inputCls}
            value={pwdForm.newPassword}
            onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
          />
          <input
            required
            type="password"
            placeholder="Confirm New Password"
            className={inputCls}
            value={pwdForm.confirmPassword}
            onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
          />
          <Button type="submit">Update Password</Button>
        </form>
      )}
    </div>
  );
}
