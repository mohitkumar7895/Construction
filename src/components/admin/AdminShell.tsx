'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  BarChart3,
  Briefcase,
  Building2,
  ChevronRight,
  ExternalLink,
  FileText,
  FolderKanban,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  Inbox,
  KeyRound,
  Layers,
  LayoutDashboard,
  LayoutTemplate,
  ListChecks,
  LogOut,
  Menu,
  MessageSquareQuote,
  Navigation,
  Palette,
  Phone,
  Search,
  Settings,
  Share2,
  Shield,
  Sliders,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import type { AdminUserSession } from '@/types';
import { cn } from '@/lib/utils';
import { DashboardOverview } from './DashboardOverview';
import { SettingsPanel } from './SettingsPanel';
import { PageBuilderPanel } from './PageBuilderPanel';
import { HeroSliderPanel } from './HeroSliderPanel';
import { ServicesPanel } from './ServicesPanel';
import { ProjectsPanel } from './ProjectsPanel';
import { GalleryPanel } from './GalleryPanel';
import { MediaLibraryPanel } from './MediaLibraryPanel';
import { InquiriesPanel } from './InquiriesPanel';
import { CmsCollectionsPanel } from './CmsCollectionsPanel';
import { SeoPanel } from './SeoPanel';
import { ThemeAnimationsPanel } from './ThemeAnimationsPanel';
import { SecurityUsersPanel } from './SecurityUsersPanel';

export type AdminModuleKey =
  | 'dashboard'
  | 'website_settings'
  | 'company_profile'
  | 'header_nav'
  | 'page_builder'
  | 'hero_slider'
  | 'services'
  | 'projects'
  | 'gallery'
  | 'team'
  | 'testimonials'
  | 'faqs'
  | 'statistics'
  | 'process_steps'
  | 'inquiries'
  | 'media'
  | 'contact_settings'
  | 'social_links'
  | 'seo'
  | 'animations'
  | 'theme'
  | 'footer'
  | 'pages'
  | 'users'
  | 'logs'
  | 'change_password';

