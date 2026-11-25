import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Eye,
  HardHat,
  MessageCircle,
  Phone,
  ShieldCheck,
  Target,
} from 'lucide-react';
import {
  getPublishedTeam,
  getSeoForEntity,
  getSiteBundle,
  getVisibleStatistics,
} from '@/services/site-data';
import { buildPageMetadata, getSiteUrl } from '@/lib/seo';
import { buildTelUrl, buildWhatsAppUrl, safeJsonParse } from '@/lib/utils';
import type { CoreValueItem, WhyChooseItem } from '@/types';
import { InnerPageHero } from '@/components/website/InnerPageHero';
import { DynamicIcon } from '@/components/shared/DynamicIcon';
import { AnimatedCounter, RevealSection } from '@/components/animations/GsapPrimitives';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const [bundle, seo] = await Promise.all([
    getSiteBundle(),
    getSeoForEntity('page', 'about'),
  ]);
  return buildPageMetadata({
    seo,
    fallbackTitle: 'About Us',
    fallbackDescription:
      bundle.company.about_overview ||
      'Learn about our construction and civil engineering expertise in Haldwani, Uttarakhand.',
    path: '/about',
    website: bundle.website,
  });
}

export default async function AboutPage() {
  const [bundle, team, stats] = await Promise.all([
    getSiteBundle(),
    getPublishedTeam(),
    getVisibleStatistics(),
  ]);

  const { website, company, contact } = bundle;
  const siteUrl = getSiteUrl(website);
  const coreValues = safeJsonParse<CoreValueItem[]>(company.core_values_json, []);
  const expertise = safeJsonParse<string[]>(company.expertise_json, []);
  const whyChooseUs = safeJsonParse<WhyChooseItem[]>(company.why_choose_us_json, []);
  const whatsappUrl = buildWhatsAppUrl(contact.whatsapp_number, contact.whatsapp_default_message);

  return (
    <>
      <InnerPageHero
        eyebrow="About Our Company"
        title="Building Excellence with Precision and Trust"
        subtitle={company.short_intro}
        imageUrl={company.about_image_url || '/images/construction-team.jpg'}
        siteUrl={siteUrl}
        breadcrumbs={[
          { name: 'Home', href: '/' },
          { name: 'About Us', href: '/about' },
        ]}
      />

      {/* Company Overview & Founder Introduction */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <RevealSection className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-6">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-secondary)]">
                Company Overview
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--brand-primary)] leading-tight">
                {company.company_name} — {company.business_type}
              </h2>
              <p className="text-base text-slate-600 leading-relaxed">{company.about_overview}</p>
              {company.company_history && (
                <div className="pt-2">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Our Journey &amp; Regional Focus</h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {company.company_history}
                  </p>
                </div>
              )}

              {expertise.length > 0 && (
                <div className="pt-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Core Construction Expertise</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {expertise.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-3 rounded-lg bg-[var(--brand-light)] border border-slate-200/70 text-sm font-medium text-slate-800"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[var(--brand-secondary)] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Founder Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-[#0B0F14] text-white overflow-hidden shadow-xl border border-white/10">
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={company.owner_image_url || '/images/construction-team.jpg'}
                    alt={company.owner_name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-7 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--brand-secondary)] font-bold">
                      Founder &amp; Leadership
                    </p>
                    <h3 className="text-2xl font-bold text-white mt-1">{company.owner_name}</h3>
                    <p className="text-sm text-slate-400">
                      {company.owner_title || 'Founder & Managing Director'}
                    </p>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{company.owner_bio}</p>
                  <div className="pt-3 border-t border-white/10 flex flex-wrap gap-3">
                    <a
                      href={buildTelUrl(contact.phone)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--brand-secondary)] text-[#0B0F14] font-bold text-xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{contact.phone}</span>
                    </a>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 text-white font-semibold text-xs hover:bg-white/20"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-[var(--brand-light)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[var(--brand-primary)] text-[var(--brand-secondary)] flex items-center justify-center mb-5">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
              <p className="mt-3 text-slate-600 leading-relaxed">{company.mission}</p>
            </div>
            <div className="rounded-2xl bg-[#0B0F14] text-white border border-white/10 p-8 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[var(--brand-secondary)] text-[#0B0F14] flex items-center justify-center mb-5">
                <Eye className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Our Vision</h2>
              <p className="mt-3 text-slate-300 leading-relaxed">{company.vision}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      {coreValues.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-secondary)] mb-2">
                Guiding Principles
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--brand-primary)]">
                Our Core Values
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {coreValues.map((val, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 p-6 bg-[var(--brand-light)]"
                >
                  <span className="text-xs font-mono font-bold text-[var(--brand-secondary)]">
                    0{idx + 1}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">{val.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{val.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quality Assurance & Safety Standards */}
      <section className="py-20 bg-[#0B0F14] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-8">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-[var(--brand-secondary)]" />
              <h2 className="text-2xl font-bold">Quality Assurance</h2>
            </div>
            <p className="text-slate-300 leading-relaxed">{company.quality_assurance}</p>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-8">
            <div className="flex items-center gap-3 mb-4">
              <HardHat className="w-6 h-6 text-[var(--brand-secondary)]" />
              <h2 className="text-2xl font-bold">Site Safety Standards</h2>
            </div>
            <p className="text-slate-300 leading-relaxed">{company.safety_standards}</p>
          </div>
        </div>
      </section>

      {/* Verified Achievements (Hidden until real stats are configured in admin) */}
      {stats.length > 0 && (
        <section className="py-16 bg-[var(--brand-secondary)] text-[#0B0F14]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-5 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.id}>
                <p className="text-4xl font-extrabold">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </p>
                <p className="text-xs font-bold uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Team Section */}
      {team.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-12">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-secondary)] mb-2">
                People Behind The Work
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--brand-primary)]">
                Leadership &amp; Team
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {team.map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl overflow-hidden border border-slate-200 bg-[var(--brand-light)]"
                >
                  <div className="aspect-[16/10] bg-slate-900 overflow-hidden">
                    <img
                      src={member.photo_url || '/images/construction-team.jpg'}
                      alt={member.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-secondary)] mt-1">
                      {member.designation}
                    </p>
                    {member.bio && (
                      <p className="mt-3 text-sm text-slate-600 leading-relaxed">{member.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      {whyChooseUs.length > 0 && (
        <section className="py-20 bg-[var(--brand-light)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl font-bold text-[var(--brand-primary)] mb-10">
              Why Clients Choose {website.site_name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {whyChooseUs.map((item, idx) => (
                <div key={idx} className="rounded-xl bg-white border border-slate-200 p-6">
                  <DynamicIcon name={item.icon} className="w-5 h-5 text-[var(--brand-secondary)] mb-3" />
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Consultation CTA */}
      <section className="py-20 bg-[#0B0F14] text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Compass className="w-10 h-10 text-[var(--brand-secondary)] mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-bold">
            Planning a Construction Project in {contact.city}?
          </h2>
          <p className="mt-4 text-slate-300">
            Speak directly with {contact.owner_name} to discuss your plot, drawings, and transparent
            cost estimation.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[var(--brand-radius)] bg-[var(--brand-secondary)] text-[#0B0F14] font-bold text-sm uppercase tracking-wider"
            >
              <span>Schedule Consultation</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[var(--brand-radius)] border border-white/25 text-white font-semibold text-sm hover:bg-white/10"
            >
              <span>Explore Our Services</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
