import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
} from 'lucide-react';
import {
  getGalleryData,
  getHeroSlides,
  getPageWithSections,
  getProcessSteps,
  getPublishedFaqs,
  getPublishedProjects,
  getPublishedServices,
  getPublishedTestimonials,
  getSeoForEntity,
  getSiteBundle,
  getVisibleStatistics,
} from '@/services/site-data';
import { buildPageMetadata } from '@/lib/seo';
import { buildTelUrl, buildWhatsAppUrl, safeJsonParse } from '@/lib/utils';
import type { WhyChooseItem } from '@/types';
import { HeroSlider } from '@/components/website/HeroSlider';
import { ProcessTimeline } from '@/components/website/ProcessTimeline';
import { GalleryShowcase } from '@/components/website/GalleryShowcase';
import { FaqAccordion } from '@/components/website/FaqAccordion';
import { InquiryForm } from '@/components/website/InquiryForm';
import { DynamicIcon } from '@/components/shared/DynamicIcon';
import { SafeHtml } from '@/components/shared/SafeHtml';
import {
  AnimatedCounter,
  MagneticWrapper,
  RevealSection,
} from '@/components/animations/GsapPrimitives';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const [bundle, seo] = await Promise.all([
    getSiteBundle(),
    getSeoForEntity('page', 'home'),
  ]);
  return buildPageMetadata({
    seo,
    fallbackTitle: `${bundle.website.site_name} | Construction Company in Haldwani, Uttarakhand`,
    fallbackDescription:
      bundle.company.short_intro ||
      'Delivering professional construction, engineering, architectural planning, and infrastructure solutions in Haldwani and across Uttarakhand.',
    path: '/',
    website: bundle.website,
  });
}

