import { query, queryOne } from '@/lib/db';
import { getAllUniqueTajGalleryImages, TAJ_GALLERY_CATEGORIES } from '@/lib/taj-media';
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
  site_name: 'Taj Construction',
  tagline: 'Building Your Vision. Creating Your Future.',
  domain_name: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  logo_url: '/logo.jpeg',
  logo_dark_url: '/logo.jpeg',
  favicon_url: '/logo.jpeg',
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

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    eyebrow: 'HALDWANI & UTTARAKHAND • ARCHITECTURAL CONSTRUCTION',
    heading: 'Building Your Vision. Creating Your Future.',
    description:
      'Delivering professional construction, engineering, architectural planning, and infrastructure solutions in Haldwani and across Uttarakhand.',
    image_url: '/taj/WhatsApp%20Image%202026-11-25%20at%2017.36.19%20(1).jpeg',
    image_alt: 'Luxury modern residential elevation by Taj Construction in Haldwani, Uttarakhand',
    primary_cta_label: 'Explore Our Projects',
    primary_cta_link: '/projects',
    secondary_cta_label: 'Get a Free Consultation',
    secondary_cta_link: '/contact',
    show_whatsapp_cta: 1,
    overlay_opacity: 0.56,
    animation_preset: 'zoom-reveal',
    is_active: 1,
    display_order: 1,
  },
  {
    id: 2,
    eyebrow: 'COMMERCIAL & STRUCTURAL STEEL ENGINEERING',
    heading: 'Precision Structures Built for Generations.',
    description:
      'From multi-storey structural steel complexes and commercial spaces to turnkey execution with transparent costing.',
    image_url: '/taj/WhatsApp%20Image%202026-11-25%20at%2017.36.20%20(1).jpeg',
    image_alt: 'Multi-storey structural steel building construction site by Taj Construction',
    primary_cta_label: 'View Construction Services',
    primary_cta_link: '/services',
    secondary_cta_label: 'Request a Quotation',
    secondary_cta_link: '/contact#inquiry-form',
    show_whatsapp_cta: 1,
    overlay_opacity: 0.58,
    animation_preset: 'parallax-slide',
    is_active: 1,
    display_order: 2,
  },
  {
    id: 3,
    eyebrow: 'BESPOKE RESIDENCES & TURNKEY VILLAS',
    heading: 'Architectural Craftsmanship from Blueprint to Handover.',
    description:
      'Complete design-build execution for contemporary duplex homes, hillside villas, and signature interiors tailored to Nainital and Kumaon.',
    image_url: '/images/hero-duplex.jpg',
    image_alt: 'Modern luxury duplex residential building in Uttarakhand foothills',
    primary_cta_label: 'Explore Full Gallery',
    primary_cta_link: '/gallery',
    secondary_cta_label: 'Book Site Inspection',
    secondary_cta_link: '/contact',
    show_whatsapp_cta: 1,
    overlay_opacity: 0.56,
    animation_preset: 'zoom-reveal',
    is_active: 1,
    display_order: 3,
  },
];

