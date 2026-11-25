'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, MessageCircle, Phone } from 'lucide-react';
import type { ContactSettings } from '@/types';
import { buildTelUrl, buildWhatsAppUrl, cn } from '@/lib/utils';

export function FloatingActions({ contact }: { contact: ContactSettings }) {
  const showAny =
    contact.floating_whatsapp_enabled ||
    contact.floating_call_enabled ||
    contact.floating_quote_enabled;

  if (!showAny) return null;

  const isLeft = contact.floating_position === 'bottom-left';
  const whatsappUrl = buildWhatsAppUrl(
    contact.whatsapp_number,
    contact.whatsapp_default_message
  );

  return (
    <div
      className={cn(
        'fixed bottom-5 z-40 flex flex-col gap-2.5',
        isLeft ? 'left-4 sm:left-6 items-start' : 'right-4 sm:right-6 items-end'
      )}
    >
      {Boolean(contact.floating_quote_enabled) && (
        <Link
          href="/contact#inquiry-form"
          style={{ backgroundColor: contact.floating_quote_color || '#F5B301' }}
          className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[#0B0F14] font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-transform"
          aria-label="Get a construction quote"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Get a Quote</span>
        </Link>
      )}

      {Boolean(contact.floating_call_enabled) && (
        <a
          href={buildTelUrl(contact.phone)}
          style={{ backgroundColor: contact.floating_call_color || '#111827' }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-white border border-white/15 font-semibold text-xs tracking-wide shadow-lg hover:scale-105 transition-transform"
          aria-label={`Call ${contact.phone}`}
        >
          <Phone className="w-4 h-4 text-[var(--brand-secondary)]" />
          <span className="hidden sm:inline">Call Now</span>
        </a>
      )}

      {Boolean(contact.floating_whatsapp_enabled) && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ backgroundColor: contact.floating_whatsapp_color || '#25D366' }}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-full text-white font-semibold text-xs tracking-wide shadow-xl hover:scale-105 transition-transform"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
      )}
    </div>
  );
}
