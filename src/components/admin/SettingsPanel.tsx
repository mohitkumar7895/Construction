'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type SettingsTab = 'website' | 'company' | 'contact' | 'navigation' | 'social' | 'footer';

export function SettingsPanel({ initialTab = 'website' }: { initialTab?: SettingsTab }) {
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const [website, setWebsite] = useState<any>({});
  const [company, setCompany] = useState<any>({});
  const [contact, setContact] = useState<any>({});
  const [navigation, setNavigation] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [footerSections, setFooterSections] = useState<any[]>([]);
  const [footerLinks, setFooterLinks] = useState<any[]>([]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [newNav, setNewNav] = useState({ label: '', href: '/', display_order: 10 });
  const [newSocial, setNewSocial] = useState({ platform: 'Instagram', label: 'Instagram', url: '' });
  const [newFooterLink, setNewFooterLink] = useState({ footer_section_id: 1, label: '', href: '/' });

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const load = async () => {
    const res = await fetch('/api/admin/settings');
    if (res.ok) {
      const d = await res.json();
      setWebsite(d.website || {});
      setCompany(d.company || {});
      setContact(d.contact || {});
      setNavigation(d.navigation || []);
      setSocialLinks(d.socialLinks || []);
      setFooterSections(d.footerSections || []);
      setFooterLinks(d.footerLinks || []);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveSection = async (section: 'website' | 'company' | 'contact', data: any) => {
    setStatusMsg(null);
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section, data }),
    });
    setStatusMsg(res.ok ? 'Saved and revalidated live website!' : 'Failed to save changes.');
  };

  const cmsAction = async (resource: string, action: 'create' | 'update' | 'delete', id?: number, data?: any) => {
    await fetch('/api/admin/cms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resource, action, id, data }),
    });
    await load();
    setStatusMsg('Updated successfully and synced to public website.');
  };

  const inputCls =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[var(--brand-secondary)] focus:outline-none';
  const labelCls = 'block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Site Configuration &amp; Branding</h1>
          <p className="text-sm text-slate-500">
            Update company name, contact details, navigation, social links, and footer dynamically
          </p>
        </div>
        {statusMsg && (
          <span className="px-3.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold">
            {statusMsg}
          </span>
        )}
      </div>

      {/* Sub Tabs */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['website', 'Website & Header'],
            ['company', 'Company Profile & About'],
            ['contact', 'Contact & Floating CTA'],
            ['navigation', 'Navigation Menu'],
            ['social', 'Social Media'],
            ['footer', 'Footer Links'],
          ] as [SettingsTab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              tab === key
                ? 'bg-[#0B0F14] text-[var(--brand-secondary)]'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TAB 1: WEBSITE */}
      {tab === 'website' && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Company / Site Name</label>
              <input
                className={inputCls}
                value={website.site_name || ''}
                onChange={(e) => setWebsite({ ...website, site_name: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Domain Name (Canonical Base URL)</label>
              <input
                className={inputCls}
                value={website.domain_name || ''}
                onChange={(e) => setWebsite({ ...website, domain_name: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Tagline</label>
              <input
                className={inputCls}
                value={website.tagline || ''}
                onChange={(e) => setWebsite({ ...website, tagline: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Logo URL (Light/Main)</label>
              <input
                className={inputCls}
                placeholder="/uploads/..."
                value={website.logo_url || ''}
                onChange={(e) => setWebsite({ ...website, logo_url: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Dark Logo URL</label>
              <input
                className={inputCls}
                placeholder="/uploads/..."
                value={website.logo_dark_url || ''}
                onChange={(e) => setWebsite({ ...website, logo_dark_url: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Header Primary CTA Label</label>
              <input
                className={inputCls}
                value={website.header_cta_primary_label || ''}
                onChange={(e) => setWebsite({ ...website, header_cta_primary_label: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Header Primary CTA URL</label>
              <input
                className={inputCls}
                value={website.header_cta_primary_url || ''}
                onChange={(e) => setWebsite({ ...website, header_cta_primary_url: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Header Secondary CTA Label</label>
              <input
                className={inputCls}
                value={website.header_cta_secondary_label || ''}
                onChange={(e) => setWebsite({ ...website, header_cta_secondary_label: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Header Secondary CTA URL</label>
              <input
                className={inputCls}
                value={website.header_cta_secondary_url || ''}
                onChange={(e) => setWebsite({ ...website, header_cta_secondary_url: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Google Analytics Measurement ID</label>
              <input
                className={inputCls}
                placeholder="G-XXXXXXXXXX"
                value={website.google_analytics_id || ''}
                onChange={(e) => setWebsite({ ...website, google_analytics_id: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Google Search Console Verification Code</label>
              <input
                className={inputCls}
                value={website.google_search_console_code || ''}
                onChange={(e) => setWebsite({ ...website, google_search_console_code: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Footer Copyright Suffix</label>
              <input
                className={inputCls}
                value={website.footer_copyright || ''}
                onChange={(e) => setWebsite({ ...website, footer_copyright: e.target.value })}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(website.show_top_bar)}
              onChange={(e) => setWebsite({ ...website, show_top_bar: e.target.checked ? 1 : 0 })}
            />
            <span>Show Top Information Bar in Header</span>
          </label>

          <Button onClick={() => void saveSection('website', website)}>
            <Save className="w-4 h-4" />
            <span>Save Website Settings</span>
          </Button>
        </div>
      )}

      {/* TAB 2: COMPANY PROFILE */}
      {tab === 'company' && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Company Name</label>
              <input
                className={inputCls}
                value={company.company_name || ''}
                onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Owner Name</label>
              <input
                className={inputCls}
                value={company.owner_name || ''}
                onChange={(e) => setCompany({ ...company, owner_name: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Owner Title</label>
              <input
                className={inputCls}
                value={company.owner_title || ''}
                onChange={(e) => setCompany({ ...company, owner_title: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Business Type</label>
              <input
                className={inputCls}
                value={company.business_type || ''}
                onChange={(e) => setCompany({ ...company, business_type: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>About Section Image URL</label>
              <input
                className={inputCls}
                value={company.about_image_url || ''}
                onChange={(e) => setCompany({ ...company, about_image_url: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Service Areas</label>
              <input
                className={inputCls}
                value={company.service_areas || ''}
                onChange={(e) => setCompany({ ...company, service_areas: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Short Introduction</label>
            <textarea
              rows={2}
              className={inputCls}
              value={company.short_intro || ''}
              onChange={(e) => setCompany({ ...company, short_intro: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>About Overview</label>
            <textarea
              rows={3}
              className={inputCls}
              value={company.about_overview || ''}
              onChange={(e) => setCompany({ ...company, about_overview: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Owner Bio</label>
            <textarea
              rows={2}
              className={inputCls}
              value={company.owner_bio || ''}
              onChange={(e) => setCompany({ ...company, owner_bio: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Mission Statement</label>
              <textarea
                rows={3}
                className={inputCls}
                value={company.mission || ''}
                onChange={(e) => setCompany({ ...company, mission: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Vision Statement</label>
              <textarea
                rows={3}
                className={inputCls}
                value={company.vision || ''}
                onChange={(e) => setCompany({ ...company, vision: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Quality Assurance</label>
              <textarea
                rows={3}
                className={inputCls}
                value={company.quality_assurance || ''}
                onChange={(e) => setCompany({ ...company, quality_assurance: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Safety Standards</label>
              <textarea
                rows={3}
                className={inputCls}
                value={company.safety_standards || ''}
                onChange={(e) => setCompany({ ...company, safety_standards: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={() => void saveSection('company', company)}>
            <Save className="w-4 h-4" />
            <span>Save Company Profile</span>
          </Button>
        </div>
      )}

      {/* TAB 3: CONTACT & FLOATING CTA */}
      {tab === 'contact' && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Owner Name</label>
              <input
                className={inputCls}
                value={contact.owner_name || ''}
                onChange={(e) => setContact({ ...contact, owner_name: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Mobile Number</label>
              <input
                className={inputCls}
                value={contact.phone || ''}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>WhatsApp Number</label>
              <input
                className={inputCls}
                value={contact.whatsapp_number || ''}
                onChange={(e) => setContact({ ...contact, whatsapp_number: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Email Address</label>
              <input
                className={inputCls}
                value={contact.email || ''}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Address</label>
              <input
                className={inputCls}
                value={contact.address_line || ''}
                onChange={(e) => setContact({ ...contact, address_line: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>City</label>
              <input
                className={inputCls}
                value={contact.city || ''}
                onChange={(e) => setContact({ ...contact, city: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>District</label>
              <input
                className={inputCls}
                value={contact.district || ''}
                onChange={(e) => setContact({ ...contact, district: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>State</label>
              <input
                className={inputCls}
                value={contact.state || ''}
                onChange={(e) => setContact({ ...contact, state: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>PIN Code</label>
              <input
                className={inputCls}
                value={contact.pin_code || ''}
                onChange={(e) => setContact({ ...contact, pin_code: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Default WhatsApp Inquiry Message</label>
            <input
              className={inputCls}
              value={contact.whatsapp_default_message || ''}
              onChange={(e) => setContact({ ...contact, whatsapp_default_message: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Working Hours</label>
            <input
              className={inputCls}
              value={contact.working_hours || ''}
              onChange={(e) => setContact({ ...contact, working_hours: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Google Maps Embed URL</label>
            <input
              className={inputCls}
              value={contact.google_maps_embed_url || ''}
              onChange={(e) => setContact({ ...contact, google_maps_embed_url: e.target.value })}
            />
          </div>

          <div className="border-t border-slate-200 pt-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Floating Contact Buttons</h3>
            <div className="flex flex-wrap gap-5 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(contact.floating_whatsapp_enabled)}
                  onChange={(e) => setContact({ ...contact, floating_whatsapp_enabled: e.target.checked ? 1 : 0 })}
                />
                WhatsApp Button
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(contact.floating_call_enabled)}
                  onChange={(e) => setContact({ ...contact, floating_call_enabled: e.target.checked ? 1 : 0 })}
                />
                Call Now Button
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(contact.floating_quote_enabled)}
                  onChange={(e) => setContact({ ...contact, floating_quote_enabled: e.target.checked ? 1 : 0 })}
                />
                Get a Quote Button
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <label className={labelCls}>Position</label>
                <select
                  className={inputCls}
                  value={contact.floating_position || 'bottom-right'}
                  onChange={(e) => setContact({ ...contact, floating_position: e.target.value })}
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>WhatsApp Color</label>
                <input
                  type="color"
                  className="h-10 w-full rounded border"
                  value={contact.floating_whatsapp_color || '#25D366'}
                  onChange={(e) => setContact({ ...contact, floating_whatsapp_color: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Call Color</label>
                <input
                  type="color"
                  className="h-10 w-full rounded border"
                  value={contact.floating_call_color || '#111827'}
                  onChange={(e) => setContact({ ...contact, floating_call_color: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Quote Color</label>
                <input
                  type="color"
                  className="h-10 w-full rounded border"
                  value={contact.floating_quote_color || '#F5B301'}
                  onChange={(e) => setContact({ ...contact, floating_quote_color: e.target.value })}
                />
              </div>
            </div>
          </div>

          <Button onClick={() => void saveSection('contact', contact)}>
            <Save className="w-4 h-4" />
            <span>Save Contact &amp; Floating CTA Settings</span>
          </Button>
        </div>
      )}

      {/* TAB 4: NAVIGATION */}
      {tab === 'navigation' && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className={labelCls}>Label</label>
              <input
                className={inputCls}
                value={newNav.label}
                onChange={(e) => setNewNav({ ...newNav, label: e.target.value })}
                placeholder="e.g., Turnkey Homes"
              />
            </div>
            <div>
              <label className={labelCls}>Link / Path</label>
              <input
                className={inputCls}
                value={newNav.href}
                onChange={(e) => setNewNav({ ...newNav, href: e.target.value })}
                placeholder="/services"
              />
            </div>
            <div>
              <label className={labelCls}>Order</label>
              <input
                type="number"
                className={inputCls}
                value={newNav.display_order}
                onChange={(e) => setNewNav({ ...newNav, display_order: Number(e.target.value) })}
              />
            </div>
            <Button
              onClick={() => {
                if (!newNav.label) return;
                void cmsAction('navigation', 'create', undefined, { ...newNav, is_visible: 1 });
                setNewNav({ label: '', href: '/', display_order: navigation.length + 2 });
              }}
            >
              <Plus className="w-4 h-4" /> Add Link
            </Button>
          </div>

          <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl">
            {navigation.map((item) => (
              <div key={item.id} className="p-3.5 flex flex-wrap items-center justify-between gap-3 text-sm">
                <div>
                  <span className="font-bold text-slate-900">{item.label}</span>
                  <span className="ml-2 text-xs text-slate-500">{item.href}</span>
                  <span className="ml-2 text-[11px] text-slate-400">#{item.display_order}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void cmsAction('navigation', 'update', item.id, {
                        ...item,
                        is_visible: item.is_visible ? 0 : 1,
                      })
                    }
                    className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer ${
                      item.is_visible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {item.is_visible ? 'Visible' : 'Hidden'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void cmsAction('navigation', 'delete', item.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SOCIAL */}
      {tab === 'social' && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className={labelCls}>Platform</label>
              <input
                className={inputCls}
                value={newSocial.platform}
                onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value, label: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Profile URL</label>
              <input
                className={inputCls}
                placeholder="https://instagram.com/..."
                value={newSocial.url}
                onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
              />
            </div>
            <Button
              onClick={() => {
                if (!newSocial.url) return;
                void cmsAction('social_links', 'create', undefined, newSocial);
                setNewSocial({ platform: 'Facebook', label: 'Facebook', url: '' });
              }}
            >
              <Plus className="w-4 h-4" /> Add Social
            </Button>
          </div>
          <div className="space-y-2">
            {socialLinks.length === 0 ? (
              <p className="text-xs text-slate-500">No social media links configured yet.</p>
            ) : (
              socialLinks.map((s) => (
                <div key={s.id} className="p-3 rounded-lg border border-slate-200 flex items-center justify-between text-sm">
                  <div>
                    <strong className="text-slate-900">{s.label}</strong>
                    <span className="ml-2 text-xs text-slate-500">{s.url}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void cmsAction('social_links', 'delete', s.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: FOOTER */}
      {tab === 'footer' && (
        <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className={labelCls}>Footer Column</label>
              <select
                className={inputCls}
                value={newFooterLink.footer_section_id}
                onChange={(e) => setNewFooterLink({ ...newFooterLink, footer_section_id: Number(e.target.value) })}
              >
                {footerSections.map((fs) => (
                  <option key={fs.id} value={fs.id}>
                    {fs.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Link Label</label>
              <input
                className={inputCls}
                value={newFooterLink.label}
                onChange={(e) => setNewFooterLink({ ...newFooterLink, label: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>URL</label>
              <input
                className={inputCls}
                value={newFooterLink.href}
                onChange={(e) => setNewFooterLink({ ...newFooterLink, href: e.target.value })}
              />
            </div>
            <Button
              onClick={() => {
                if (!newFooterLink.label) return;
                void cmsAction('footer_links', 'create', undefined, newFooterLink);
                setNewFooterLink({ ...newFooterLink, label: '', href: '/' });
              }}
            >
              <Plus className="w-4 h-4" /> Add Footer Link
            </Button>
          </div>
          <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl">
            {footerLinks.map((fl) => (
              <div key={fl.id} className="p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{fl.label}</span>
                  <span className="ml-2 text-slate-500">{fl.href}</span>
                </div>
                <button
                  type="button"
                  onClick={() => void cmsAction('footer_links', 'delete', fl.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
