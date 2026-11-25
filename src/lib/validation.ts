import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Valid email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

export const publicContactSchema = z.object({
  full_name: z.string().trim().min(2, 'Please enter your full name').max(150),
  phone: z
    .string()
    .trim()
    .min(8, 'Please enter a valid mobile number')
    .max(30)
    .regex(/^[+\d\s()-]{8,30}$/, 'Invalid phone number format'),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  service_required: z.string().trim().max(191).optional().or(z.literal('')),
  project_type: z.string().trim().max(120).optional().or(z.literal('')),
  project_location: z.string().trim().max(191).optional().or(z.literal('')),
  estimated_budget: z.string().trim().max(120).optional().or(z.literal('')),
  message: z.string().trim().min(5, 'Please share brief details about your project').max(3000),
  privacy_consent: z.boolean().refine((v) => v === true, {
    message: 'Please accept the privacy consent to proceed',
  }),
  source: z.string().trim().max(100).optional(),
  // Honeypot anti-spam field — must remain empty
  website_hp: z.string().max(0, 'Spam detected').optional(),
});

export const serviceSchema = z.object({
  category_id: z.number().int().positive().nullable().optional(),
  title: z.string().trim().min(2).max(191),
  slug: z.string().trim().min(2).max(191).optional(),
  icon: z.string().trim().max(60).optional(),
  short_description: z.string().trim().min(10).max(1000),
  detailed_content: z.string().optional().nullable(),
  featured_image: z.string().trim().max(500).optional().nullable(),
  banner_image: z.string().trim().max(500).optional().nullable(),
  benefits_json: z.string().optional().nullable(),
  work_process_json: z.string().optional().nullable(),
  faqs_json: z.string().optional().nullable(),
  is_featured: z.union([z.boolean(), z.number()]).optional(),
  status: z.enum(['draft', 'published']).default('published'),
  display_order: z.number().int().default(0),
});

export const projectSchema = z.object({
  category_id: z.number().int().positive().nullable().optional(),
  title: z.string().trim().min(2).max(191),
  slug: z.string().trim().min(2).max(191).optional(),
  location: z.string().trim().min(2).max(191),
  client_name: z.string().trim().max(150).optional().nullable(),
  show_client_name: z.union([z.boolean(), z.number()]).optional(),
  project_status: z.enum(['upcoming', 'ongoing', 'completed']).default('ongoing'),
  is_concept: z.union([z.boolean(), z.number()]).optional(),
  duration: z.string().trim().max(100).optional().nullable(),
  construction_area: z.string().trim().max(100).optional().nullable(),
  start_date: z.string().optional().nullable(),
  completion_date: z.string().optional().nullable(),
  short_description: z.string().trim().min(10).max(1000),
  full_description: z.string().optional().nullable(),
  specifications_json: z.string().optional().nullable(),
  featured_image: z.string().trim().max(500).optional().nullable(),
  before_image: z.string().trim().max(500).optional().nullable(),
  after_image: z.string().trim().max(500).optional().nullable(),
  is_featured: z.union([z.boolean(), z.number()]).optional(),
  status: z.enum(['draft', 'published']).default('published'),
  display_order: z.number().int().default(0),
});

export const galleryItemSchema = z.object({
  category_id: z.number().int().positive().nullable().optional(),
  project_id: z.number().int().positive().nullable().optional(),
  title: z.string().trim().min(1).max(191),
  caption: z.string().trim().max(500).optional().nullable(),
  alt_text: z.string().trim().max(255).optional().nullable(),
  media_type: z.enum(['image', 'video']).default('image'),
  media_url: z.string().trim().min(1).max(500),
  thumbnail_url: z.string().trim().max(500).optional().nullable(),
  is_concept: z.union([z.boolean(), z.number()]).optional(),
  is_featured: z.union([z.boolean(), z.number()]).optional(),
  status: z.enum(['draft', 'published']).default('published'),
  display_order: z.number().int().default(0),
});

