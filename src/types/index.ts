export interface WebsiteSettings {
  id: number;
  site_name: string;
  tagline: string | null;
  domain_name: string | null;
  logo_url: string | null;
  logo_dark_url: string | null;
  favicon_url: string | null;
  google_analytics_id: string | null;
  google_search_console_code: string | null;
  header_cta_primary_label: string | null;
  header_cta_primary_url: string | null;
  header_cta_secondary_label: string | null;
  header_cta_secondary_url: string | null;
  show_top_bar: number;
  maintenance_mode: number;
  footer_copyright: string | null;
  updated_at?: string;
}

export interface CoreValueItem {
  title: string;
  description: string;
}

export interface WhyChooseItem {
  title: string;
  description: string;
  icon?: string;
}

export interface CompanyProfile {
  id: number;
  company_name: string;
  owner_name: string;
  owner_title: string | null;
  owner_bio: string | null;
  owner_image_url: string | null;
  business_type: string | null;
  short_intro: string | null;
  about_overview: string | null;
  company_history: string | null;
  mission: string | null;
  vision: string | null;
  core_values_json: string | null;
  expertise_json: string | null;
  quality_assurance: string | null;
  safety_standards: string | null;
  why_choose_us_json: string | null;
  about_image_url: string | null;
  established_year: string | null;
  service_areas: string | null;
}

export interface ThemeSettings {
  id: number;
  primary_color: string;
  secondary_color: string;
  dark_bg_color: string;
  light_bg_color: string;
  surface_color: string;
  muted_text_color: string;
  heading_font: string;
  body_font: string;
  border_radius: string;
  header_style: string;
}

export interface AnimationSettings {
  id: number;
  animations_enabled: number;
  smooth_scroll_enabled: number;
  parallax_enabled: number;
  hero_animations_enabled: number;
  project_animations_enabled: number;
  hover_effects_enabled: number;
  mobile_animations_enabled: number;
  animation_style: 'cinematic' | 'architectural' | 'minimal' | 'dynamic';
  duration_multiplier: number;
  intensity: 'subtle' | 'medium' | 'bold';
}

export interface ContactSettings {
  id: number;
  owner_name: string;
  phone: string;
  secondary_phone: string | null;
  whatsapp_number: string;
  whatsapp_default_message: string;
  email: string;
  address_line: string;
  city: string;
  district: string;
  state: string;
  pin_code: string;
  country: string;
  working_hours: string | null;
  google_maps_embed_url: string | null;
  floating_whatsapp_enabled: number;
  floating_call_enabled: number;
  floating_quote_enabled: number;
  floating_position: 'bottom-right' | 'bottom-left';
  floating_whatsapp_color: string;
  floating_call_color: string;
  floating_quote_color: string;
}

export interface SocialLink {
  id: number;
  platform: string;
  label: string;
  url: string;
  icon: string | null;
  is_visible: number;
  display_order: number;
}

export interface NavigationItem {
  id: number;
  parent_id: number | null;
  label: string;
  href: string;
  target: string;
  is_visible: number;
  display_order: number;
}

export interface PageRecord {
  id: number;
  title: string;
  slug: string;
  page_type: 'system' | 'custom' | 'legal';
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  content: string | null;
  status: 'draft' | 'published';
  is_indexable: number;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface PageSection {
  id: number;
  page_id: number;
  section_key: string;
  section_type:
    | 'hero'
    | 'text_image'
    | 'services_grid'
    | 'project_grid'
    | 'gallery'
    | 'statistics'
    | 'testimonials'
    | 'faq'
    | 'contact_form'
    | 'cta'
    | 'rich_text'
    | 'video'
    | 'custom_banner'
    | 'process_timeline'
    | 'why_choose_us';
  heading: string | null;
  subheading: string | null;
  description: string | null;
  content_json: string | null;
  image_url: string | null;
  background_color: string | null;
  background_image_url: string | null;
  button_text: string | null;
  button_link: string | null;
  secondary_button_text: string | null;
  secondary_button_link: string | null;
  layout_variant: string | null;
  animation_type: string | null;
  is_visible: number;
  status: 'draft' | 'published';
  display_order: number;
}

export interface HeroSlide {
  id: number;
  eyebrow: string | null;
  heading: string;
  description: string | null;
  image_url: string;
  image_alt: string | null;
  primary_cta_label: string | null;
  primary_cta_link: string | null;
  secondary_cta_label: string | null;
  secondary_cta_link: string | null;
  show_whatsapp_cta: number;
  overlay_opacity: number;
  animation_preset: string | null;
  is_active: number;
  display_order: number;
}

export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: number;
}

export interface ServiceRecord {
  id: number;
  category_id: number | null;
  category_name?: string | null;
  category_slug?: string | null;
  title: string;
  slug: string;
  icon: string | null;
  short_description: string;
  detailed_content: string | null;
  featured_image: string | null;
  banner_image: string | null;
  benefits_json: string | null;
  work_process_json: string | null;
  faqs_json: string | null;
  is_featured: number;
  status: 'draft' | 'published';
  display_order: number;
  updated_at?: string;
}