interface NavEntry {
  key: AdminModuleKey;
  label: string;
  group: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

const ADMIN_NAV: NavEntry[] = [
  { key: 'dashboard', label: 'Dashboard', group: 'Overview', icon: LayoutDashboard },
  { key: 'inquiries', label: 'Inquiry CRM', group: 'Overview', icon: Inbox, permission: 'inquiries.manage' },

  { key: 'page_builder', label: 'Home & Page Builder', group: 'Content & Pages', icon: LayoutTemplate, permission: 'content.manage' },
  { key: 'hero_slider', label: 'Hero Slider', group: 'Content & Pages', icon: Sliders, permission: 'content.manage' },
  { key: 'pages', label: 'Custom & Legal Pages', group: 'Content & Pages', icon: FileText, permission: 'content.manage' },
  { key: 'company_profile', label: 'About Us & Profile', group: 'Content & Pages', icon: Building2, permission: 'settings.manage' },

  { key: 'services', label: 'Services & Categories', group: 'Portfolio & Media', icon: Briefcase, permission: 'content.manage' },
  { key: 'projects', label: 'Projects & Categories', group: 'Portfolio & Media', icon: FolderKanban, permission: 'content.manage' },
  { key: 'gallery', label: 'Gallery & Categories', group: 'Portfolio & Media', icon: ImageIcon, permission: 'content.manage' },
  { key: 'media', label: 'Media Library', group: 'Portfolio & Media', icon: Layers, permission: 'media.manage' },

  { key: 'team', label: 'Team Management', group: 'Trust & Process', icon: Users, permission: 'content.manage' },
  { key: 'testimonials', label: 'Testimonials', group: 'Trust & Process', icon: MessageSquareQuote, permission: 'content.manage' },
  { key: 'faqs', label: 'FAQs', group: 'Trust & Process', icon: HelpCircle, permission: 'content.manage' },
  { key: 'statistics', label: 'Statistics', group: 'Trust & Process', icon: BarChart3, permission: 'content.manage' },
  { key: 'process_steps', label: 'Construction Process', group: 'Trust & Process', icon: ListChecks, permission: 'content.manage' },

  { key: 'website_settings', label: 'Website & Header', group: 'Design & Settings', icon: Settings, permission: 'settings.manage' },
  { key: 'header_nav', label: 'Navigation Menu', group: 'Design & Settings', icon: Navigation, permission: 'content.manage' },
  { key: 'footer', label: 'Footer Management', group: 'Design & Settings', icon: LayoutTemplate, permission: 'content.manage' },
  { key: 'contact_settings', label: 'Contact & Floating CTA', group: 'Design & Settings', icon: Phone, permission: 'settings.manage' },
  { key: 'social_links', label: 'Social Media', group: 'Design & Settings', icon: Share2, permission: 'content.manage' },
  { key: 'theme', label: 'Theme Settings', group: 'Design & Settings', icon: Palette, permission: 'settings.manage' },
  { key: 'animations', label: 'Animation Settings', group: 'Design & Settings', icon: Sparkles, permission: 'settings.manage' },
  { key: 'seo', label: 'SEO & Redirects', group: 'Design & Settings', icon: Globe, permission: 'seo.manage' },

  { key: 'users', label: 'Admin Users', group: 'Security', icon: Shield, permission: 'users.manage' },
  { key: 'logs', label: 'Activity Logs', group: 'Security', icon: Activity, permission: 'logs.view' },
  { key: 'change_password', label: 'Change Password', group: 'Security', icon: KeyRound },
];

export function AdminShell({ user }: { user: AdminUserSession }) {
  const router = useRouter();
  const [active, setActive] = useState<AdminModuleKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const visibleNav = useMemo(() => {
    const q = navSearch.trim().toLowerCase();
    return ADMIN_NAV.filter((item) => {
      const allowed =
        !item.permission ||
        user.roleSlug === 'super_admin' ||
        user.permissions.includes(item.permission);
      if (!allowed) return false;
      if (!q) return true;
      return item.label.toLowerCase().includes(q) || item.group.toLowerCase().includes(q);
    });
  }, [user, navSearch]);

  const groups = useMemo(() => {
    const map = new Map<string, NavEntry[]>();
    for (const item of visibleNav) {
      const list = map.get(item.group) || [];
      list.push(item);
      map.set(item.group, list);
    }
    return Array.from(map.entries());
  }, [visibleNav]);

  const activeEntry = ADMIN_NAV.find((n) => n.key === active) || ADMIN_NAV[0];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const renderModule = () => {
    switch (active) {
      case 'dashboard':
        return <DashboardOverview onNavigate={setActive} />;
      case 'website_settings':
        return <SettingsPanel initialTab="website" />;
      case 'company_profile':
        return <SettingsPanel initialTab="company" />;
      case 'contact_settings':
        return <SettingsPanel initialTab="contact" />;
      case 'header_nav':
        return <SettingsPanel initialTab="navigation" />;
      case 'social_links':
        return <SettingsPanel initialTab="social" />;
      case 'footer':
        return <SettingsPanel initialTab="footer" />;
      case 'page_builder':
        return <PageBuilderPanel initialView="builder" />;
      case 'pages':
        return <PageBuilderPanel initialView="pages" />;
      case 'hero_slider':
        return <HeroSliderPanel />;
      case 'services':
        return <ServicesPanel />;
      case 'projects':
        return <ProjectsPanel />;
      case 'gallery':
        return <GalleryPanel />;
      case 'media':
        return <MediaLibraryPanel />;
      case 'inquiries':
        return <InquiriesPanel />;
      case 'team':
      case 'testimonials':
      case 'faqs':
      case 'statistics':
      case 'process_steps':
        return <CmsCollectionsPanel activeCollection={active} />;
      case 'seo':
        return <SeoPanel />;
      case 'theme':
        return <ThemeAnimationsPanel initialTab="theme" />;
      case 'animations':
        return <ThemeAnimationsPanel initialTab="animations" />;
      case 'users':
        return <SecurityUsersPanel initialTab="users" />;
      case 'logs':
        return <SecurityUsersPanel initialTab="logs" />;
      case 'change_password':
        return <SecurityUsersPanel initialTab="password" />;
      default:
        return <DashboardOverview onNavigate={setActive} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-900">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-[#0B0F14] text-slate-200 flex flex-col border-r border-white/10 transition-transform duration-200 shrink-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-lg bg-white p-0.5 flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-[var(--brand-secondary)]/60">
              <img src="/logo-cropped.png" alt="Taj Construction Logo" className="w-full h-full object-contain scale-110" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-white">Taj Construction</p>
              <p className="text-[10px] uppercase tracking-wider text-[var(--brand-secondary)]">
                {user.roleName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="lg:hidden p-1.5 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Search */}
        <div className="p-3 border-b border-white/10">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Jump to module..."
              className="w-full rounded-lg bg-white/5 border border-white/10 pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:border-[var(--brand-secondary)] focus:outline-none"
            />
          </div>
        </div>

        {/* Nav Groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {groups.map(([groupName, entries]) => (
            <div key={groupName}>
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                {groupName}
              </p>
              <div className="space-y-0.5">
                {entries.map((entry) => {
                  const Icon = entry.icon;
                  const isCurrent = active === entry.key;
                  return (
                    <button
                      key={entry.key}
                      type="button"
                      onClick={() => {
                        setActive(entry.key);
                        setSidebarOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left',
                        isCurrent
                          ? 'bg-[var(--brand-secondary)] text-[#0B0F14] font-bold'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{entry.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 hover:bg-red-600/20 hover:text-red-300 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-700 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 truncate">
              <span className="hidden sm:inline">Admin</span>
              <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
              <span className="font-bold text-slate-900 truncate">{activeEntry.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <span>View Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#0B0F14] text-[var(--brand-secondary)] flex items-center justify-center text-xs font-bold">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <p className="text-[11px] text-slate-500">{user.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Active Module Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {renderModule()}
        </main>
      </div>
    </div>
  );
}
