import React from 'react';
import type { Metadata } from 'next';
import { Clock, Mail, MapPin, MessageCircle, Phone, UserCheck } from 'lucide-react';
import {
  getPublishedServices,
  getSeoForEntity,
  getSiteBundle,
} from '@/services/site-data';
import { buildPageMetadata, getSiteUrl } from '@/lib/seo';
import { buildTelUrl, buildWhatsAppUrl } from '@/lib/utils';
import { InnerPageHero } from '@/components/website/InnerPageHero';
import { InquiryForm } from '@/components/website/InquiryForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const [bundle, seo] = await Promise.all([
    getSiteBundle(),
    getSeoForEntity('page', 'contact'),
  ]);
  return buildPageMetadata({
    seo,
    fallbackTitle: 'Contact Us',
    fallbackDescription:
      'Contact Sartaj Hussain in Haldwani, Nainital, Uttarakhand (263139) for construction estimates and site inspections. Call +91 9897300398.',
    path: '/contact',
    website: bundle.website,
  });
}

export default async function ContactPage() {
  const [bundle, services] = await Promise.all([getSiteBundle(), getPublishedServices()]);
  const { website, contact } = bundle;
  const whatsappUrl = buildWhatsAppUrl(contact.whatsapp_number, contact.whatsapp_default_message);

  return (
    <>
      <InnerPageHero
        eyebrow="Get in Touch"
        title="Start Your Construction Project"
        subtitle={`Speak directly with ${contact.owner_name} in ${contact.city}, ${contact.state} for site visits, architectural planning, and itemized quotations.`}
        imageUrl="/images/architectural-planning.jpg"
        siteUrl={getSiteUrl(website)}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Contact Us', href: '/contact' },
        ]}
      />

      <section className="py-16 lg:py-24 bg-[var(--brand-light)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Quick Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)] text-[var(--brand-secondary)] flex items-center justify-center mb-4">
                <UserCheck className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Owner / Contact</p>
              <p className="mt-1 text-base font-bold text-slate-900">{contact.owner_name}</p>
              <p className="text-xs text-slate-500 mt-1">{website.site_name}</p>
            </div>

            <a
              href={buildTelUrl(contact.phone)}
              className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:border-[var(--brand-secondary)] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)] text-[var(--brand-secondary)] flex items-center justify-center mb-4">
                <Phone className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Call Directly</p>
              <p className="mt-1 text-base font-bold text-slate-900">{contact.phone}</p>
              <p className="text-xs text-emerald-700 font-medium mt-1">Click to call now</p>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:border-emerald-500 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-[#25D366] text-white flex items-center justify-center mb-4">
                <MessageCircle className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">WhatsApp Inquiry</p>
              <p className="mt-1 text-base font-bold text-slate-900">{contact.whatsapp_number}</p>
              <p className="text-xs text-emerald-700 font-medium mt-1">Instant chat support</p>
            </a>

            <a
              href={`mailto:${contact.email}`}
              className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:border-[var(--brand-secondary)] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary)] text-[var(--brand-secondary)] flex items-center justify-center mb-4">
                <Mail className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</p>
              <p className="mt-1 text-sm font-bold text-slate-900 break-all">{contact.email}</p>
              <p className="text-xs text-slate-500 mt-1">Send plans &amp; drawings</p>
            </a>
          </div>

          {/* Main Grid: Inquiry Form + Office Map & Address */}
          <div id="inquiry-form" className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-6 sm:p-9 shadow-sm">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Request a Free Quotation
              </h2>
              <p className="mt-2 text-sm text-slate-600 mb-7">
                Fill in your project details below. All inquiries are stored securely and reviewed
                directly by our team.
              </p>
              <InquiryForm
                services={services}
                source="contact_page"
                whatsappNumber={contact.whatsapp_number}
              />
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl bg-[#0B0F14] text-white p-7 space-y-5">
                <h3 className="text-xl font-bold">Office Location &amp; Hours</h3>
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <MapPin className="w-5 h-5 text-[var(--brand-secondary)] shrink-0 mt-0.5" />
                  <p>
                    {contact.address_line}, {contact.district}, {contact.state} – {contact.pin_code}
                    , {contact.country}
                  </p>
                </div>
                {contact.working_hours && (
                  <div className="flex items-start gap-3 text-sm text-slate-300">
                    <Clock className="w-5 h-5 text-[var(--brand-secondary)] shrink-0 mt-0.5" />
                    <p>{contact.working_hours}</p>
                  </div>
                )}
              </div>

              {contact.google_maps_embed_url && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-80 bg-slate-200">
                  <iframe
                    title={`${website.site_name} Haldwani Google Map`}
                    src={contact.google_maps_embed_url}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full border-0"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
