import { query, queryOne } from '@/lib/db';
import type {
  AnimationSettings,
  CompanyProfile,
  ContactSettings,
  FaqItem,
  FooterLink,
  FooterSection,
  GalleryCategory,
  GalleryImage,
  HeroSlide,
  NavigationItem,
  PageRecord,
  PageSection,
  ProcessStep,
  ProjectCategory,
  ProjectImage,
  ProjectRecord,
  SeoMetadata,
  ServiceCategory,
  ServiceImage,
  ServiceRecord,
  SiteBundle,
  SocialLink,
  StatisticItem,
  TeamMember,
  Testimonial,
  ThemeSettings,
  WebsiteSettings,
} from '@/types';

const DEFAULT_WEBSITE: WebsiteSettings = {
  id: 1,
  site_name: 'Sartaj Construction',
  tagline: 'Building Your Vision. Creating Your Future.',
  domain_name: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  logo_url: null,
  logo_dark_url: null,
  favicon_url: null,
  google_analytics_id: null,
  google_search_console_code: null,
  header_cta_primary_label: 'Get a Quote',
  header_cta_primary_url: '/contact',
  header_cta_secondary_label: 'Inquire Now',
  header_cta_secondary_url: '/contact#inquiry-form',
  show_top_bar: 1,
  maintenance_mode: 0,
  footer_copyright: 'All rights reserved.',
};

const DEFAULT_COMPANY: CompanyProfile = {
  id: 1,
  company_name: 'Sartaj Construction',
  owner_name: 'Sartaj Hussain',
  owner_title: 'Founder & Managing Director',
  owner_bio:
    'Led by Sartaj Hussain, delivering precision-engineered construction and infrastructure services across Haldwani, Nainital, and Uttarakhand.',
  owner_image_url: '/images/construction-team.jpg',
  business_type: 'Construction and Infrastructure Services',
  short_intro:
    'Delivering professional construction, engineering, architectural planning, and infrastructure solutions in Haldwani and across Uttarakhand.',
  about_overview:
    'Sartaj Construction is a full-service construction and infrastructure firm headquartered in Haldwani, Nainital, Uttarakhand.',
  company_history: null,
  mission: 'To deliver structurally sound, architecturally refined, and transparently budgeted spaces.',
  vision: 'To be Uttarakhand’s most trusted construction and infrastructure partner.',
  core_values_json: '[]',
  expertise_json: '[]',
  quality_assurance: null,
  safety_standards: null,
  why_choose_us_json: '[]',
  about_image_url: '/images/construction-team.jpg',
  established_year: null,
  service_areas: 'Haldwani, Nainital & across Uttarakhand',
};

const DEFAULT_THEME: ThemeSettings = {
  id: 1,
  primary_color: '#111827',
  secondary_color: '#F5B301',
  dark_bg_color: '#0B0F14',
  light_bg_color: '#F8F9FB',
  surface_color: '#FFFFFF',
  muted_text_color: '#64748B',
  heading_font: 'Space Grotesk',
  body_font: 'Inter',
  border_radius: '0.5rem',
  header_style: 'transparent-overlay',
};

const DEFAULT_ANIMATIONS: AnimationSettings = {
  id: 1,
  animations_enabled: 1,
  smooth_scroll_enabled: 1,
  parallax_enabled: 1,
  hero_animations_enabled: 1,
  project_animations_enabled: 1,
  hover_effects_enabled: 1,
  mobile_animations_enabled: 0,
  animation_style: 'cinematic',
  duration_multiplier: 1,
  intensity: 'medium',
};

const DEFAULT_CONTACT: ContactSettings = {
  id: 1,
  owner_name: 'Sartaj Hussain',
  phone: '+91 9897300398',
  secondary_phone: null,
  whatsapp_number: '+91 9897300398',
  whatsapp_default_message:
    'Hello, I am interested in your construction services. Please share more details.',
  email: 'sartajkhan4284@gmail.com',
  address_line: 'Haldwani',
  city: 'Haldwani',
  district: 'Nainital',
  state: 'Uttarakhand',
  pin_code: '263139',
  country: 'India',
  working_hours: 'Mon - Sat: 9:00 AM - 7:00 PM',
  google_maps_embed_url:
    'https://www.google.com/maps?q=Haldwani,+Nainital,+Uttarakhand+263139,+India&output=embed',
  floating_whatsapp_enabled: 1,
  floating_call_enabled: 1,
  floating_quote_enabled: 1,
  floating_position: 'bottom-right',
  floating_whatsapp_color: '#25D366',
  floating_call_color: '#111827',
  floating_quote_color: '#F5B301',
};