export const pageSchema = z.object({
  title: z.string().trim().min(2).max(191),
  slug: z.string().trim().min(2).max(191).optional(),
  page_type: z.enum(['system', 'custom', 'legal']).default('custom'),
  hero_title: z.string().trim().max(255).optional().nullable(),
  hero_subtitle: z.string().trim().max(1000).optional().nullable(),
  hero_image_url: z.string().trim().max(500).optional().nullable(),
  content: z.string().optional().nullable(),
  status: z.enum(['draft', 'published']).default('published'),
  is_indexable: z.union([z.boolean(), z.number()]).optional(),
  display_order: z.number().int().default(0),
});

export const pageSectionSchema = z.object({
  page_id: z.number().int().positive(),
  section_key: z.string().trim().min(1).max(100),
  section_type: z.enum([
    'hero',
    'text_image',
    'services_grid',
    'project_grid',
    'gallery',
    'statistics',
    'testimonials',
    'faq',
    'contact_form',
    'cta',
    'rich_text',
    'video',
    'custom_banner',
    'process_timeline',
    'why_choose_us',
  ]),
  heading: z.string().trim().max(255).optional().nullable(),
  subheading: z.string().trim().max(255).optional().nullable(),
  description: z.string().optional().nullable(),
  content_json: z.string().optional().nullable(),
  image_url: z.string().trim().max(500).optional().nullable(),
  background_color: z.string().trim().max(30).optional().nullable(),
  background_image_url: z.string().trim().max(500).optional().nullable(),
  button_text: z.string().trim().max(100).optional().nullable(),
  button_link: z.string().trim().max(255).optional().nullable(),
  secondary_button_text: z.string().trim().max(100).optional().nullable(),
  secondary_button_link: z.string().trim().max(255).optional().nullable(),
  layout_variant: z.string().trim().max(60).optional().nullable(),
  animation_type: z.string().trim().max(60).optional().nullable(),
  is_visible: z.union([z.boolean(), z.number()]).optional(),
  status: z.enum(['draft', 'published']).default('published'),
  display_order: z.number().int().default(0),
});

export const themeSchema = z.object({
  primary_color: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/),
  secondary_color: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/),
  dark_bg_color: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/),
  light_bg_color: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/),
  surface_color: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/),
  muted_text_color: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/),
  heading_font: z.string().trim().min(2).max(80),
  body_font: z.string().trim().min(2).max(80),
  border_radius: z.string().trim().max(20).optional(),
  header_style: z.string().trim().max(40).optional(),
});

export const animationSchema = z.object({
  animations_enabled: z.union([z.boolean(), z.number()]),
  smooth_scroll_enabled: z.union([z.boolean(), z.number()]),
  parallax_enabled: z.union([z.boolean(), z.number()]),
  hero_animations_enabled: z.union([z.boolean(), z.number()]),
  project_animations_enabled: z.union([z.boolean(), z.number()]),
  hover_effects_enabled: z.union([z.boolean(), z.number()]),
  mobile_animations_enabled: z.union([z.boolean(), z.number()]),
  animation_style: z.enum(['cinematic', 'architectural', 'minimal', 'dynamic']),
  duration_multiplier: z.number().min(0.4).max(2.5),
  intensity: z.enum(['subtle', 'medium', 'bold']),
});

export const seoSchema = z.object({
  entity_type: z.enum(['page', 'service', 'project', 'global']),
  entity_slug: z.string().trim().min(1).max(191),
  meta_title: z.string().trim().max(255).optional().nullable(),
  meta_description: z.string().trim().max(500).optional().nullable(),
  focus_keyword: z.string().trim().max(191).optional().nullable(),
  canonical_url: z.string().trim().max(500).optional().nullable(),
  og_title: z.string().trim().max(255).optional().nullable(),
  og_description: z.string().trim().max(500).optional().nullable(),
  og_image: z.string().trim().max(500).optional().nullable(),
  twitter_title: z.string().trim().max(255).optional().nullable(),
  twitter_description: z.string().trim().max(500).optional().nullable(),
  twitter_image: z.string().trim().max(500).optional().nullable(),
  robots_index: z.union([z.boolean(), z.number()]).optional(),
  robots_follow: z.union([z.boolean(), z.number()]).optional(),
  structured_data_json: z.string().optional().nullable(),
});

export const adminUserCreateSchema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(191),
  password: z.string().min(8).max(128),
  role_id: z.number().int().positive(),
  phone: z.string().trim().max(30).optional().nullable(),
  is_active: z.union([z.boolean(), z.number()]).optional(),
});
