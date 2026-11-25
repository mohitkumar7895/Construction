import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  Calendar,
  Clock,
  Info,
  MapPin,
  MessageCircle,
  Phone,
  Ruler,
  User,
} from 'lucide-react';
import { getProjectBySlug, getSeoForEntity, getSiteBundle } from '@/services/site-data';
import { buildPageMetadata, getSiteUrl } from '@/lib/seo';
import { buildTelUrl, buildWhatsAppUrl, formatDateShort, safeJsonParse } from '@/lib/utils';
import { InnerPageHero } from '@/components/website/InnerPageHero';
import { SafeHtml } from '@/components/shared/SafeHtml';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [bundle, data, seo] = await Promise.all([
    getSiteBundle(),
    getProjectBySlug(slug),
    getSeoForEntity('project', slug),
  ]);
  if (!data) return { title: 'Project Not Found' };

  return buildPageMetadata({
    seo,
    fallbackTitle: data.project.title,
    fallbackDescription: data.project.short_description,
    path: `/projects/${slug}`,
    website: bundle.website,
    fallbackImage: data.project.featured_image || undefined,
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [bundle, data] = await Promise.all([getSiteBundle(), getProjectBySlug(slug)]);

  if (!data) notFound();

  const { project, images, relatedProjects } = data;
  const { website, contact } = bundle;
  const specs = safeJsonParse<Record<string, string>>(project.specifications_json, {});
  const specEntries = Object.entries(specs);

  const waUrl = buildWhatsAppUrl(
    contact.whatsapp_number,
    `Hello, I viewed "${project.title}" on your website and would like to discuss a similar construction project.`
  );

  return (
    <>
      <InnerPageHero
        eyebrow={`${project.category_name || 'Portfolio'} • ${project.project_status.toUpperCase()}`}
        title={project.title}
        subtitle={project.short_description}
        imageUrl={project.featured_image || '/images/residential-duplex.jpg'}
        siteUrl={getSiteUrl(website)}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'Projects', href: '/projects' },
          { name: project.title, href: `/projects/${project.slug}` },
        ]}
      />

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Showcase */}
          <div className="lg:col-span-8 space-y-10">
            {Boolean(project.is_concept) && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 flex items-start gap-3 text-sm text-amber-900">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Architectural Concept Illustration:</strong> This visual demonstrates our
                  architectural planning and engineering capability until live site photographs are
                  published by the client.
                </p>
              </div>
            )}

            {project.featured_image && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-lg aspect-[16/10]">
                <img
                  src={project.featured_image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {project.full_description && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Project Narrative</h2>
                <SafeHtml html={project.full_description} />
              </div>
            )}

            {/* Specifications Table */}
            {specEntries.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  Technical Specifications
                </h2>
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <dl className="divide-y divide-slate-200">
                    {specEntries.map(([key, val]) => (
                      <div
                        key={key}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-6 py-4 bg-white odd:bg-slate-50/60"
                      >
                        <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          {key}
                        </dt>
                        <dd className="sm:col-span-2 text-sm font-medium text-slate-900">{val}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}

            {/* Before & After Comparison */}
            {(project.before_image || project.after_image) && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Before &amp; After</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {project.before_image && (
                    <figure className="rounded-xl overflow-hidden border border-slate-200">
                      <img
                        src={project.before_image}
                        alt={`${project.title} before`}
                        loading="lazy"
                        className="w-full h-64 object-cover"
                      />
                      <figcaption className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                        Before
                      </figcaption>
                    </figure>
                  )}
                  {project.after_image && (
                    <figure className="rounded-xl overflow-hidden border border-slate-200">
                      <img
                        src={project.after_image}
                        alt={`${project.title} after`}
                        loading="lazy"
                        className="w-full h-64 object-cover"
                      />
                      <figcaption className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider bg-[var(--brand-secondary)] text-[#0B0F14]">
                        After
                      </figcaption>
                    </figure>
                  )}
                </div>
              </div>
            )}

            {/* Additional Project Gallery */}
            {images.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Project Gallery</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {images.map((img) => (
                    <figure key={img.id} className="rounded-xl overflow-hidden border border-slate-200">
                      <img
                        src={img.image_url}
                        alt={img.alt_text || project.title}
                        loading="lazy"
                        className="w-full h-60 object-cover"
                      />
                      {img.caption && (
                        <figcaption className="px-4 py-2 text-xs text-slate-600 bg-slate-50">
                          {img.caption}
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Meta Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-2xl bg-[var(--brand-light)] border border-slate-200 p-6 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-200">
                  Project Summary
                </h3>
                <ul className="space-y-3.5 text-sm">
                  <li className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[var(--brand-secondary)] mt-0.5" />
                    <div>
                      <span className="block text-xs text-slate-500">Location</span>
                      <strong className="text-slate-900">{project.location}</strong>
                    </div>
                  </li>
                  {project.construction_area && (
                    <li className="flex items-start gap-3">
                      <Ruler className="w-4 h-4 text-[var(--brand-secondary)] mt-0.5" />
                      <div>
                        <span className="block text-xs text-slate-500">Construction Area</span>
                        <strong className="text-slate-900">{project.construction_area}</strong>
                      </div>
                    </li>
                  )}
                  {project.duration && (
                    <li className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-[var(--brand-secondary)] mt-0.5" />
                      <div>
                        <span className="block text-xs text-slate-500">Duration</span>
                        <strong className="text-slate-900">{project.duration}</strong>
                      </div>
                    </li>
                  )}
                  {Boolean(project.show_client_name) && project.client_name && (
                    <li className="flex items-start gap-3">
                      <User className="w-4 h-4 text-[var(--brand-secondary)] mt-0.5" />
                      <div>
                        <span className="block text-xs text-slate-500">Client</span>
                        <strong className="text-slate-900">{project.client_name}</strong>
                      </div>
                    </li>
                  )}
                  {project.start_date && (
                    <li className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-[var(--brand-secondary)] mt-0.5" />
                      <div>
                        <span className="block text-xs text-slate-500">Timeline</span>
                        <strong className="text-slate-900">
                          {formatDateShort(project.start_date)}
                          {project.completion_date
                            ? ` — ${formatDateShort(project.completion_date)}`
                            : ''}
                        </strong>
                      </div>
                    </li>
                  )}
                </ul>
              </div>

              <div className="rounded-2xl bg-[#0B0F14] text-white p-6 space-y-4">
                <h3 className="text-lg font-bold">Want to Build Something Similar?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Get a customized architectural layout and itemized quotation for your plot in
                  Haldwani, Nainital, or Uttarakhand.
                </p>
                <div className="flex flex-col gap-2.5">
                  <Link
                    href="/contact#inquiry-form"
                    className="py-3 px-4 rounded-lg bg-[var(--brand-secondary)] text-[#0B0F14] font-bold text-sm text-center"
                  >
                    Request Project Quotation
                  </Link>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[#25D366] text-white font-semibold text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Discuss on WhatsApp</span>
                  </a>
                  <a
                    href={buildTelUrl(contact.phone)}
                    className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-white/20 text-white font-semibold text-sm hover:bg-white/10"
                  >
                    <Phone className="w-4 h-4 text-[var(--brand-secondary)]" />
                    <span>{contact.phone}</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {relatedProjects.length > 0 && (
        <section className="py-16 bg-[var(--brand-light)] border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedProjects.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/projects/${rp.slug}`}
                  className="group rounded-xl overflow-hidden bg-white border border-slate-200 hover:border-[var(--brand-secondary)]"
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
        </section>
      )}
    </>
  );
}