export default async function HomePage() {
  const [
    bundle,
    heroSlides,
    homePageData,
    services,
    projects,
    stats,
    processSteps,
    gallery,
    testimonials,
    faqs,
  ] = await Promise.all([
    getSiteBundle(),
    getHeroSlides(),
    getPageWithSections('home'),
    getPublishedServices({ limit: 9 }),
    getPublishedProjects({ limit: 6 }),
    getVisibleStatistics(),
    getProcessSteps(),
    getGalleryData(),
    getPublishedTestimonials(),
    getPublishedFaqs(),
  ]);

  const { website, company, contact } = bundle;
  const whyChooseUs = safeJsonParse<WhyChooseItem[]>(company.why_choose_us_json, []);
  const whatsappUrl = buildWhatsAppUrl(contact.whatsapp_number, contact.whatsapp_default_message);

  // Build ordered visible sections map from Page Builder
  const sections = homePageData?.sections ?? [];
  const sectionByKey = new Map(sections.map((s) => [s.section_key, s]));
  const isSectionVisible = (key: string) => {
    if (sections.length === 0) return true;
    const sec = sectionByKey.get(key);
    return sec ? Boolean(sec.is_visible) : true;
  };

  return (
    <>
      {/* SECTION 1: Cinematic Hero */}
      {isSectionVisible('hero') && (
        <HeroSlider slides={heroSlides} contact={contact} companyName={website.site_name} />
      )}

      {/* SECTION 2: Company Introduction */}
      {isSectionVisible('company_intro') && (
        <section className="py-20 lg:py-28 bg-white relative overflow-hidden">
          <div className="bg-blueprint-light absolute inset-0 opacity-60 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            <RevealSection className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-6 relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 aspect-[4/3]">
                  <img
                    src={company.about_image_url || '/images/construction-team.jpg'}
                    alt={`${website.site_name} engineering and construction team`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14]/70 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-4 bg-[#0B0F14]/85 backdrop-blur-md border border-white/15 rounded-xl p-4 text-white">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--brand-secondary)] font-bold">
                        Leadership
                      </p>
                      <p className="text-base font-bold">{company.owner_name}</p>
                      <p className="text-xs text-slate-300">
                        {company.owner_title || 'Founder & Managing Director'}
                      </p>
                    </div>
                    <span className="px-3 py-1.5 rounded-lg bg-[var(--brand-secondary)]/15 border border-[var(--brand-secondary)]/40 text-[var(--brand-secondary)] text-xs font-bold">
                      {contact.city}, UK
                    </span>
                  </div>
                </div>
                <div className="hidden sm:block absolute -top-5 -left-5 w-24 h-24 border-t-4 border-l-4 border-[var(--brand-secondary)] rounded-tl-xl pointer-events-none" />
              </div>

              <div className="lg:col-span-6 space-y-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-secondary)]">
                  {sectionByKey.get('company_intro')?.subheading || 'About Our Practice'}
                </p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--brand-primary)] leading-tight">
                  {sectionByKey.get('company_intro')?.heading ||
                    'Building Excellence with Precision and Trust'}
                </h2>
                <p className="text-base text-slate-600 leading-relaxed">
                  {company.about_overview || company.short_intro}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="rounded-xl bg-[var(--brand-light)] border border-slate-200/80 p-4">
                    <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm mb-1.5">
                      <ShieldCheck className="w-5 h-5 text-[var(--brand-secondary)]" />
                      <span>Quality Assurance</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {company.quality_assurance ||
                        'Verified structural steel, certified cement grades, and stage-wise site quality checklists.'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[var(--brand-light)] border border-slate-200/80 p-4">
                    <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm mb-1.5">
                      <CheckCircle2 className="w-5 h-5 text-[var(--brand-secondary)]" />
                      <span>Safety Standards</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {company.safety_standards ||
                        'Structured site safety protocols, PPE discipline, and supervised civil operations.'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 flex flex-wrap items-center gap-4">
                  <MagneticWrapper>
                    <Link
                      href="/about"
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[var(--brand-radius)] bg-[var(--brand-primary)] text-white font-semibold text-sm hover:bg-slate-800 transition-colors"
                    >
                      <span>Read More About Us</span>
                      <ArrowRight className="w-4 h-4 text-[var(--brand-secondary)]" />
                    </Link>
                  </MagneticWrapper>
                  <a
                    href={buildTelUrl(contact.phone)}
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-800 hover:text-[var(--brand-secondary)] transition-colors"
                  >
                    <Phone className="w-4 h-4 text-[var(--brand-secondary)]" />
                    <span>{contact.phone}</span>
                  </a>
                </div>
              </div>
            </RevealSection>
          </div>
        </section>
      )}

      {/* SECTION 3: Our Construction Services */}
      {isSectionVisible('services') && services.length > 0 && (
        <section className="py-20 lg:py-28 bg-[var(--brand-dark)] text-white relative overflow-hidden">
          <div className="bg-blueprint-grid absolute inset-0 opacity-35 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            <RevealSection className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-secondary)] mb-3">
                  {sectionByKey.get('services')?.subheading || 'What We Build'}
                </p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  {sectionByKey.get('services')?.heading || 'Our Construction Services'}
                </h2>
                <p className="mt-4 text-slate-400 text-base">
                  {sectionByKey.get('services')?.description ||
                    'End-to-end residential, commercial, architectural planning, structural engineering, and turnkey contracting solutions.'}
                </p>
              </div>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--brand-secondary)] hover:underline shrink-0"
              >
                <span>Explore All Services</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </RevealSection>

            <RevealSection
              staggerSelector="[data-service-card]"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {services.slice(0, 6).map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  data-service-card
                  className="group rounded-2xl overflow-hidden bg-white/[0.04] border border-white/10 hover:border-[var(--brand-secondary)]/60 transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-52 overflow-hidden bg-slate-900">
                    <img
                      src={service.featured_image || '/images/commercial-project.jpg'}
                      alt={service.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/25 to-transparent" />
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-lg bg-[var(--brand-secondary)] text-[#0B0F14] flex items-center justify-center shadow-lg">
                      <DynamicIcon name={service.icon} className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    {service.category_name && (
                      <span className="text-[11px] uppercase tracking-wider text-[var(--brand-secondary)] font-semibold mb-1.5">
                        {service.category_name}
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-white group-hover:text-[var(--brand-secondary)] transition-colors">
                      {service.title}
                    </h3>
                    <p className="mt-2.5 text-sm text-slate-400 leading-relaxed line-clamp-3 flex-1">
                      {service.short_description}
                    </p>
                    <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-300 group-hover:text-[var(--brand-secondary)]">
                      <span>View Service Details</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </RevealSection>
          </div>
        </section>
      )}

      {/* SECTION 4: Why Choose Us */}
      {isSectionVisible('why_choose_us') && whyChooseUs.length > 0 && (
        <section className="py-20 lg:py-28 bg-[var(--brand-light)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <RevealSection className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-secondary)] mb-3">
                {sectionByKey.get('why_choose_us')?.subheading || 'The Engineering Standard'}
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--brand-primary)]">
                {sectionByKey.get('why_choose_us')?.heading || 'Why Choose Us'}
              </h2>
              <p className="mt-4 text-slate-600">
                {sectionByKey.get('why_choose_us')?.description ||
                  'Built on transparent pricing, certified materials, and disciplined site execution.'}
              </p>
            </RevealSection>

            <RevealSection
              staggerSelector="[data-why-card]"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {whyChooseUs.map((item, idx) => (
                <div
                  key={idx}
                  data-why-card
                  className="rounded-xl bg-white border border-slate-200/90 p-6 hover:border-[var(--brand-secondary)] hover:shadow-lg transition-all"
                >
                  <div className="w-11 h-11 rounded-lg bg-[var(--brand-primary)] text-[var(--brand-secondary)] flex items-center justify-center mb-5">
                    <DynamicIcon name={item.icon || 'ShieldCheck'} className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </RevealSection>
          </div>
        </section>
      )}

      {/* SECTION 5: Featured Projects */}
      {isSectionVisible('featured_projects') && projects.length > 0 && (
        <section className="py-20 lg:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <RevealSection className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-secondary)] mb-3">
                  {sectionByKey.get('featured_projects')?.subheading || 'Selected Works'}
                </p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--brand-primary)]">
                  {sectionByKey.get('featured_projects')?.heading ||
                    'Featured Projects & Architectural Concepts'}
                </h2>
                <p className="mt-4 text-slate-600">
                  Explore residential duplexes, hillside villas, commercial centers, and
                  infrastructure blueprints tailored for Uttarakhand.
                </p>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-[var(--brand-radius)] bg-[var(--brand-primary)] text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shrink-0"
              >
                <span>View Full Portfolio</span>
                <ArrowRight className="w-4 h-4 text-[var(--brand-secondary)]" />
              </Link>
            </RevealSection>

            <RevealSection
              staggerSelector="[data-project-card]"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7"
            >
              {projects.map((project) => (
                <article
                  key={project.id}
                  data-project-card
                  className="group rounded-2xl overflow-hidden bg-white border border-slate-200 hover:border-[var(--brand-secondary)] hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <Link href={`/projects/${project.slug}`} className="relative block aspect-[16/11] overflow-hidden bg-slate-900">
                    <img
                      src={project.featured_image || '/images/residential-duplex.jpg'}
                      alt={project.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2">
                      {project.category_name && (
                        <span className="px-2.5 py-1 rounded bg-[#0B0F14]/80 backdrop-blur-sm text-[11px] font-bold uppercase tracking-wider text-white">
                          {project.category_name}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded bg-[var(--brand-secondary)] text-[#0B0F14] text-[11px] font-bold uppercase tracking-wider">
                        {project.project_status}
                      </span>
                    </div>
                    {Boolean(project.is_concept) && (
                      <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-black/70 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                        Architectural Concept
                      </span>
                    )}
                  </Link>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-[var(--brand-secondary)]" />
                      <span>{project.location}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-[var(--brand-primary)]">
                      <Link href={`/projects/${project.slug}`}>{project.title}</Link>
                    </h3>
                    <p className="mt-2.5 text-sm text-slate-600 line-clamp-3 flex-1">
                      {project.short_description}
                    </p>
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        {project.construction_area || 'Custom Scale'}
                      </span>
                      <Link
                        href={`/projects/${project.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--brand-primary)] hover:text-[var(--brand-secondary)]"
                      >
                        <span>View Project</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </RevealSection>
          </div>
        </section>
      )}

      {/* SECTION 6: Animated Statistics (Strictly hidden unless admin enters real verified values > 0) */}
      {isSectionVisible('statistics') && stats.length > 0 && (
        <section className="py-16 bg-[var(--brand-primary)] text-white border-y border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 text-center">
              {stats.map((stat) => (
                <div key={stat.id} className="space-y-2">
                  <div className="w-10 h-10 rounded-lg bg-[var(--brand-secondary)]/15 text-[var(--brand-secondary)] flex items-center justify-center mx-auto">
                    <DynamicIcon name={stat.icon} className="w-5 h-5" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-white">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-xs uppercase tracking-wider text-slate-300 font-semibold">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 7: Construction Process Timeline */}
      {isSectionVisible('process') && processSteps.length > 0 && (
        <section className="py-20 lg:py-28 bg-[#0B0F14] text-white relative overflow-hidden">
          <div className="bg-blueprint-grid absolute inset-0 opacity-30 pointer-events-none" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            <RevealSection className="max-w-2xl mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-secondary)] mb-3">
                Blueprint to Handover
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Our Construction Process
              </h2>
              <p className="mt-4 text-slate-400">
                Every project follows a transparent seven-stage civil engineering workflow designed
                for predictable budgets, quality verification, and timely completion.
              </p>
            </RevealSection>
            <ProcessTimeline steps={processSteps} />
          </div>
        </section>
      )}

      {/* SECTION 8: Gallery Preview */}
      {isSectionVisible('gallery') && gallery.images.length > 0 && (
        <section className="py-20 lg:py-28 bg-[var(--brand-light)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <RevealSection className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-secondary)] mb-2">
                  Visual Archive
                </p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--brand-primary)]">
                  Architectural &amp; Site Gallery
                </h2>
              </div>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-[var(--brand-radius)] bg-[var(--brand-primary)] text-white text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors shrink-0"
              >
                <span>View Full Gallery</span>
                <ArrowRight className="w-4 h-4 text-[var(--brand-secondary)]" />
              </Link>
            </RevealSection>

            <GalleryShowcase
              categories={gallery.categories}
              images={gallery.images}
              initialVisibleCount={16}
            />
          </div>
        </section>
      )}

      {/* SECTION 9: Client Testimonials (Only shown when real client reviews are published in Admin) */}
      {isSectionVisible('testimonials') && testimonials.length > 0 && (
        <section className="py-20 lg:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <RevealSection className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-secondary)] mb-3">
                Client Perspectives
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--brand-primary)]">
                What Our Clients Say
              </h2>
            </RevealSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl bg-[var(--brand-light)] border border-slate-200 p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1 text-[var(--brand-secondary)] mb-4">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">&ldquo;{t.review}&rdquo;</p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-3">
                    {t.client_photo ? (
                      <img
                        src={t.client_photo}
                        alt={t.client_name}
                        loading="lazy"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--brand-primary)] text-[var(--brand-secondary)] flex items-center justify-center font-bold text-sm">
                        {t.client_name.slice(0, 1)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-900">{t.client_name}</p>
                      <p className="text-xs text-slate-500">
                        {t.designation || t.project_reference || 'Verified Client'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 10: FAQ */}
      {isSectionVisible('faq') && faqs.length > 0 && (
        <section className="py-20 lg:py-28 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <RevealSection className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-secondary)] mb-3">
                Clarity Before You Build
              </p>
              <h2 id="home-faq-heading" className="text-3xl sm:text-4xl font-bold text-[var(--brand-primary)]">
                Frequently Asked Questions
              </h2>
            </RevealSection>
            <FaqAccordion items={faqs} headingId="home-faq-heading" />
          </div>
        </section>
      )}

      {/* SECTION 11: Consultation CTA */}
      {isSectionVisible('consultation_cta') && (
        <section className="relative py-24 bg-[#0B0F14] overflow-hidden">
          <img
            src="/images/modern-villa.jpg"
            alt="Luxury architectural background"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F14] via-[#0B0F14]/85 to-[#0B0F14]/70" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--brand-secondary)] mb-4">
              Start Your Construction Project
            </p>
            <h2 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
              {sectionByKey.get('consultation_cta')?.heading ||
                "Let's Build Something Extraordinary Together."}
            </h2>
            <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
              Book a free site visit and transparent construction quotation in Haldwani, Nainital,
              or anywhere across Uttarakhand.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <MagneticWrapper>
                <Link
                  href="/contact#inquiry-form"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-[var(--brand-radius)] bg-[var(--brand-secondary)] text-[#0B0F14] font-bold text-sm uppercase tracking-wider hover:brightness-105 transition-all"
                >
                  <span>Request a Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </MagneticWrapper>
              <a
                href={buildTelUrl(contact.phone)}
                className="inline-flex items-center gap-2 px-6 py-4 rounded-[var(--brand-radius)] border border-white/30 bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-all"
              >
                <Phone className="w-4 h-4 text-[var(--brand-secondary)]" />
                <span>Call Now: {contact.phone}</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-[var(--brand-radius)] bg-[#25D366] text-white font-semibold text-sm hover:brightness-95 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Custom Admin-Added Dynamic Sections (Rich Text / Custom Banner / Video) */}
      {sections
        .filter((s) => ['rich_text', 'custom_banner', 'video'].includes(s.section_type))
        .map((sec) => (
          <section
            key={sec.id}
            style={{ backgroundColor: sec.background_color || '#FFFFFF' }}
            className="py-16"
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              {sec.heading && (
                <h2 className="text-3xl font-bold text-[var(--brand-primary)] mb-4">
                  {sec.heading}
                </h2>
              )}
              {sec.description && <SafeHtml html={sec.description} />}
            </div>
          </section>
        ))}

      {/* SECTION 12: Contact and Location */}
      {isSectionVisible('contact_location') && (
        <section id="contact-section" className="py-20 lg:py-28 bg-[var(--brand-light)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-secondary)] mb-2">
                    Contact &amp; Location
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-bold text-[var(--brand-primary)]">
                    Visit or Speak With Us in {contact.city}
                  </h2>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                    Reach out directly to <strong>{contact.owner_name}</strong> for site
                    consultations, architectural drawings, and detailed construction estimates.
                  </p>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
                  <div className="flex items-start gap-3.5">
                    <MapPin className="w-5 h-5 text-[var(--brand-secondary)] mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-bold text-slate-900">Office Location</p>
                      <p className="text-slate-600">
                        {contact.address_line}, {contact.district}, {contact.state} –{' '}
                        {contact.pin_code}, {contact.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <Phone className="w-5 h-5 text-[var(--brand-secondary)] mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-bold text-slate-900">Phone &amp; WhatsApp</p>
                      <a
                        href={buildTelUrl(contact.phone)}
                        className="text-slate-700 hover:text-[var(--brand-primary)] font-medium"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <Mail className="w-5 h-5 text-[var(--brand-secondary)] mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-bold text-slate-900">Email</p>
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-slate-700 hover:text-[var(--brand-primary)] break-all"
                      >
                        {contact.email}
                      </a>
                    </div>
                  </div>

                  {contact.working_hours && (
                    <div className="flex items-start gap-3.5">
                      <Clock className="w-5 h-5 text-[var(--brand-secondary)] mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-bold text-slate-900">Working Hours</p>
                        <p className="text-slate-600">{contact.working_hours}</p>
                      </div>
                    </div>
                  )}
                </div>

                {contact.google_maps_embed_url && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-64 bg-slate-200">
                    <iframe
                      title={`${website.site_name} Haldwani Location Map`}
                      src={contact.google_maps_embed_url}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full border-0"
                    />
                  </div>
                )}
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">
                    Request a Construction Consultation
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">
                    Share your plot location and project scope — our team responds promptly.
                  </p>
                  <InquiryForm
                    services={services}
                    source="home_contact"
                    whatsappNumber={contact.whatsapp_number}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