export async function getSiteBundle(): Promise<SiteBundle> {
  try {
    const [
      website,
      company,
      theme,
      animations,
      contact,
      socialLinks,
      navigation,
      footerSections,
      footerLinks,
    ] = await Promise.all([
      queryOne<WebsiteSettings>(`SELECT * FROM website_settings ORDER BY id ASC LIMIT 1`),
      queryOne<CompanyProfile>(`SELECT * FROM company_profiles ORDER BY id ASC LIMIT 1`),
      queryOne<ThemeSettings>(`SELECT * FROM theme_settings ORDER BY id ASC LIMIT 1`),
      queryOne<AnimationSettings>(`SELECT * FROM animation_settings ORDER BY id ASC LIMIT 1`),
      queryOne<ContactSettings>(`SELECT * FROM contact_settings ORDER BY id ASC LIMIT 1`),
      query<SocialLink>(
        `SELECT * FROM social_links WHERE is_visible = 1 ORDER BY display_order ASC, id ASC`
      ),
      query<NavigationItem>(
        `SELECT * FROM navigation_items WHERE is_visible = 1 ORDER BY display_order ASC, id ASC`
      ),
      query<FooterSection>(
        `SELECT * FROM footer_sections WHERE is_visible = 1 ORDER BY display_order ASC, id ASC`
      ),
      query<FooterLink>(
        `SELECT * FROM footer_links WHERE is_visible = 1 ORDER BY display_order ASC, id ASC`
      ),
    ]);

    const enrichedFooter = footerSections.map((section) => ({
      ...section,
      links: footerLinks.filter((l) => l.footer_section_id === section.id),
    }));

    return {
      website: website ?? DEFAULT_WEBSITE,
      company: company ?? DEFAULT_COMPANY,
      theme: theme ?? DEFAULT_THEME,
      animations: animations
        ? { ...animations, duration_multiplier: Number(animations.duration_multiplier) || 1 }
        : DEFAULT_ANIMATIONS,
      contact: contact ?? DEFAULT_CONTACT,
      socialLinks,
      navigation,
      footerSections: enrichedFooter,
    };
  } catch {
    return {
      website: DEFAULT_WEBSITE,
      company: DEFAULT_COMPANY,
      theme: DEFAULT_THEME,
      animations: DEFAULT_ANIMATIONS,
      contact: DEFAULT_CONTACT,
      socialLinks: [],
      navigation: [
        { id: 1, parent_id: null, label: 'Home', href: '/', target: '_self', is_visible: 1, display_order: 1 },
        { id: 2, parent_id: null, label: 'About Us', href: '/about', target: '_self', is_visible: 1, display_order: 2 },
        { id: 3, parent_id: null, label: 'Services', href: '/services', target: '_self', is_visible: 1, display_order: 3 },
        { id: 4, parent_id: null, label: 'Projects', href: '/projects', target: '_self', is_visible: 1, display_order: 4 },
        { id: 5, parent_id: null, label: 'Our Gallery', href: '/gallery', target: '_self', is_visible: 1, display_order: 5 },
        { id: 6, parent_id: null, label: 'Contact Us', href: '/contact', target: '_self', is_visible: 1, display_order: 6 },
      ],
      footerSections: [],
    };
  }
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    return await query<HeroSlide>(
      `SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY display_order ASC, id ASC`
    );
  } catch {
    return [];
  }
}

export async function getPublishedServices(options?: {
  featuredOnly?: boolean;
  categorySlug?: string;
  limit?: number;
}): Promise<ServiceRecord[]> {
  try {
    const conditions = [`s.deleted_at IS NULL`, `s.status = 'published'`];
    const params: unknown[] = [];

    if (options?.featuredOnly) {
      conditions.push(`s.is_featured = 1`);
    }
    if (options?.categorySlug) {
      conditions.push(`c.slug = ?`);
      params.push(options.categorySlug);
    }

    const limitSql = options?.limit ? `LIMIT ${Math.max(1, Math.min(100, Number(options.limit)))}` : '';

    return await query<ServiceRecord>(
      `SELECT s.*, c.name AS category_name, c.slug AS category_slug
       FROM services s
       LEFT JOIN service_categories c ON c.id = s.category_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY s.display_order ASC, s.id ASC
       ${limitSql}`,
      params
    );
  } catch {
    return [];
  }
}