const DEFAULT_SERVICES: ServiceRecord[] = [
  { id: 1, category_id: 1, category_name: 'Building Construction', category_slug: 'building-construction', title: 'Residential Construction', slug: 'residential-construction', icon: 'Home', short_description: 'Custom individual houses, modern duplexes, and hillside villas built with seismic-conscious RCC engineering in Haldwani and Uttarakhand.', detailed_content: null, featured_image: '/images/residential-duplex.jpg', banner_image: '/images/residential-duplex.jpg', benefits_json: '[]', work_process_json: '[]', faqs_json: '[]', is_featured: 1, status: 'published', display_order: 1 },
  { id: 2, category_id: 1, category_name: 'Building Construction', category_slug: 'building-construction', title: 'Commercial Construction', slug: 'commercial-construction', icon: 'Building2', short_description: 'High-efficiency office buildings, retail showrooms, hospitality venues, and mixed-use commercial complexes engineered for long-term ROI.', detailed_content: null, featured_image: '/images/commercial-project.jpg', banner_image: '/images/commercial-project.jpg', benefits_json: '[]', work_process_json: '[]', faqs_json: '[]', is_featured: 1, status: 'published', display_order: 2 },
  { id: 3, category_id: 1, category_name: 'Building Construction', category_slug: 'building-construction', title: 'Industrial Construction', slug: 'industrial-construction', icon: 'Factory', short_description: 'Pre-engineered warehouses, factory sheds, logistics hubs, and heavy-duty industrial flooring built to operational load specifications.', detailed_content: null, featured_image: '/images/industrial-warehouse.jpg', banner_image: '/images/industrial-warehouse.jpg', benefits_json: '[]', work_process_json: '[]', faqs_json: '[]', is_featured: 1, status: 'published', display_order: 3 },
  { id: 4, category_id: 2, category_name: 'Design & Engineering', category_slug: 'design-engineering', title: 'Architectural Planning', slug: 'architectural-planning', icon: 'Compass', short_description: 'Functional 2D floor plans, 3D exterior elevations, Vastu-aligned layouts, and bylaw-compliant architectural drawings.', detailed_content: null, featured_image: '/images/architectural-planning.jpg', banner_image: '/images/architectural-planning.jpg', benefits_json: '[]', work_process_json: '[]', faqs_json: '[]', is_featured: 1, status: 'published', display_order: 4 },
  { id: 5, category_id: 2, category_name: 'Design & Engineering', category_slug: 'design-engineering', title: 'Civil Engineering', slug: 'civil-engineering', icon: 'HardHat', short_description: 'Comprehensive site grading, retaining walls, drainage systems, reinforced concrete works, and technical civil execution.', detailed_content: null, featured_image: '/images/infrastructure-foundation.jpg', banner_image: '/images/infrastructure-foundation.jpg', benefits_json: '[]', work_process_json: '[]', faqs_json: '[]', is_featured: 1, status: 'published', display_order: 5 },
  { id: 6, category_id: 2, category_name: 'Design & Engineering', category_slug: 'design-engineering', title: 'Interior Designing', slug: 'interior-designing', icon: 'Sofa', short_description: 'Bespoke residential and commercial interiors featuring modular kitchens, architectural lighting, custom joinery, and stone finishes.', detailed_content: null, featured_image: '/images/luxury-interior.jpg', banner_image: '/images/luxury-interior.jpg', benefits_json: '[]', work_process_json: '[]', faqs_json: '[]', is_featured: 1, status: 'published', display_order: 6 },
  { id: 7, category_id: 3, category_name: 'Infrastructure & Contracting', category_slug: 'infrastructure-contracting', title: 'Renovation and Remodeling', slug: 'renovation-remodeling', icon: 'Hammer', short_description: 'Structural retrofitting, facade modernization, floor additions, and complete interior remodeling for existing buildings.', detailed_content: null, featured_image: '/images/renovation-remodeling.jpg', banner_image: '/images/renovation-remodeling.jpg', benefits_json: '[]', work_process_json: '[]', faqs_json: '[]', is_featured: 0, status: 'published', display_order: 7 },
  { id: 8, category_id: 1, category_name: 'Building Construction', category_slug: 'building-construction', title: 'Turnkey Construction', slug: 'turnkey-construction', icon: 'KeyRound', short_description: 'Single-point accountability from architectural concept and material procurement to construction execution and ready-to-move handover.', detailed_content: null, featured_image: '/images/modern-villa.jpg', banner_image: '/images/modern-villa.jpg', benefits_json: '[]', work_process_json: '[]', faqs_json: '[]', is_featured: 1, status: 'published', display_order: 8 },
  { id: 9, category_id: 3, category_name: 'Infrastructure & Contracting', category_slug: 'infrastructure-contracting', title: 'Building Contractor Services', slug: 'building-contractor-services', icon: 'Wrench', short_description: 'Reliable civil and building contracting with skilled masonry, bar-bending, shuttering, plastering, and finishing teams.', detailed_content: null, featured_image: '/taj/WhatsApp%20Image%202026-11-25%20at%2017.21.59.jpeg', banner_image: '/taj/WhatsApp%20Image%202026-11-25%20at%2017.21.59.jpeg', benefits_json: '[]', work_process_json: '[]', faqs_json: '[]', is_featured: 0, status: 'published', display_order: 9 },
  { id: 10, category_id: 3, category_name: 'Infrastructure & Contracting', category_slug: 'infrastructure-contracting', title: 'Infrastructure Development', slug: 'infrastructure-development', icon: 'Landmark', short_description: 'Boundary walls, internal paved roads, stormwater drains, institutional campuses, and plotted township civil infrastructure.', detailed_content: null, featured_image: '/taj/WhatsApp%20Image%202026-11-25%20at%2017.36.33%20(2).jpeg', banner_image: '/taj/WhatsApp%20Image%202026-11-25%20at%2017.36.33%20(2).jpeg', benefits_json: '[]', work_process_json: '[]', faqs_json: '[]', is_featured: 0, status: 'published', display_order: 10 },
  { id: 11, category_id: 3, category_name: 'Infrastructure & Contracting', category_slug: 'infrastructure-contracting', title: 'Project Management', slug: 'project-management', icon: 'ClipboardCheck', short_description: 'End-to-end construction scheduling, vendor coordination, BOQ cost audits, and site quality assurance consultancy.', detailed_content: null, featured_image: '/taj/WhatsApp%20Image%202026-11-25%20at%2017.36.34.jpeg', banner_image: '/taj/WhatsApp%20Image%202026-11-25%20at%2017.36.34.jpeg', benefits_json: '[]', work_process_json: '[]', faqs_json: '[]', is_featured: 0, status: 'published', display_order: 11 },
  { id: 12, category_id: 2, category_name: 'Design & Engineering', category_slug: 'design-engineering', title: 'Structural Design', slug: 'structural-design', icon: 'Layers', short_description: 'Safe, economical RCC and steel structural analysis, foundation detailing, and seismic-resistant drawings for Uttarakhand.', detailed_content: null, featured_image: '/taj/WhatsApp%20Image%202026-11-25%20at%2017.33.14.jpeg', banner_image: '/taj/WhatsApp%20Image%202026-11-25%20at%2017.33.14.jpeg', benefits_json: '[]', work_process_json: '[]', faqs_json: '[]', is_featured: 0, status: 'published', display_order: 12 },
];

