import React from 'react';

export default function WebsiteLoading() {
  return (
    <div className="min-h-screen bg-[var(--brand-light)] pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="h-64 rounded-2xl skeleton-shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-72 rounded-2xl skeleton-shimmer" />
          <div className="h-72 rounded-2xl skeleton-shimmer" />
          <div className="h-72 rounded-2xl skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}
