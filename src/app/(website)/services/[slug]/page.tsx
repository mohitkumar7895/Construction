import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowRight, CheckCircle2, MessageCircle, Phone } from 'lucide-react';
import {
  getSeoForEntity,
  getServiceBySlug,
  getSiteBundle,
} from '@/services/site-data';
import { buildPageMetadata, buildServiceJsonLd, getSiteUrl } from '@/lib/seo';
import { buildTelUrl, buildWhatsAppUrl, safeJsonParse } from '@/lib/utils';
import { InnerPageHero } from '@/components/website/InnerPageHero';
import { SafeHtml } from '@/components/shared/SafeHtml';
import { FaqAccordion, type SimpleFaq } from '@/components/website/FaqAccordion';
import { InquiryForm } from '@/components/website/InquiryForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [bundle, data, seo] = await Promise.all([
    getSiteBundle(),
    getServiceBySlug(slug),
    getSeoForEntity('service', slug),
  ]);

  if (!data) {
    return { title: 'Service Not Found' };
  }

  return buildPageMetadata({
    seo,
    fallbackTitle: `${data.service.title} in Haldwani, Uttarakhand`,
    fallbackDescription: data.service.short_description,
    path: `/services/${slug}`,
    website: bundle.website,
    fallbackImage: data.service.featured_image || undefined,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [bundle, data] = await Promise.all([getSiteBundle(), getServiceBySlug(slug)]);

  if (!data) notFound();

  const { service, images, relatedServices, relatedProjects } = data;
  const { website, contact } = bundle;
  const siteUrl = getSiteUrl(website);

  const benefits = safeJsonParse<string[]>(service.benefits_json, []);
  const workProcess = safeJsonParse<string[]>(service.work_process_json, []);
  const serviceFaqs = safeJsonParse<SimpleFaq[]>(service.faqs_json, []);

  const serviceJsonLd = buildServiceJsonLd({
    siteUrl,
    companyName: website.site_name,
    title: service.title,
    description: service.short_description,
    slug: service.slug,
  });

  const waUrl = buildWhatsAppUrl(
    contact.whatsapp_number,
    `Hello, I am interested in ${service.title} services in Haldwani/Uttarakhand. Please share more details.`
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      <InnerPageHero
        eyebrow={service.category_name || 'Construction Service'}
        title={service.title}
        subtitle={service.short_description}
        imageUrl={service.banner_image || service.featured_image || '/images/commercial-project.jpg'}
        siteUrl={siteUrl}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Services', href: '/services' },
          { name: service.title, href: `/services/${service.slug}` },
        ]}
      />

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            {service.featured_image && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg aspect-[16/9]">
                <img
                  src={service.featured_image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {service.detailed_content && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Service Overview</h2>
                <SafeHtml html={service.detailed_content} />
              </div>
            )}

            {/* Benefits */}
            {benefits.length > 0 && (
              <div className="rounded-2xl bg-[var(--brand-light)] border border-slate-200 p-7">
                <h2 className="text-2xl font-bold text-slate-900 mb-5">Key Advantages</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[var(--brand-secondary)] shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 font-medium">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work Process */}
            {workProcess.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-5">Execution Workflow</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {workProcess.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-5 rounded-xl border border-slate-200 bg-white"
                    >
                      <span className="w-9 h-9 rounded-lg bg-[var(--brand-primary)] text-[var(--brand-secondary)] font-mono font-bold text-sm flex items-center justify-center shrink-0">
                        0{idx + 1}
                      </span>
                      <p className="text-sm font-semibold text-slate-800 pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Gallery */}
            {images.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-5">Visual Showcase</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {images.map((img) => (
                    <figure key={img.id} className="rounded-xl overflow-hidden border border-slate-200">
                      <img
                        src={img.image_url}
                        alt={img.alt_text || service.title}
                        loading="lazy"
                        className="w-full h-56 object-cover"
                      />
                      {img.caption && (
                        <figcaption className="p-3 text-xs text-slate-600 bg-slate-50">
                          {img.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </div>
            )}

            {/* Service FAQs */}
            {serviceFaqs.length > 0 && (
              <div>
                <h2 id="service-faq-heading" className="text-2xl font-bold text-slate-900 mb-5">
                  Frequently Asked Questions
                </h2>
                <FaqAccordion items={serviceFaqs} headingId="service-faq-heading" />
              </div>
            )}
          </div>

          {/* Sticky Inquiry Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-2xl bg-[var(--brand-light)] border border-slate-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  Inquire About {service.title}
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  Request a free site inspection and transparent quotation in Haldwani &amp; Uttarakhand.
                </p>
                <InquiryForm
                  defaultService={service.title}
                  source={`service:${service.slug}`}
                  whatsappNumber={contact.whatsapp_number}
                  compact
                />
              </div>

              <div className="rounded-2xl bg-[#0B0F14] text-white p-6 space-y-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-secondary)] font-bold">
                  Direct Assistance
                </p>
                <p className="text-sm text-slate-300">
                  Prefer speaking directly with {contact.owner_name}?
                </p>
                <div className="flex flex-col gap-2.5">
                  <a
                    href={buildTelUrl(contact.phone)}
                    className="flex items-center justify-center gap-2 py-3 rounded-lg bg-[var(--brand-secondary)] text-[#0B0F14] font-bold text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call {contact.phone}</span>
                  </a>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 rounded-lg bg-[#25D366] text-white font-semibold text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Inquiry</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Related Services & Projects */}
      {(relatedServices.length > 0 || relatedProjects.length > 0) && (
        <section className="py-16 bg-[var(--brand-light)] border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-14">
            {relatedServices.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Services</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedServices.map((rs) => (
                    <Link
                      key={rs.id}
                      href={`/services/${rs.slug}`}
                      className="rounded-xl bg-white border border-slate-200 p-6 hover:border-[var(--brand-secondary)] transition-colors"
                    >
                      <h3 className="text-lg font-bold text-slate-900">{rs.title}</h3>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                        {rs.short_description}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                        Explore <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {relatedProjects.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Portfolio Concepts</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedProjects.map((rp) => (
                    <Link
                      key={rp.id}
                      href={`/projects/${rp.slug}`}
                      className="group rounded-xl overflow-hidden bg-white border border-slate-200 hover:border-[var(--brand-secondary)] transition-colors"
                    >
                      <div className="aspect-[16/10] bg-slate-900 overflow-hidden">
                        <img
                          src={rp.featured_image || '/images/residential-duplex.jpg'}
                          alt={rp.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5">
                        <p className="text-xs text-slate-500">{rp.location}</p>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{rp.title}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