export async function getServiceCategories(): Promise<ServiceCategory[]> {
  try {
    return await query<ServiceCategory>(
      `SELECT * FROM service_categories WHERE is_active = 1 ORDER BY display_order ASC, id ASC`
    );
  } catch {
    return [];
  }
}

export async function getServiceBySlug(slug: string): Promise<{
  service: ServiceRecord;
  images: ServiceImage[];
  relatedServices: ServiceRecord[];
  relatedProjects: ProjectRecord[];
} | null> {
  try {
    const service = await queryOne<ServiceRecord>(
      `SELECT s.*, c.name AS category_name, c.slug AS category_slug
       FROM services s
       LEFT JOIN service_categories c ON c.id = s.category_id
       WHERE s.slug = ? AND s.deleted_at IS NULL AND s.status = 'published'
       LIMIT 1`,
      [slug]
    );
    if (!service) return null;

    const [images, relatedServices, relatedProjects] = await Promise.all([
      query<ServiceImage>(
        `SELECT * FROM service_images WHERE service_id = ? ORDER BY display_order ASC, id ASC`,
        [service.id]
      ),
      query<ServiceRecord>(
        `SELECT s.*, c.name AS category_name, c.slug AS category_slug
         FROM services s
         LEFT JOIN service_categories c ON c.id = s.category_id
         WHERE s.id <> ? AND s.deleted_at IS NULL AND s.status = 'published'
         ORDER BY (s.category_id = ?) DESC, s.display_order ASC
         LIMIT 3`,
        [service.id, service.category_id ?? 0]
      ),
      query<ProjectRecord>(
        `SELECT p.*, c.name AS category_name, c.slug AS category_slug
         FROM projects p
         LEFT JOIN project_categories c ON c.id = p.category_id
         WHERE p.deleted_at IS NULL AND p.status = 'published'
         ORDER BY p.is_featured DESC, p.display_order ASC
         LIMIT 3`
      ),
    ]);

    return { service, images, relatedServices, relatedProjects };
  } catch {
    return null;
  }
}

export async function getPublishedProjects(options?: {
  featuredOnly?: boolean;
  categorySlug?: string;
  projectStatus?: string;
  limit?: number;
}): Promise<ProjectRecord[]> {
  try {
    const conditions = [`p.deleted_at IS NULL`, `p.status = 'published'`];
    const params: unknown[] = [];

    if (options?.featuredOnly) {
      conditions.push(`p.is_featured = 1`);
    }
    if (options?.categorySlug) {
      conditions.push(`c.slug = ?`);
      params.push(options.categorySlug);
    }
    if (options?.projectStatus && ['upcoming', 'ongoing', 'completed'].includes(options.projectStatus)) {
      conditions.push(`p.project_status = ?`);
      params.push(options.projectStatus);
    }

    const limitSql = options?.limit ? `LIMIT ${Math.max(1, Math.min(100, Number(options.limit)))}` : '';

    return await query<ProjectRecord>(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM projects p
       LEFT JOIN project_categories c ON c.id = p.category_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY p.display_order ASC, p.id ASC
       ${limitSql}`,
      params
    );
  } catch {
    return [];
  }
}

export async function getProjectCategories(): Promise<ProjectCategory[]> {
  try {
    return await query<ProjectCategory>(
      `SELECT * FROM project_categories WHERE is_active = 1 ORDER BY display_order ASC, id ASC`
    );
  } catch {
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<{
  project: ProjectRecord;
  images: ProjectImage[];
  relatedProjects: ProjectRecord[];
} | null> {
  try {
    const project = await queryOne<ProjectRecord>(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM projects p
       LEFT JOIN project_categories c ON c.id = p.category_id
       WHERE p.slug = ? AND p.deleted_at IS NULL AND p.status = 'published'
       LIMIT 1`,
      [slug]
    );
    if (!project) return null;

    const [images, relatedProjects] = await Promise.all([
      query<ProjectImage>(
        `SELECT * FROM project_images WHERE project_id = ? ORDER BY display_order ASC, id ASC`,
        [project.id]
      ),
      query<ProjectRecord>(
        `SELECT p.*, c.name AS category_name, c.slug AS category_slug
         FROM projects p
         LEFT JOIN project_categories c ON c.id = p.category_id
         WHERE p.id <> ? AND p.deleted_at IS NULL AND p.status = 'published'
         ORDER BY (p.category_id = ?) DESC, p.display_order ASC
         LIMIT 3`,
        [project.id, project.category_id ?? 0]
      ),
    ]);

    return { project, images, relatedProjects };
  } catch {
    return null;
  }
}