const DEFAULT_PROJECTS: ProjectRecord[] = [
  { id: 1, category_id: 4, category_name: 'Duplex Houses', category_slug: 'duplex-houses', title: 'Modern Foothill Duplex Residence', slug: 'modern-duplex-house-haldwani', location: 'Haldwani, Uttarakhand', client_name: null, show_client_name: 0, project_status: 'ongoing', is_concept: 0, duration: '10 - 12 Months', construction_area: '2,800 sq. ft.', start_date: null, completion_date: null, short_description: 'Contemporary multi-level duplex residence with clean architectural elevation, cantilevered balcony, and seismic-conscious RCC framing.', full_description: null, specifications_json: '{}', featured_image: '/taj/WhatsApp%20Image%202026-11-25%20at%2017.21.31.jpeg', before_image: null, after_image: null, is_featured: 1, status: 'published', display_order: 1 },
  { id: 2, category_id: 1, category_name: 'Residential', category_slug: 'residential', title: 'Two-Storey Contemporary Grey Residence', slug: 'commercial-office-complex-haldwani', location: 'Haldwani, Nainital', client_name: null, show_client_name: 0, project_status: 'completed', is_concept: 0, duration: '12 Months', construction_area: '3,200 sq. ft.', start_date: null, completion_date: null, short_description: 'Completed two-storey family residence featuring textured slate facade, hardwood louver windows, decorative portico pillars, and perimeter boundary wall.', full_description: null, specifications_json: '{}', featured_image: '/taj/WhatsApp%20Image%202026-11-25%20at%2017.33.19.jpeg', before_image: null, after_image: null, is_featured: 1, status: 'published', display_order: 2 },
  { id: 3, category_id: 5, category_name: 'Villas', category_slug: 'villas', title: 'Stone-Clad Independent Villa Residence', slug: 'kumaon-hillside-luxury-villa', location: 'Haldwani / Nainital Region', client_name: null, show_client_name: 0, project_status: 'completed', is_concept: 0, duration: '10 Months', construction_area: '2,400 sq. ft.', start_date: null, completion_date: null, short_description: 'Finished single-level luxury residence with natural grey stone block cladding, ornamental terrace railings, and bespoke steel entrance gate.', full_description: null, specifications_json: '{}', featured_image: '/taj/WhatsApp%20Image%202026-11-25%20at%2017.33.22.jpeg', before_image: null, after_image: null, is_featured: 1, status: 'published', display_order: 3 },
  { id: 4, category_id: 4, category_name: 'Duplex Houses', category_slug: 'duplex-houses', title: 'Cantilevered Modern RCC Duplex Structure', slug: 'industrial-warehouse-facility-uttarakhand', location: 'Haldwani, Uttarakhand', client_name: null, show_client_name: 0, project_status: 'ongoing', is_concept: 0, duration: '11 Months', construction_area: '3,400 sq. ft.', start_date: null, completion_date: null, short_description: 'Precision plastered RCC duplex structure featuring bold parapet geometry, recessed terrace lounge, and wide parking portico.', full_description: null, specifications_json: '{}', featured_image: '/taj/WhatsApp%20Image%202026-11-25%20at%2017.36.34%20(1).jpeg', before_image: null, after_image: null, is_featured: 1, status: 'published', display_order: 4 },
  { id: 5, category_id: 7, category_name: 'Renovation', category_slug: 'renovation', title: 'Custom Residence & Entrance Elevation', slug: 'contemporary-home-renovation-haldwani', location: 'Haldwani, Uttarakhand', client_name: null, show_client_name: 0, project_status: 'completed', is_concept: 0, duration: '8 Months', construction_area: '2,600 sq. ft.', start_date: null, completion_date: null, short_description: 'Clean modern residential exterior with stone-clad pillars, laser-cut main gate, granite driveway ramp, and boundary wall detailing.', full_description: null, specifications_json: '{}', featured_image: '/taj/WhatsApp%20Image%202026-11-25%20at%2017.33.41.jpeg', before_image: null, after_image: null, is_featured: 1, status: 'published', display_order: 5 },
  { id: 6, category_id: 6, category_name: 'Infrastructure', category_slug: 'infrastructure', title: 'Brickwork & RCC Multi-Level Structure', slug: 'rcc-foundation-infrastructure-uttarakhand', location: 'Nainital District, Uttarakhand', client_name: null, show_client_name: 0, project_status: 'ongoing', is_concept: 0, duration: '10 Months', construction_area: '3,000 sq. ft.', start_date: null, completion_date: null, short_description: 'Ongoing multi-storey masonry, structural concrete slabs, architectural groove plastering, and supervised civil execution.', full_description: null, specifications_json: '{}', featured_image: '/taj/WhatsApp%20Image%202026-11-25%20at%2017.33.42.jpeg', before_image: null, after_image: null, is_featured: 1, status: 'published', display_order: 6 },
];

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const rows = await query<HeroSlide>(
      `SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY display_order ASC, id ASC`
    );
    return rows.length > 0 ? rows : DEFAULT_HERO_SLIDES;
  } catch {
    return DEFAULT_HERO_SLIDES;
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

    const rows = await query<ServiceRecord>(
      `SELECT s.*, c.name AS category_name, c.slug AS category_slug
       FROM services s
       LEFT JOIN service_categories c ON c.id = s.category_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY s.display_order ASC, s.id ASC
       ${limitSql}`,
      params
    );
    return rows.length > 0 ? rows : DEFAULT_SERVICES.slice(0, options?.limit ?? DEFAULT_SERVICES.length);
  } catch {
    return DEFAULT_SERVICES.slice(0, options?.limit ?? DEFAULT_SERVICES.length);
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

    const rows = await query<ProjectRecord>(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM projects p
       LEFT JOIN project_categories c ON c.id = p.category_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY p.display_order ASC, p.id ASC
       ${limitSql}`,
      params
    );
    return rows.length > 0 ? rows : DEFAULT_PROJECTS.slice(0, options?.limit ?? DEFAULT_PROJECTS.length);
  } catch {
    return DEFAULT_PROJECTS.slice(0, options?.limit ?? DEFAULT_PROJECTS.length);
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
  const tajImages = getAllUniqueTajGalleryImages();

  try {
    const [dbCategories, dbImages] = await Promise.all([
      query<GalleryCategory>(
        `SELECT * FROM gallery_categories WHERE is_active = 1 ORDER BY display_order ASC, id ASC`
      ),
      query<GalleryImage>(
        `SELECT g.*, c.name AS category_name, c.slug AS category_slug, p.title AS project_title
         FROM gallery_images g
         LEFT JOIN gallery_categories c ON c.id = g.category_id
         LEFT JOIN projects p ON p.id = g.project_id
         WHERE g.deleted_at IS NULL AND g.status = 'published'
         ORDER BY g.display_order ASC, g.id ASC`
      ),
    ]);

    // Merge admin-uploaded DB images (excluding old duplicate stock /images/ placeholders) + ALL 87 unique public/taj/ photos
    const seen = new Set<string>();
    const merged: GalleryImage[] = [];

    for (const img of [...tajImages, ...dbImages]) {
      const normalized = decodeURIComponent(img.media_url || '').trim().toLowerCase();
      if (!normalized || seen.has(normalized)) continue;
      // Avoid duplicating images already used in Hero/Services/Projects stock /images/ folder
      if (normalized.startsWith('/images/')) continue;
      seen.add(normalized);
      merged.push(img);
    }

    const categoryMap = new Map<string, GalleryCategory>();
    for (const cat of [...TAJ_GALLERY_CATEGORIES, ...dbCategories]) {
      if (!categoryMap.has(cat.slug)) categoryMap.set(cat.slug, cat);
    }

    const finalImages = limit ? merged.slice(0, limit) : merged;
    return {
      categories: Array.from(categoryMap.values()),
      images: finalImages,
    };
  } catch {
    return {
      categories: TAJ_GALLERY_CATEGORIES,
      images: limit ? tajImages.slice(0, limit) : tajImages,
    };
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
