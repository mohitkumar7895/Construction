import React from 'react';

export interface SimpleFaq {
  id?: number | string;
  question: string;
  answer: string;
}

export function FaqAccordion({
  items,
  headingId,
}: {
  items: SimpleFaq[];
  headingId?: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div
      className="arch-accordion bg-white rounded-2xl border border-slate-200 px-6 sm:px-8 divide-y divide-slate-200/70 shadow-sm"
      aria-labelledby={headingId}
    >
      {items.map((item, idx) => (
        <details key={item.id ?? idx} open={idx === 0}>
          <summary className="text-slate-900 hover:text-[var(--brand-primary)]">
            {item.question}
          </summary>
          <div className="pb-5 pl-7 text-sm sm:text-base text-slate-600 leading-relaxed">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
