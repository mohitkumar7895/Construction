'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import {
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  X,
  ArrowUpRight,
} from 'lucide-react';
import type { SiteBundle } from '@/types';
import { buildTelUrl, buildWhatsAppUrl, cn } from '@/lib/utils';

export function Header({ bundle }: { bundle: SiteBundle }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileDrawerRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === '/';
  const { website, contact, navigation, socialLinks } = bundle;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileDrawerRef.current) return;
    if (mobileOpen) {
      gsap.fromTo(
        mobileDrawerRef.current,
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.28, ease: 'power3.out' }
      );
    }
  }, [mobileOpen]);

  const solidHeader = scrolled || !isHome || mobileOpen;
  const whatsappUrl = buildWhatsAppUrl(contact.whatsapp_number, contact.whatsapp_default_message);

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        solidHeader
          ? 'bg-[#0B0F14]/95 backdrop-blur-md border-b border-white/10 shadow-lg'
          : 'bg-gradient-to-b from-[#0B0F14]/85 via-[#0B0F14]/45 to-transparent'
      )}
    >
      {/* Top Information Bar */}
      {Boolean(website.show_top_bar) && (
        <div
          className={cn(
            'hidden lg:block border-b border-white/10 text-xs text-slate-300 transition-all duration-300',
            scrolled ? 'h-0 overflow-hidden opacity-0 border-none' : 'py-2 opacity-100'
          )}
        >
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-1.5 hover:text-[var(--brand-secondary)] transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[var(--brand-secondary)]" />
                <span>{contact.email}</span>
              </a>
              <a
                href={buildTelUrl(contact.phone)}
                className="inline-flex items-center gap-1.5 hover:text-[var(--brand-secondary)] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[var(--brand-secondary)]" />
                <span>{contact.phone}</span>
              </a>
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-[var(--brand-secondary)]" />
                <span>
                  {contact.city}, {contact.district}, {contact.state} – {contact.pin_code}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Inquiry</span>
              </a>
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-2.5 pl-3 border-l border-white/15">
                  {socialLinks.map((s) => (
                    <a
                      key={s.id}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="text-slate-300 hover:text-[var(--brand-secondary)] transition-colors text-[11px] uppercase tracking-wider font-semibold"
                    >
                      {s.platform.slice(0, 2)}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-20 flex items-center justify-between gap-4">
          {/* Dynamic Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            {website.logo_url ? (
              <img
                src={website.logo_url}
                alt={website.site_name}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="w-10 h-10 rounded-[var(--brand-radius)] bg-[var(--brand-secondary)] text-[#0B0F14] flex items-center justify-center font-extrabold text-lg tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
                {website.site_name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
            <div className="leading-tight">
              <span className="block text-base sm:text-lg font-bold tracking-tight text-white">
                {website.site_name}
              </span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-[var(--brand-secondary)] font-semibold">
                {contact.city} • {contact.state}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  target={item.target || '_self'}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative px-3.5 py-2 text-sm font-medium transition-colors rounded-md',
                    active
                      ? 'text-[var(--brand-secondary)]'
                      : 'text-slate-200 hover:text-white'
                  )}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0.5 inset-x-3.5 h-0.5 bg-[var(--brand-secondary)] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            {website.header_cta_secondary_label && (
              <Link
                href={website.header_cta_secondary_url || '/contact#inquiry-form'}
                className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white border border-white/25 rounded-[var(--brand-radius)] hover:border-[var(--brand-secondary)] hover:text-[var(--brand-secondary)] transition-colors"
              >
                {website.header_cta_secondary_label}
              </Link>
            )}
            <Link
              href={website.header_cta_primary_url || '/contact'}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-[var(--brand-secondary)] text-[#0B0F14] rounded-[var(--brand-radius)] hover:brightness-105 transition-all shadow-sm"
            >
              <span>{website.header_cta_primary_label || 'Get a Quote'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden p-2.5 rounded-lg text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Animated Mobile Navigation Drawer */}
      {mobileOpen && (
        <div
          ref={mobileDrawerRef}
          className="lg:hidden bg-[#0B0F14] border-t border-white/10 px-4 pt-4 pb-6 shadow-2xl"
        >
          <nav aria-label="Mobile navigation" className="flex flex-col space-y-1">
            {navigation.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'px-4 py-3 rounded-lg text-base font-medium transition-colors',
                    active
                      ? 'bg-white/10 text-[var(--brand-secondary)]'
                      : 'text-slate-200 hover:bg-white/5 hover:text-white'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-2 gap-3">
            <a
              href={buildTelUrl(contact.phone)}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-white/20 text-white text-sm font-semibold"
            >
              <Phone className="w-4 h-4 text-[var(--brand-secondary)]" />
              <span>Call Now</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#25D366] text-white text-sm font-semibold"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
            <Link
              href={website.header_cta_primary_url || '/contact'}
              className="col-span-2 flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[var(--brand-secondary)] text-[#0B0F14] text-sm font-bold"
            >
              <span>{website.header_cta_primary_label || 'Get a Quote'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