export interface ServiceImage {
  id: number;
  service_id: number;
  image_url: string;
  alt_text: string | null;
  caption: string | null;
  display_order: number;
}

export interface ProjectCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: number;
}

export interface ProjectRecord {
  id: number;
  category_id: number | null;
  category_name?: string | null;
  category_slug?: string | null;
  title: string;
  slug: string;
  location: string;
  client_name: string | null;
  show_client_name: number;
  project_status: 'upcoming' | 'ongoing' | 'completed';
  is_concept: number;
  duration: string | null;
  construction_area: string | null;
  start_date: string | null;
  completion_date: string | null;
  short_description: string;
  full_description: string | null;
  specifications_json: string | null;
  featured_image: string | null;
  before_image: string | null;
  after_image: string | null;
  is_featured: number;
  status: 'draft' | 'published';
  display_order: number;
  updated_at?: string;
}

export interface ProjectImage {
  id: number;
  project_id: number;
  image_url: string;
  alt_text: string | null;
  caption: string | null;
  image_type: 'gallery' | 'before' | 'after' | 'blueprint';
  display_order: number;
}

export interface GalleryCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  is_active: number;
}

export interface GalleryImage {
  id: number;
  category_id: number | null;
  category_name?: string | null;
  category_slug?: string | null;
  project_id: number | null;
  project_title?: string | null;
  title: string;
  caption: string | null;
  alt_text: string | null;
  media_type: 'image' | 'video';
  media_url: string;
  thumbnail_url: string | null;
  is_concept: number;
  is_featured: number;
  status: 'draft' | 'published';
  display_order: number;
}

export interface MediaItem {
  id: number;
  filename: string;
  original_name: string;
  url: string;
  webp_url: string | null;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  title: string | null;
  alt_text: string | null;
  caption: string | null;
  folder: string;
  uploaded_by: number | null;
  created_at: string;
}

export interface TeamMember {
  id: number;
  name: string;
  designation: string;
  bio: string | null;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  is_leadership: number;
  status: 'draft' | 'published';
  display_order: number;
}

export interface Testimonial {
  id: number;
  client_name: string;
  client_photo: string | null;
  designation: string | null;
  review: string;
  rating: number;
  project_id: number | null;
  project_reference: string | null;
  status: 'draft' | 'published';
  display_order: number;
}

export interface FaqItem {
  id: number;
  category: string;
  question: string;
  answer: string;
  status: 'draft' | 'published';
  display_order: number;
}

export interface StatisticItem {
  id: number;
  stat_key: string;
  label: string;
  value: number;
  suffix: string | null;
  icon: string | null;
  is_visible: number;
  display_order: number;
}

export interface ProcessStep {
  id: number;
  step_number: string;
  title: string;
  description: string;
  icon: string | null;
  is_active: number;
  display_order: number;
}

export interface InquiryRecord {
  id: number;
  full_name: string;
  phone: string;
  email: string | null;
  service_required: string | null;
  project_type: string | null;
  project_location: string | null;
  estimated_budget: string | null;
  message: string;
  source: string;
  status: 'new' | 'contacted' | 'in_progress' | 'quotation_sent' | 'converted' | 'closed';
  ip_address: string | null;
  privacy_consent: number;
  created_at: string;
  updated_at: string;
}

export interface InquiryNote {
  id: number;
  inquiry_id: number;
  admin_user_id: number | null;
  admin_name?: string | null;
  note: string;
  created_at: string;
}

export interface FooterLink {
  id: number;
  footer_section_id: number;
  label: string;
  href: string;
  target: string;
  is_visible: number;
  display_order: number;
}

export interface FooterSection {
  id: number;
  title: string;
  section_key: string;
  description: string | null;
  is_visible: number;
  display_order: number;
  links?: FooterLink[];
}

export interface SeoMetadata {
  id: number;
  entity_type: 'page' | 'service' | 'project' | 'global';
  entity_slug: string;
  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  robots_index: number;
  robots_follow: number;
  structured_data_json: string | null;
}

export interface RedirectRule {
  id: number;
  source_path: string;
  destination_path: string;
  status_code: number;
  is_active: number;
}

export interface ActivityLog {
  id: number;
  admin_user_id: number | null;
  admin_name?: string | null;
  admin_email?: string | null;
  action: string;
  module: string;
  entity_id: string | null;
  description: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface AdminUserSession {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleSlug: string;
  roleName: string;
  permissions: string[];
  avatarUrl: string | null;
}

export interface SiteBundle {
  website: WebsiteSettings;
  company: CompanyProfile;
  theme: ThemeSettings;
  animations: AnimationSettings;
  contact: ContactSettings;
  socialLinks: SocialLink[];
  navigation: NavigationItem[];
  footerSections: FooterSection[];
}
