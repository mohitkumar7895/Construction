'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Loader2, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { buildWhatsAppUrl } from '@/lib/utils';

interface InquiryFormProps {
  services?: { title: string }[];
  defaultService?: string;
  source?: string;
  whatsappNumber?: string;
  compact?: boolean;
}

const PROJECT_TYPES = [
  'Residential House / Duplex',
  'Luxury Villa',
  'Commercial Building / Showroom',
  'Industrial Warehouse / Shed',
  'Architectural Planning & 3D Design',
  'Renovation / Remodeling',
  'Turnkey Construction',
  'Civil / Infrastructure Works',
];

const BUDGET_RANGES = [
  'Under ₹15 Lakhs',
  '₹15 Lakhs – ₹35 Lakhs',
  '₹35 Lakhs – ₹75 Lakhs',
  '₹75 Lakhs – ₹1.5 Crore',
  'Above ₹1.5 Crore',
  'Need Consultation & Estimate',
];

export function InquiryForm({
  services = [],
  defaultService = '',
  source = 'contact_form',
  whatsappNumber = '+91 9897300398',
  compact = false,
}: InquiryFormProps) {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    service_required: defaultService,
    project_type: '',
    project_location: 'Haldwani, Uttarakhand',
    estimated_budget: '',
    message: '',
    privacy_consent: true,
    website_hp: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.full_name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (form.phone.trim().length < 8) {
      setError('Please enter a valid mobile number.');
      return;
    }
    if (form.message.trim().length < 5) {
      setError('Please enter brief details about your project.');
      return;
    }
    if (!form.privacy_consent) {
      setError('Please accept the privacy consent to submit your inquiry.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Could not submit inquiry. Please try again.');
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Network error. Please call or WhatsApp us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    const waText = `Hello, I just submitted an inquiry on your website. Name: ${form.full_name}, Location: ${form.project_location}, Service: ${form.service_required || 'Construction'}.`;
    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">Inquiry Submitted Successfully</h3>
        <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
          Thank you, <strong>{form.full_name}</strong>. We have logged your construction inquiry and
          will reach out to you on <strong>{form.phone}</strong> shortly.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href={buildWhatsAppUrl(whatsappNumber, waText)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:brightness-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Continue on WhatsApp</span>
          </a>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSubmitted(false);
              setForm((prev) => ({ ...prev, message: '' }));
            }}
          >
            Send Another Inquiry
          </Button>
        </div>
      </div>
    );
  }

  const inputCls =
    'w-full rounded-[var(--brand-radius)] border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--brand-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)]/30 transition';

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Honeypot anti-spam */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website_hp">Leave empty</label>
        <input
          id="website_hp"
          name="website_hp"
          tabIndex={-1}
          autoComplete="off"
          value={form.website_hp}
          onChange={(e) => setForm({ ...form, website_hp: e.target.value })}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium"
        >
          {error}
        </div>
      )}

      <div className={compact ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
        <div>
          <label htmlFor="inq-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Full Name *
          </label>
          <input
            id="inq-name"
            type="text"
            required
            autoComplete="name"
            placeholder="Your full name"
            className={inputCls}
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="inq-phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Mobile Number *
          </label>
          <input
            id="inq-phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder="+91 98XXXXXXXX"
            className={inputCls}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="inq-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Email Address
          </label>
          <input
            id="inq-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputCls}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="inq-service" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Service Required
          </label>
          <select
            id="inq-service"
            className={inputCls}
            value={form.service_required}
            onChange={(e) => setForm({ ...form, service_required: e.target.value })}
          >
            <option value="">Select a construction service</option>
            {services.map((s) => (
              <option key={s.title} value={s.title}>
                {s.title}
              </option>
            ))}
            {services.length === 0 && (
              <>
                <option value="Residential Construction">Residential Construction</option>
                <option value="Commercial Construction">Commercial Construction</option>
                <option value="Architectural Planning">Architectural Planning</option>
                <option value="Turnkey Construction">Turnkey Construction</option>
                <option value="Renovation and Remodeling">Renovation and Remodeling</option>
              </>
            )}
          </select>
        </div>

        {!compact && (
          <>
            <div>
              <label htmlFor="inq-type" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Project Type
              </label>
              <select
                id="inq-type"
                className={inputCls}
                value={form.project_type}
                onChange={(e) => setForm({ ...form, project_type: e.target.value })}
              >
                <option value="">Select project type</option>
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="inq-location" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Project Location
              </label>
              <input
                id="inq-location"
                type="text"
                placeholder="e.g., Haldwani, Kathgodam, Bhimtal"
                className={inputCls}
                value={form.project_location}
                onChange={(e) => setForm({ ...form, project_location: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="inq-budget" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Estimated Budget
              </label>
              <select
                id="inq-budget"
                className={inputCls}
                value={form.estimated_budget}
                onChange={(e) => setForm({ ...form, estimated_budget: e.target.value })}
              >
                <option value="">Select estimated budget range</option>
                {BUDGET_RANGES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      <div>
        <label htmlFor="inq-message" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
          Project Details &amp; Plot Size *
        </label>
        <textarea
          id="inq-message"
          rows={compact ? 3 : 4}
          required
          placeholder="Tell us about your plot size, number of floors, preferred timeline, or questions..."
          className={inputCls}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>

      <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
        <input
          type="checkbox"
          checked={form.privacy_consent}
          onChange={(e) => setForm({ ...form, privacy_consent: e.target.checked })}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[var(--brand-primary)]"
        />
        <span>
          I consent to be contacted regarding this construction inquiry in accordance with the{' '}
          <Link href="/privacy-policy" className="underline text-slate-900 font-medium">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      <Button type="submit" variant="primary" size="lg" disabled={submitting} className="w-full">
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Submitting Inquiry...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Request Free Consultation &amp; Quotation</span>
          </>
        )}
      </Button>
    </form>
  );
}
