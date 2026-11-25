'use client';

import React, { useEffect, useRef } from 'react';

interface SafeHtmlProps {
  html: string;
  className?: string;
}

const ALLOWED_ELEMENTS = [
  'h2',
  'h3',
  'h4',
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'blockquote',
  'a',
  'hr',
  'span',
];

const ALLOWED_ATTRS = ['href', 'title', 'target', 'rel', 'class'];

export function SafeHtml({ html, className = 'rich-prose' }: SafeHtmlProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current as (HTMLDivElement & { setHTML?: (h: string, opts?: any) => void }) | null;
    if (!el) return;

    // Prefer native Sanitizer API when available; server-side sanitize-html already cleaned markup
    if (typeof Element !== 'undefined' && 'setHTML' in Element.prototype && typeof el.setHTML === 'function') {
      el.setHTML(html, {
        sanitizer: {
          elements: ALLOWED_ELEMENTS,
          attributes: ALLOWED_ATTRS,
        },
      });
    }
  }, [html]);

  return (
    <div
      ref={ref}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