export async function getGalleryData(limit?: number): Promise<{
  categories: GalleryCategory[];
  images: GalleryImage[];
}> {
  try {
    const limitSql = limit ? `LIMIT ${Math.max(1, Math.min(200, Number(limit)))}` : '';
    const [categories, images] = await Promise.all([
      query<GalleryCategory>(
        `SELECT * FROM gallery_categories WHERE is_active = 1 ORDER BY display_order ASC, id ASC`
      ),
      query<GalleryImage>(
        `SELECT g.*, c.name AS category_name, c.slug AS category_slug, p.title AS project_title
         FROM gallery_images g
         LEFT JOIN gallery_categories c ON c.id = g.category_id
         LEFT JOIN projects p ON p.id = g.project_id
         WHERE g.deleted_at IS NULL AND g.status = 'published'
         ORDER BY g.display_order ASC, g.id ASC
         ${limitSql}`
      ),
    ]);
    return { categories, images };
  } catch {
    return { categories: [], images: [] };
  }
}

export async function getVisibleStatistics(): Promise<StatisticItem[]> {
  try {
    return await query<StatisticItem>(
      `SELECT * FROM statistics WHERE is_visible = 1 AND value > 0 ORDER BY display_order ASC, id ASC`
    );
  } catch {
    return [];
  }
}

export async function getProcessSteps(): Promise<ProcessStep[]> {
  try {
    return await query<ProcessStep>(
      `SELECT * FROM process_steps WHERE is_active = 1 ORDER BY display_order ASC, id ASC`
    );
  } catch {
    return [];
  }
}

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  try {
    return await query<Testimonial>(
      `SELECT * FROM testimonials WHERE deleted_at IS NULL AND status = 'published' ORDER BY display_order ASC, id DESC`
    );
  } catch {
    return [];
  }
}

export async function getPublishedFaqs(): Promise<FaqItem[]> {
  try {
    return await query<FaqItem>(
      `SELECT * FROM faqs WHERE deleted_at IS NULL AND status = 'published' ORDER BY display_order ASC, id ASC`
    );
  } catch {
    return [];
  }
}

export async function getPublishedTeam(): Promise<TeamMember[]> {
  try {
    return await query<TeamMember>(
      `SELECT * FROM team_members WHERE deleted_at IS NULL AND status = 'published' ORDER BY is_leadership DESC, display_order ASC, id ASC`
    );
  } catch {
    return [];
  }
}

export async function getPageWithSections(slug: string): Promise<{
  page: PageRecord;
  sections: PageSection[];
} | null> {
  try {
    const page = await queryOne<PageRecord>(
      `SELECT * FROM pages WHERE slug = ? AND deleted_at IS NULL AND status = 'published' LIMIT 1`,
      [slug]
    );
    if (!page) return null;

    const sections = await query<PageSection>(
      `SELECT * FROM page_sections
       WHERE page_id = ? AND is_visible = 1 AND status = 'published'
       ORDER BY display_order ASC, id ASC`,
      [page.id]
    );

    return { page, sections };
  } catch {
    return null;
  }
}

export async function getSeoForEntity(
  entityType: 'page' | 'service' | 'project' | 'global',
  entitySlug: string
): Promise<SeoMetadata | null> {
  try {
    const exact = await queryOne<SeoMetadata>(
      `SELECT * FROM seo_metadata WHERE entity_type = ? AND entity_slug = ? LIMIT 1`,
      [entityType, entitySlug]
    );
    if (exact) return exact;
    return await queryOne<SeoMetadata>(
      `SELECT * FROM seo_metadata WHERE entity_type = 'global' AND entity_slug = 'default' LIMIT 1`
    );
  } catch {
    return null;
  }
}
