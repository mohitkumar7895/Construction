import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-5">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand-secondary)]">
          404 • Page Not Found
        </p>
        <h1 className="text-4xl font-bold">Page Unavailable</h1>
        <p className="text-sm text-slate-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-[var(--brand-secondary)] text-[#0B0F14] font-bold text-sm"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
