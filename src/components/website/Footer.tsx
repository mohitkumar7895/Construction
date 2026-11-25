import React from 'react';
import Link from 'next/link';
import { Clock, Mail, MapPin, MessageCircle, Phone, ArrowUpRight } from 'lucide-react';
import type { SiteBundle } from '@/types';
import { buildTelUrl, buildWhatsAppUrl } from '@/lib/utils';
import { RevealSection } from '@/components/animations/GsapPrimitives';

export function Footer({ bundle }: { bundle: SiteBundle }) {
  const { website, company, contact, footerSections, socialLinks } = bundle;
  const year = new Date().getFullYear();
  const whatsappUrl = buildWhatsAppUrl(contact.whatsapp_number, contact.whatsapp_default_message);

  return (
    <footer className="bg-[var(--brand-dark)] text-slate-300 border-t border-white/10 relative overflow-hidden">
      <div className="bg-blueprint-grid absolute inset-0 opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        <RevealSection className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3">
              {website.logo_dark_url || website.logo_url ? (
                <img
                  src={website.logo_dark_url || website.logo_url || ''}
                  alt={website.site_name}
                  className="h-10 w-auto object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="w-11 h-11 rounded-[var(--brand-radius)] bg-[var(--brand-secondary)] text-[#0B0F14] flex items-center justify-center font-extrabold text-lg tracking-tight">
                  {website.site_name
                    .split(' ')
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-lg font-bold text-white leading-tight">{website.site_name}</p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--brand-secondary)] font-semibold">
                  {company.business_type || 'Construction & Infrastructure'}
                </p>
              </div>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              {company.short_intro ||
                'Delivering residential, commercial, architectural planning, and turnkey construction solutions across Haldwani and Uttarakhand.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--brand-radius)] bg-emerald-600/20 border border-emerald-500/35 text-emerald-300 hover:bg-emerald-600 hover:text-white text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[var(--brand-radius)] bg-white/5 border border-white/15 text-white hover:border-[var(--brand-secondary)] text-xs font-semibold transition-colors"
              >
                <span>Request Quote</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[var(--brand-secondary)]" />
              </Link>
            </div>

            {socialLinks.length > 0 && (
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                {socialLinks.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-slate-300 hover:border-[var(--brand-secondary)] hover:text-[var(--brand-secondary)] transition-colors"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Footer Link Columns */}
          {footerSections.slice(0, 2).map((section) => (
            <div key={section.id} className="lg:col-span-2 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-secondary)]">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {(section.links || []).map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      target={link.target || '_self'}
                      className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
                    >
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Details Column */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-secondary)]">
              Head Office & Contact
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[var(--brand-secondary)] mt-0.5 shrink-0" />
                <span>
                  <strong className="text-white font-semibold block">{contact.owner_name}</strong>
                  {contact.address_line}, {contact.district}, {contact.state} – {contact.pin_code},{' '}
                  {contact.country}
                </span>
              </li>
              <li>
                <a
                  href={buildTelUrl(contact.phone)}
                  className="flex items-center gap-3 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 text-[var(--brand-secondary)] shrink-0" />
                  <span>{contact.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3 hover:text-white transition-colors break-all"
                >
                  <Mail className="w-4 h-4 text-[var(--brand-secondary)] shrink-0" />
                  <span>{contact.email}</span>
                </a>
              </li>
              {contact.working_hours && (
                <li className="flex items-start gap-3 text-slate-400">
                  <Clock className="w-4 h-4 text-[var(--brand-secondary)] mt-0.5 shrink-0" />
                  <span>{contact.working_hours}</span>
                </li>
              )}
            </ul>
          </div>
        </RevealSection>

        {/* Bottom Legal & Dynamic Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {year} <span className="text-white font-medium">{website.site_name}</span>.{' '}
            {website.footer_copyright || 'All rights reserved.'}
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="/contact" className="hover:text-[var(--brand-secondary)] transition-colors">
              Get a Quote
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
