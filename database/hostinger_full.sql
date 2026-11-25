-- ============================================================================
-- Sartaj Construction Platform - Complete MySQL / MariaDB Schema
-- Database: construction
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ============================================================================





SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------
-- 1. RBAC & ADMIN AUTHENTICATION
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_slug` (`slug`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `permissions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL,
  `module` VARCHAR(80) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_permissions_slug` (`slug`),
  KEY `idx_permissions_module` (`module`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` INT UNSIGNED NOT NULL,
  `permission_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `avatar_url` VARCHAR(500) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `failed_login_attempts` INT UNSIGNED NOT NULL DEFAULT 0,
  `locked_until` TIMESTAMP NULL DEFAULT NULL,
  `last_login_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_users_email` (`email`),
  KEY `idx_admin_users_role` (`role_id`),
  CONSTRAINT `fk_admin_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `admin_sessions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `admin_user_id` INT UNSIGNED NOT NULL,
  `token_hash` VARCHAR(191) NOT NULL,
  `ip_address` VARCHAR(64) DEFAULT NULL,
  `user_agent` VARCHAR(500) DEFAULT NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admin_sessions_token` (`token_hash`),
  KEY `idx_admin_sessions_user` (`admin_user_id`),
  KEY `idx_admin_sessions_expires` (`expires_at`),
  CONSTRAINT `fk_admin_sessions_user` FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. GLOBAL CONFIGURATION, PROFILE, THEME, ANIMATIONS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `website_settings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `site_name` VARCHAR(191) NOT NULL DEFAULT 'Sartaj Construction',
  `tagline` VARCHAR(255) DEFAULT 'Building Your Vision. Creating Your Future.',
  `domain_name` VARCHAR(255) DEFAULT 'http://localhost:3000',
  `logo_url` VARCHAR(500) DEFAULT NULL,
  `logo_dark_url` VARCHAR(500) DEFAULT NULL,
  `favicon_url` VARCHAR(500) DEFAULT NULL,
  `google_analytics_id` VARCHAR(100) DEFAULT NULL,
  `google_search_console_code` VARCHAR(255) DEFAULT NULL,
  `header_cta_primary_label` VARCHAR(80) DEFAULT 'Get a Quote',
  `header_cta_primary_url` VARCHAR(255) DEFAULT '/contact',
  `header_cta_secondary_label` VARCHAR(80) DEFAULT 'Inquire Now',
  `header_cta_secondary_url` VARCHAR(255) DEFAULT '/contact#inquiry-form',
  `show_top_bar` TINYINT(1) NOT NULL DEFAULT 1,
  `maintenance_mode` TINYINT(1) NOT NULL DEFAULT 0,
  `footer_copyright` VARCHAR(255) DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `company_profiles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_name` VARCHAR(191) NOT NULL DEFAULT 'Sartaj Construction',
  `owner_name` VARCHAR(150) NOT NULL DEFAULT 'Sartaj Hussain',
  `owner_title` VARCHAR(150) DEFAULT 'Founder & Managing Director',
  `owner_bio` TEXT DEFAULT NULL,
  `owner_image_url` VARCHAR(500) DEFAULT NULL,
  `business_type` VARCHAR(191) DEFAULT 'Construction and Infrastructure Services',
  `short_intro` TEXT DEFAULT NULL,
  `about_overview` LONGTEXT DEFAULT NULL,
  `company_history` LONGTEXT DEFAULT NULL,
  `mission` TEXT DEFAULT NULL,
  `vision` TEXT DEFAULT NULL,
  `core_values_json` LONGTEXT DEFAULT NULL,
  `expertise_json` LONGTEXT DEFAULT NULL,
  `quality_assurance` TEXT DEFAULT NULL,
  `safety_standards` TEXT DEFAULT NULL,
  `why_choose_us_json` LONGTEXT DEFAULT NULL,
  `about_image_url` VARCHAR(500) DEFAULT NULL,
  `established_year` VARCHAR(20) DEFAULT NULL,
  `service_areas` VARCHAR(255) DEFAULT 'Haldwani, Nainital, and across Uttarakhand',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `theme_settings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `primary_color` VARCHAR(30) NOT NULL DEFAULT '#111827',
  `secondary_color` VARCHAR(30) NOT NULL DEFAULT '#F5B301',
  `dark_bg_color` VARCHAR(30) NOT NULL DEFAULT '#0B0F14',
  `light_bg_color` VARCHAR(30) NOT NULL DEFAULT '#F8F9FB',
  `surface_color` VARCHAR(30) NOT NULL DEFAULT '#FFFFFF',
  `muted_text_color` VARCHAR(30) NOT NULL DEFAULT '#64748B',
  `heading_font` VARCHAR(80) NOT NULL DEFAULT 'Space Grotesk',
  `body_font` VARCHAR(80) NOT NULL DEFAULT 'Inter',
  `border_radius` VARCHAR(20) NOT NULL DEFAULT '0.5rem',
  `header_style` VARCHAR(40) NOT NULL DEFAULT 'transparent-overlay',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `animation_settings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `animations_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `smooth_scroll_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `parallax_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `hero_animations_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `project_animations_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `hover_effects_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `mobile_animations_enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `animation_style` ENUM('cinematic', 'architectural', 'minimal', 'dynamic') NOT NULL DEFAULT 'cinematic',
  `duration_multiplier` DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  `intensity` ENUM('subtle', 'medium', 'bold') NOT NULL DEFAULT 'medium',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `contact_settings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `owner_name` VARCHAR(150) NOT NULL DEFAULT 'Sartaj Hussain',
  `phone` VARCHAR(40) NOT NULL DEFAULT '+91 9897300398',
  `secondary_phone` VARCHAR(40) DEFAULT NULL,
  `whatsapp_number` VARCHAR(40) NOT NULL DEFAULT '+91 9897300398',
  `whatsapp_default_message` VARCHAR(500) NOT NULL DEFAULT 'Hello, I am interested in your construction services. Please share more details.',
  `email` VARCHAR(191) NOT NULL DEFAULT 'sartajkhan4284@gmail.com',
  `address_line` VARCHAR(255) NOT NULL DEFAULT 'Haldwani',
  `city` VARCHAR(100) NOT NULL DEFAULT 'Haldwani',
  `district` VARCHAR(100) NOT NULL DEFAULT 'Nainital',
  `state` VARCHAR(100) NOT NULL DEFAULT 'Uttarakhand',
  `pin_code` VARCHAR(20) NOT NULL DEFAULT '263139',
  `country` VARCHAR(100) NOT NULL DEFAULT 'India',
  `working_hours` VARCHAR(255) DEFAULT 'Mon - Sat: 9:00 AM - 7:00 PM',
  `google_maps_embed_url` TEXT DEFAULT NULL,
  `floating_whatsapp_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `floating_call_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `floating_quote_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `floating_position` ENUM('bottom-right', 'bottom-left') NOT NULL DEFAULT 'bottom-right',
  `floating_whatsapp_color` VARCHAR(30) NOT NULL DEFAULT '#25D366',
  `floating_call_color` VARCHAR(30) NOT NULL DEFAULT '#111827',
  `floating_quote_color` VARCHAR(30) NOT NULL DEFAULT '#F5B301',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `social_links` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `platform` VARCHAR(60) NOT NULL,
  `label` VARCHAR(100) NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `icon` VARCHAR(60) DEFAULT NULL,
  `is_visible` TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_social_order` (`display_order`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. NAVIGATION, PAGES, DYNAMIC PAGE BUILDER & HERO SLIDER
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `navigation_items` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `parent_id` INT UNSIGNED DEFAULT NULL,
  `label` VARCHAR(100) NOT NULL,
  `href` VARCHAR(255) NOT NULL,
  `target` VARCHAR(20) NOT NULL DEFAULT '_self',
  `is_visible` TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_nav_parent` (`parent_id`),
  KEY `idx_nav_order` (`display_order`),
  CONSTRAINT `fk_nav_parent` FOREIGN KEY (`parent_id`) REFERENCES `navigation_items` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pages` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `page_type` ENUM('system', 'custom', 'legal') NOT NULL DEFAULT 'custom',
  `hero_title` VARCHAR(255) DEFAULT NULL,
  `hero_subtitle` TEXT DEFAULT NULL,
  `hero_image_url` VARCHAR(500) DEFAULT NULL,
  `content` LONGTEXT DEFAULT NULL,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'published',
  `is_indexable` TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pages_slug` (`slug`),
  KEY `idx_pages_status` (`status`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `page_sections` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `page_id` INT UNSIGNED NOT NULL,
  `section_key` VARCHAR(100) NOT NULL,
  `section_type` ENUM(
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
    'why_choose_us'
  ) NOT NULL,
  `heading` VARCHAR(255) DEFAULT NULL,
  `subheading` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `content_json` LONGTEXT DEFAULT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  `background_color` VARCHAR(30) DEFAULT NULL,
  `background_image_url` VARCHAR(500) DEFAULT NULL,
  `button_text` VARCHAR(100) DEFAULT NULL,
  `button_link` VARCHAR(255) DEFAULT NULL,
  `secondary_button_text` VARCHAR(100) DEFAULT NULL,
  `secondary_button_link` VARCHAR(255) DEFAULT NULL,
  `layout_variant` VARCHAR(60) DEFAULT 'default',
  `animation_type` VARCHAR(60) DEFAULT 'fade-up',
  `is_visible` TINYINT(1) NOT NULL DEFAULT 1,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'published',
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_page_sections_page` (`page_id`),
  KEY `idx_page_sections_order` (`page_id`, `display_order`),
  CONSTRAINT `fk_page_sections_page` FOREIGN KEY (`page_id`) REFERENCES `pages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `hero_slides` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `eyebrow` VARCHAR(120) DEFAULT NULL,
  `heading` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `image_alt` VARCHAR(255) DEFAULT NULL,
  `primary_cta_label` VARCHAR(100) DEFAULT 'Explore Our Projects',
  `primary_cta_link` VARCHAR(255) DEFAULT '/projects',
  `secondary_cta_label` VARCHAR(100) DEFAULT 'Get a Free Consultation',
  `secondary_cta_link` VARCHAR(255) DEFAULT '/contact',
  `show_whatsapp_cta` TINYINT(1) NOT NULL DEFAULT 1,
  `overlay_opacity` DECIMAL(3,2) NOT NULL DEFAULT 0.55,
  `animation_preset` VARCHAR(60) DEFAULT 'zoom-reveal',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_hero_slides_order` (`is_active`, `display_order`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. SERVICES
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `service_categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_service_cat_slug` (`slug`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `services` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` INT UNSIGNED DEFAULT NULL,
  `title` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `icon` VARCHAR(60) DEFAULT 'Building2',
  `short_description` TEXT NOT NULL,
  `detailed_content` LONGTEXT DEFAULT NULL,
  `featured_image` VARCHAR(500) DEFAULT NULL,
  `banner_image` VARCHAR(500) DEFAULT NULL,
  `benefits_json` LONGTEXT DEFAULT NULL,
  `work_process_json` LONGTEXT DEFAULT NULL,
  `faqs_json` LONGTEXT DEFAULT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'published',
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_services_slug` (`slug`),
  KEY `idx_services_cat` (`category_id`),
  KEY `idx_services_status_order` (`status`, `display_order`),
  CONSTRAINT `fk_services_category` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `service_images` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `service_id` INT UNSIGNED NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `alt_text` VARCHAR(255) DEFAULT NULL,
  `caption` VARCHAR(255) DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_service_images_service` (`service_id`),
  CONSTRAINT `fk_service_images_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. PROJECTS PORTFOLIO
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `project_categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_project_cat_slug` (`slug`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` INT UNSIGNED DEFAULT NULL,
  `title` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `location` VARCHAR(191) NOT NULL DEFAULT 'Haldwani, Uttarakhand',
  `client_name` VARCHAR(150) DEFAULT NULL,
  `show_client_name` TINYINT(1) NOT NULL DEFAULT 0,
  `project_status` ENUM('upcoming', 'ongoing', 'completed') NOT NULL DEFAULT 'ongoing',
  `is_concept` TINYINT(1) NOT NULL DEFAULT 1,
  `duration` VARCHAR(100) DEFAULT NULL,
  `construction_area` VARCHAR(100) DEFAULT NULL,
  `start_date` DATE DEFAULT NULL,
  `completion_date` DATE DEFAULT NULL,
  `short_description` TEXT NOT NULL,
  `full_description` LONGTEXT DEFAULT NULL,
  `specifications_json` LONGTEXT DEFAULT NULL,
  `featured_image` VARCHAR(500) DEFAULT NULL,
  `before_image` VARCHAR(500) DEFAULT NULL,
  `after_image` VARCHAR(500) DEFAULT NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'published',
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_projects_slug` (`slug`),
  KEY `idx_projects_cat` (`category_id`),
  KEY `idx_projects_status_filter` (`status`, `project_status`, `display_order`),
  CONSTRAINT `fk_projects_category` FOREIGN KEY (`category_id`) REFERENCES `project_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `project_images` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `project_id` INT UNSIGNED NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `alt_text` VARCHAR(255) DEFAULT NULL,
  `caption` VARCHAR(255) DEFAULT NULL,
  `image_type` ENUM('gallery', 'before', 'after', 'blueprint') NOT NULL DEFAULT 'gallery',
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_project_images_project` (`project_id`),
  CONSTRAINT `fk_project_images_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. GALLERY & MEDIA LIBRARY
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `gallery_categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_gallery_cat_slug` (`slug`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gallery_images` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` INT UNSIGNED DEFAULT NULL,
  `project_id` INT UNSIGNED DEFAULT NULL,
  `title` VARCHAR(191) NOT NULL,
  `caption` VARCHAR(500) DEFAULT NULL,
  `alt_text` VARCHAR(255) DEFAULT NULL,
  `media_type` ENUM('image', 'video') NOT NULL DEFAULT 'image',
  `media_url` VARCHAR(500) NOT NULL,
  `thumbnail_url` VARCHAR(500) DEFAULT NULL,
  `is_concept` TINYINT(1) NOT NULL DEFAULT 1,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'published',
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_gallery_cat` (`category_id`),
  KEY `idx_gallery_project` (`project_id`),
  KEY `idx_gallery_order` (`status`, `display_order`),
  CONSTRAINT `fk_gallery_category` FOREIGN KEY (`category_id`) REFERENCES `gallery_categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_gallery_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `media_library` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `filename` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `webp_url` VARCHAR(500) DEFAULT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `file_size` INT UNSIGNED NOT NULL DEFAULT 0,
  `width` INT UNSIGNED DEFAULT NULL,
  `height` INT UNSIGNED DEFAULT NULL,
  `title` VARCHAR(191) DEFAULT NULL,
  `alt_text` VARCHAR(255) DEFAULT NULL,
  `caption` VARCHAR(500) DEFAULT NULL,
  `folder` VARCHAR(100) NOT NULL DEFAULT 'general',
  `uploaded_by` INT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_media_folder` (`folder`),
  KEY `idx_media_mime` (`mime_type`),
  CONSTRAINT `fk_media_uploader` FOREIGN KEY (`uploaded_by`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. TEAM, TESTIMONIALS, FAQS, STATISTICS, PROCESS STEPS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `team_members` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `designation` VARCHAR(150) NOT NULL,
  `bio` TEXT DEFAULT NULL,
  `photo_url` VARCHAR(500) DEFAULT NULL,
  `email` VARCHAR(191) DEFAULT NULL,
  `phone` VARCHAR(40) DEFAULT NULL,
  `linkedin_url` VARCHAR(255) DEFAULT NULL,
  `is_leadership` TINYINT(1) NOT NULL DEFAULT 0,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'published',
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_team_order` (`status`, `display_order`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `client_name` VARCHAR(150) NOT NULL,
  `client_photo` VARCHAR(500) DEFAULT NULL,
  `designation` VARCHAR(150) DEFAULT NULL,
  `review` TEXT NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL DEFAULT 5,
  `project_id` INT UNSIGNED DEFAULT NULL,
  `project_reference` VARCHAR(191) DEFAULT NULL,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_testimonials_status` (`status`, `display_order`),
  CONSTRAINT `fk_testimonials_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `faqs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category` VARCHAR(100) NOT NULL DEFAULT 'general',
  `question` VARCHAR(500) NOT NULL,
  `answer` TEXT NOT NULL,
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'published',
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_faqs_cat_order` (`category`, `status`, `display_order`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `statistics` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `stat_key` VARCHAR(80) NOT NULL,
  `label` VARCHAR(150) NOT NULL,
  `value` INT UNSIGNED NOT NULL DEFAULT 0,
  `suffix` VARCHAR(20) DEFAULT '+',
  `icon` VARCHAR(60) DEFAULT 'Award',
  `is_visible` TINYINT(1) NOT NULL DEFAULT 0,
  `display_order` INT NOT NULL DEFAULT 0,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_statistics_key` (`stat_key`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `process_steps` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `step_number` VARCHAR(10) NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `icon` VARCHAR(60) DEFAULT 'Compass',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_process_order` (`is_active`, `display_order`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. INQUIRIES CRM
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `inquiries` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(40) NOT NULL,
  `email` VARCHAR(191) DEFAULT NULL,
  `service_required` VARCHAR(191) DEFAULT NULL,
  `project_type` VARCHAR(120) DEFAULT NULL,
  `project_location` VARCHAR(191) DEFAULT NULL,
  `estimated_budget` VARCHAR(120) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `source` VARCHAR(100) NOT NULL DEFAULT 'contact_form',
  `status` ENUM('new', 'contacted', 'in_progress', 'quotation_sent', 'converted', 'closed') NOT NULL DEFAULT 'new',
  `ip_address` VARCHAR(64) DEFAULT NULL,
  `privacy_consent` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_inquiries_status` (`status`),
  KEY `idx_inquiries_created` (`created_at`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `inquiry_notes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `inquiry_id` INT UNSIGNED NOT NULL,
  `admin_user_id` INT UNSIGNED DEFAULT NULL,
  `note` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_inquiry_notes_inquiry` (`inquiry_id`),
  CONSTRAINT `fk_inquiry_notes_inquiry` FOREIGN KEY (`inquiry_id`) REFERENCES `inquiries` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inquiry_notes_admin` FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. FOOTER, SEO, REDIRECTS & AUDIT LOGS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `footer_sections` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(150) NOT NULL,
  `section_key` VARCHAR(80) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `is_visible` TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_footer_sections_key` (`section_key`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `footer_links` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `footer_section_id` INT UNSIGNED NOT NULL,
  `label` VARCHAR(120) NOT NULL,
  `href` VARCHAR(255) NOT NULL,
  `target` VARCHAR(20) NOT NULL DEFAULT '_self',
  `is_visible` TINYINT(1) NOT NULL DEFAULT 1,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_footer_links_section` (`footer_section_id`, `display_order`),
  CONSTRAINT `fk_footer_links_section` FOREIGN KEY (`footer_section_id`) REFERENCES `footer_sections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `seo_metadata` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `entity_type` ENUM('page', 'service', 'project', 'global') NOT NULL DEFAULT 'page',
  `entity_slug` VARCHAR(191) NOT NULL,
  `meta_title` VARCHAR(255) DEFAULT NULL,
  `meta_description` TEXT DEFAULT NULL,
  `focus_keyword` VARCHAR(191) DEFAULT NULL,
  `canonical_url` VARCHAR(500) DEFAULT NULL,
  `og_title` VARCHAR(255) DEFAULT NULL,
  `og_description` TEXT DEFAULT NULL,
  `og_image` VARCHAR(500) DEFAULT NULL,
  `twitter_title` VARCHAR(255) DEFAULT NULL,
  `twitter_description` TEXT DEFAULT NULL,
  `twitter_image` VARCHAR(500) DEFAULT NULL,
  `robots_index` TINYINT(1) NOT NULL DEFAULT 1,
  `robots_follow` TINYINT(1) NOT NULL DEFAULT 1,
  `structured_data_json` LONGTEXT DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_seo_entity` (`entity_type`, `entity_slug`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `redirects` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `source_path` VARCHAR(191) NOT NULL,
  `destination_path` VARCHAR(500) NOT NULL,
  `status_code` SMALLINT UNSIGNED NOT NULL DEFAULT 301,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_redirects_source` (`source_path`)
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `admin_user_id` INT UNSIGNED DEFAULT NULL,
  `action` VARCHAR(100) NOT NULL,
  `module` VARCHAR(80) NOT NULL,
  `entity_id` VARCHAR(64) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(64) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_activity_user` (`admin_user_id`),
  KEY `idx_activity_module` (`module`),
  KEY `idx_activity_created` (`created_at`),
  CONSTRAINT `fk_activity_admin` FOREIGN KEY (`admin_user_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB ROW_FORMAT=DYNAMIC DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;


-- ============================================================================
-- Sartaj Construction Platform - Initial Seed Data
-- Client: Sartaj Hussain | Haldwani, Nainital, Uttarakhand - 263139
-- Note: Zero fabricated statistics, zero fake testimonials, concept labels on AI visuals.
-- ============================================================================



-- 1. Roles & Permissions
INSERT INTO `roles` (`id`, `name`, `slug`, `description`) VALUES
  (1, 'Super Admin', 'super_admin', 'Full unrestricted access to all settings, users, security, and CMS modules.'),
  (2, 'Content Editor', 'content_editor', 'Can manage pages, services, projects, gallery, FAQs, media, and view inquiries.')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `description` = VALUES(`description`);

INSERT INTO `permissions` (`name`, `slug`, `module`, `description`) VALUES
  ('Manage Dashboard', 'dashboard.view', 'dashboard', 'View admin analytics and overview'),
  ('Manage Settings', 'settings.manage', 'settings', 'Update website, theme, animation, and contact settings'),
  ('Manage Content', 'content.manage', 'content', 'Create, update, and publish pages, sections, services, projects, gallery, and FAQs'),
  ('Manage Media', 'media.manage', 'media', 'Upload, edit, and delete files in media library'),
  ('Manage Inquiries', 'inquiries.manage', 'inquiries', 'View, update status, export, and delete inquiries'),
  ('Manage SEO', 'seo.manage', 'seo', 'Edit metadata, structured data, and redirects'),
  ('Manage Users', 'users.manage', 'users', 'Create, update, and deactivate admin users'),
  ('View Activity Logs', 'logs.view', 'logs', 'Inspect system audit trail')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, id FROM `permissions`;

INSERT IGNORE INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 2, id FROM `permissions` WHERE `slug` IN ('dashboard.view', 'content.manage', 'media.manage', 'inquiries.manage', 'seo.manage');

-- 2. Website Settings
INSERT INTO `website_settings` (`id`, `site_name`, `tagline`, `domain_name`, `header_cta_primary_label`, `header_cta_primary_url`, `header_cta_secondary_label`, `header_cta_secondary_url`, `show_top_bar`, `footer_copyright`)
VALUES (
  1,
  'Sartaj Construction',
  'Building Your Vision. Creating Your Future.',
  'http://localhost:3000',
  'Get a Quote',
  '/contact',
  'Inquire Now',
  '/contact#inquiry-form',
  1,
  'All rights reserved.'
)
ON DUPLICATE KEY UPDATE `site_name` = VALUES(`site_name`);

-- 3. Company Profile
INSERT INTO `company_profiles` (
  `id`, `company_name`, `owner_name`, `owner_title`, `owner_bio`, `business_type`,
  `short_intro`, `about_overview`, `company_history`, `mission`, `vision`,
  `core_values_json`, `expertise_json`, `quality_assurance`, `safety_standards`,
  `why_choose_us_json`, `about_image_url`, `owner_image_url`, `service_areas`
) VALUES (
  1,
  'Sartaj Construction',
  'Sartaj Hussain',
  'Founder & Managing Director',
  'Led by Sartaj Hussain, our practice brings disciplined civil engineering, transparent cost estimation, and dependable site execution to residential, commercial, and infrastructure developments across Haldwani, Nainital, and Uttarakhand.',
  'Construction and Infrastructure Services',
  'Delivering precision-engineered residential, commercial, architectural, and turnkey construction services in Haldwani and across Uttarakhand with unwavering commitment to structural integrity and transparent execution.',
  'Sartaj Construction is a full-service construction and infrastructure firm headquartered in Haldwani, Nainital, Uttarakhand. From bespoke duplex residences and hillside villas to commercial buildings, structural engineering, and turnkey contracting, we unify architectural clarity with rigorous site supervision.',
  'Built on the principles of honest material sourcing, disciplined project scheduling, and direct client communication, we serve homeowners, business owners, and institutional developers throughout the Kumaon region and Uttarakhand.',
  'To deliver structurally sound, architecturally refined, and transparently budgeted spaces that stand the test of time across Haldwani and Uttarakhand.',
  'To be Uttarakhand''s most trusted construction and infrastructure partner, recognized for engineering precision, ethical contracting, and enduring craftsmanship.',
  '[{"title":"Structural Integrity","description":"Every foundation, column, and slab is executed to strict civil engineering standards suited for Uttarakhand terrain."},{"title":"Transparent Costing","description":"Clear BOQ breakdowns, documented material specifications, and zero hidden charges at every milestone."},{"title":"Timely Delivery","description":"Structured construction schedules and active site management keep every handover predictable."},{"title":"Client-First Collaboration","description":"Direct founder oversight and regular progress updates from initial blueprint to final key handover."}]',
  '["Residential & Duplex Construction","Commercial & Retail Complexes","Architectural & Structural Planning","Turnkey Contracting & Project Management","Interior Fit-Outs & Renovation","Industrial & Infrastructure Civil Works"]',
  'We implement multi-stage material inspection for steel, cement, aggregates, and concrete mix ratios, paired with documented site checklists prior to every structural pour and finishing phase.',
  'All project sites follow structured safety protocols including protective equipment compliance, safe scaffolding standards, electrical isolation, and supervised heavy-machinery operations.',
  '[{"title":"Professional Construction Team","description":"Skilled civil engineers, site supervisors, and experienced craftsmen dedicated to quality execution.","icon":"HardHat"},{"title":"Quality Materials","description":"Certified structural steel, branded cement, and verified architectural finishes sourced transparently.","icon":"ShieldCheck"},{"title":"Transparent Pricing","description":"Itemized quotations and clear stage-wise payment milestones with zero hidden escalations.","icon":"FileSpreadsheet"},{"title":"Timely Project Delivery","description":"Disciplined phase scheduling and proactive procurement to respect your handover timeline.","icon":"Clock"},{"title":"Modern Construction Techniques","description":"Contemporary architectural detailing, seismic-conscious RCC practices, and efficient site workflows.","icon":"Compass"},{"title":"Safety and Quality Standards","description":"Strict on-site supervision, structural curing discipline, and documented quality audits.","icon":"Award"},{"title":"Customer Satisfaction","description":"Direct communication with leadership and responsive support throughout construction and handover.","icon":"Handshake"},{"title":"Customized Construction Solutions","description":"Tailored designs and turnkey packages aligned with your plot dimensions, terrain, and budget.","icon":"Layers"}]',
  '/images/construction-team.jpg',
  '/images/construction-team.jpg',
  'Haldwani, Nainital, Kathgodam, Rudrapur, Bhimtal & across Uttarakhand'
)
ON DUPLICATE KEY UPDATE `company_name` = VALUES(`company_name`);

-- 4. Theme Settings
INSERT INTO `theme_settings` (`id`, `primary_color`, `secondary_color`, `dark_bg_color`, `light_bg_color`, `surface_color`, `muted_text_color`, `heading_font`, `body_font`, `border_radius`, `header_style`)
VALUES (1, '#111827', '#F5B301', '#0B0F14', '#F8F9FB', '#FFFFFF', '#64748B', 'Space Grotesk', 'Inter', '0.5rem', 'transparent-overlay')
ON DUPLICATE KEY UPDATE `primary_color` = VALUES(`primary_color`);

-- 5. Animation Settings
INSERT INTO `animation_settings` (`id`, `animations_enabled`, `smooth_scroll_enabled`, `parallax_enabled`, `hero_animations_enabled`, `project_animations_enabled`, `hover_effects_enabled`, `mobile_animations_enabled`, `animation_style`, `duration_multiplier`, `intensity`)
VALUES (1, 1, 1, 1, 1, 1, 1, 0, 'cinematic', 1.00, 'medium')
ON DUPLICATE KEY UPDATE `animation_style` = VALUES(`animation_style`);

-- 6. Contact Settings
INSERT INTO `contact_settings` (
  `id`, `owner_name`, `phone`, `whatsapp_number`, `whatsapp_default_message`, `email`,
  `address_line`, `city`, `district`, `state`, `pin_code`, `country`, `working_hours`,
  `google_maps_embed_url`, `floating_whatsapp_enabled`, `floating_call_enabled`, `floating_quote_enabled`,
  `floating_position`, `floating_whatsapp_color`, `floating_call_color`, `floating_quote_color`
) VALUES (
  1,
  'Sartaj Hussain',
  '+91 9897300398',
  '+91 9897300398',
  'Hello, I am interested in your construction services. Please share more details.',
  'sartajkhan4284@gmail.com',
  'Haldwani',
  'Haldwani',
  'Nainital',
  'Uttarakhand',
  '263139',
  'India',
  'Mon - Sat: 9:00 AM - 7:00 PM | Sun: By Appointment',
  'https://www.google.com/maps?q=Haldwani,+Nainital,+Uttarakhand+263139,+India&output=embed',
  1, 1, 1, 'bottom-right', '#25D366', '#111827', '#F5B301'
)
ON DUPLICATE KEY UPDATE `phone` = VALUES(`phone`);

-- 7. Navigation Items
INSERT IGNORE INTO `navigation_items` (`id`, `label`, `href`, `target`, `is_visible`, `display_order`) VALUES
  (1, 'Home', '/', '_self', 1, 1),
  (2, 'About Us', '/about', '_self', 1, 2),
  (3, 'Services', '/services', '_self', 1, 3),
  (4, 'Projects', '/projects', '_self', 1, 4),
  (5, 'Our Gallery', '/gallery', '_self', 1, 5),
  (6, 'Contact Us', '/contact', '_self', 1, 6);

-- 8. Hero Slides
INSERT IGNORE INTO `hero_slides` (
  `id`, `eyebrow`, `heading`, `description`, `image_url`, `image_alt`,
  `primary_cta_label`, `primary_cta_link`, `secondary_cta_label`, `secondary_cta_link`,
  `show_whatsapp_cta`, `overlay_opacity`, `animation_preset`, `is_active`, `display_order`
) VALUES
  (
    1,
    'HALDWANI & UTTARAKHAND â€¢ ARCHITECTURAL CONSTRUCTION',
    'Building Your Vision. Creating Your Future.',
    'Delivering professional construction, engineering, architectural planning, and infrastructure solutions in Haldwani and across Uttarakhand.',
    '/images/hero-duplex.jpg',
    'Architectural concept of a modern luxury duplex residence under development in Haldwani foothills',
    'Explore Our Projects',
    '/projects',
    'Get a Free Consultation',
    '/contact',
    1, 0.58, 'zoom-reveal', 1, 1
  ),
  (
    2,
    'COMMERCIAL & INFRASTRUCTURE ENGINEERING',
    'Precision Structures Built for Generations.',
    'From modern commercial complexes and turnkey offices to industrial facilities, executed with seismic-conscious engineering and transparent cost control.',
    '/images/commercial-project.jpg',
    'Architectural illustration of modern commercial glass and concrete building construction',
    'View Construction Services',
    '/services',
    'Request a Quotation',
    '/contact#inquiry-form',
    1, 0.60, 'parallax-slide', 1, 2
  ),
  (
    3,
    'BESPOKE RESIDENCES & TURNKEY VILLAS',
    'Architectural Craftsmanship from Blueprint to Handover.',
    'Complete design-build execution for contemporary duplex homes, hillside villas, and signature interiors tailored to Nainital and Kumaon.',
    '/images/residential-duplex.jpg',
    'Architectural concept visualization of a luxury contemporary Indian duplex house in Uttarakhand',
    'Explore Design Concepts',
    '/gallery',
    'Book Site Inspection',
    '/contact',
    1, 0.56, 'zoom-reveal', 1, 3
  );

-- 9. System Pages
INSERT IGNORE INTO `pages` (`id`, `title`, `slug`, `page_type`, `hero_title`, `hero_subtitle`, `hero_image_url`, `content`, `status`, `is_indexable`, `display_order`) VALUES
  (1, 'Home', 'home', 'system', 'Building Your Vision. Creating Your Future.', 'Delivering professional construction, engineering, architectural planning, and infrastructure solutions in Haldwani and across Uttarakhand.', '/images/hero-duplex.jpg', NULL, 'published', 1, 1),
  (2, 'About Us', 'about', 'system', 'Building Excellence with Precision and Trust', 'Discover our engineering standards, leadership, and commitment to durable architecture across Haldwani and Uttarakhand.', '/images/construction-team.jpg', NULL, 'published', 1, 2),
  (3, 'Services', 'services', 'system', 'Comprehensive Construction & Engineering Services', 'End-to-end residential, commercial, industrial, architectural, and turnkey contracting solutions tailored to Uttarakhand.', '/images/commercial-project.jpg', NULL, 'published', 1, 3),
  (4, 'Projects', 'projects', 'system', 'Architectural Portfolio & Project Concepts', 'Explore residential duplexes, luxury hillside villas, commercial complexes, and infrastructure blueprints.', '/images/residential-duplex.jpg', NULL, 'published', 1, 4),
  (5, 'Our Gallery', 'gallery', 'system', 'Visual Gallery & Architectural Showcase', 'Curated architectural concepts, structural engineering scenes, interiors, and construction methodology visuals.', '/images/modern-villa.jpg', NULL, 'published', 1, 5),
  (6, 'Contact Us', 'contact', 'system', 'Start Your Construction Conversation', 'Connect directly with Sartaj Hussain in Haldwani for site consultations, architectural planning, and itemized quotations.', '/images/architectural-planning.jpg', NULL, 'published', 1, 6),
  (7, 'Privacy Policy', 'privacy-policy', 'legal', 'Privacy Policy', 'How we collect, protect, and use inquiry information submitted through our website.', '/images/architectural-planning.jpg', '<h2>1. Information We Collect</h2><p>When you submit a construction inquiry, consultation request, or quotation form on our website, we collect your name, phone number, email address, project location, estimated budget, and project details solely to respond to your request.</p><h2>2. How We Use Your Information</h2><p>Your contact details are used strictly to schedule site inspections, prepare project estimates, communicate regarding your construction requirements, and provide requested updates via phone, email, or WhatsApp.</p><h2>3. Data Protection & Retention</h2><p>We store inquiry records securely in our database with restricted administrative access. We never sell, rent, or trade your personal information to third-party marketers.</p><h2>4. Contact for Privacy Requests</h2><p>To update or delete your inquiry data, contact us at sartajkhan4284@gmail.com or call +91 9897300398 (Haldwani, Nainital, Uttarakhand - 263139).</p>', 'published', 1, 7),
  (8, 'Terms and Conditions', 'terms-and-conditions', 'legal', 'Terms and Conditions', 'Terms governing use of our website, architectural illustrations, and quotation requests.', '/images/architectural-planning.jpg', '<h2>1. General Information</h2><p>This website provides general information about construction, civil engineering, architectural planning, and contracting services offered in Haldwani and across Uttarakhand.</p><h2>2. Quotations & Project Scope</h2><p>All online inquiries and preliminary consultations are non-binding until a formal site inspection, architectural scope, bill of quantities (BOQ), and signed construction agreement are executed between both parties.</p><h2>3. Architectural Illustrations & Concept Visuals</h2><p>Certain visuals showcased on this website are architectural concepts and design illustrations intended to demonstrate structural capability and aesthetic direction. Final project designs depend on site conditions, local building bylaws, and approved structural drawings.</p><h2>4. Jurisdiction</h2><p>Any disputes arising in connection with website usage shall be subject to the jurisdiction of courts in Haldwani / Nainital, Uttarakhand, India.</p>', 'published', 1, 8);

-- 10. Home Page Builder Sections
INSERT IGNORE INTO `page_sections` (`id`, `page_id`, `section_key`, `section_type`, `heading`, `subheading`, `description`, `button_text`, `button_link`, `is_visible`, `status`, `display_order`) VALUES
  (1, 1, 'hero', 'hero', 'Building Your Vision. Creating Your Future.', 'Haldwani & Uttarakhand', 'Delivering professional construction, engineering, architectural planning, and infrastructure solutions in Haldwani and across Uttarakhand.', 'Explore Our Projects', '/projects', 1, 'published', 1),
  (2, 1, 'company_intro', 'text_image', 'Building Excellence with Precision and Trust', 'About Our Practice', 'From structural foundations to architectural handover, we combine modern civil engineering with honest local accountability.', 'Read More About Us', '/about', 1, 'published', 2),
  (3, 1, 'services', 'services_grid', 'Our Construction Services', 'What We Build', 'End-to-end residential, commercial, industrial, architectural, and turnkey construction capabilities.', 'View All Services', '/services', 1, 'published', 3),
  (4, 1, 'why_choose_us', 'why_choose_us', 'Why Choose Us', 'The Engineering Standard', 'Disciplined material quality, transparent estimates, and accountable site supervision at every milestone.', NULL, NULL, 1, 'published', 4),
  (5, 1, 'featured_projects', 'project_grid', 'Featured Projects & Architectural Concepts', 'Selected Works', 'Explore architectural design concepts and residential, commercial, and infrastructure capabilities across Uttarakhand.', 'View All Projects', '/projects', 1, 'published', 5),
  (6, 1, 'statistics', 'statistics', 'Measuring Trust in Every Structure', 'Key Milestones', 'Verified operational metrics configured by management.', NULL, NULL, 1, 'published', 6),
  (7, 1, 'process', 'process_timeline', 'Our Construction Process', 'Blueprint to Handover', 'A structured seven-stage execution workflow engineered for clarity, quality control, and timely completion.', NULL, NULL, 1, 'published', 7),
  (8, 1, 'gallery', 'gallery', 'Gallery Showcase', 'Visual Archive', 'Architectural visualizations, structural craft, and modern interiors.', 'View Full Gallery', '/gallery', 1, 'published', 8),
  (9, 1, 'testimonials', 'testimonials', 'Client Perspectives', 'Verified Feedback', 'Real stories from homeowners and commercial partners.', NULL, NULL, 1, 'published', 9),
  (10, 1, 'faq', 'faq', 'Frequently Asked Questions', 'Clarity Before You Build', 'Answers to common questions about house construction, turnkey contracts, and architectural planning in Haldwani.', NULL, NULL, 1, 'published', 10),
  (11, 1, 'consultation_cta', 'cta', 'Let''s Build Something Extraordinary Together.', 'Start Your Project', 'Schedule a free consultation or site inspection in Haldwani, Nainital, or anywhere in Uttarakhand.', 'Request a Quote', '/contact', 1, 'published', 11),
  (12, 1, 'contact_location', 'contact_form', 'Connect With Our Team in Haldwani', 'Contact & Location', 'Reach out for project estimates, architectural planning, or turnkey construction proposals.', NULL, NULL, 1, 'published', 12);

-- 11. Service Categories
INSERT IGNORE INTO `service_categories` (`id`, `name`, `slug`, `description`, `display_order`, `is_active`) VALUES
  (1, 'Building Construction', 'building-construction', 'Residential, commercial, industrial, and turnkey construction services.', 1, 1),
  (2, 'Design & Engineering', 'design-engineering', 'Architectural planning, structural engineering, and interior designing.', 2, 1),
  (3, 'Infrastructure & Contracting', 'infrastructure-contracting', 'Civil contracting, project management, infrastructure, and remodeling.', 3, 1);

-- 12. 12 Suggested Services
INSERT IGNORE INTO `services` (
  `id`, `category_id`, `title`, `slug`, `icon`, `short_description`, `detailed_content`,
  `featured_image`, `banner_image`, `benefits_json`, `work_process_json`, `faqs_json`,
  `is_featured`, `status`, `display_order`
) VALUES
  (1, 1, 'Residential Construction', 'residential-construction', 'Home',
    'Custom individual houses, modern duplexes, and hillside villas built with seismic-conscious RCC engineering in Haldwani and Uttarakhand.',
    '<p>Our residential construction practice transforms bare plots into refined, structurally resilient homes tailored for Uttarakhand''s climate and soil conditions. From soil testing and deep foundations to plumbing, electrical, waterproofing, and architectural elevation finishes, every detail is closely supervised.</p><h3>What Is Included</h3><ul><li>Complete RCC framed structural execution with branded steel and cement</li><li>Brick/AAC block masonry, plastering, and damp-proof treatment</li><li>Modern facade detailing, stone/wood cladding, and weather-resistant exterior coatings</li><li>Stage-wise quality inspections and transparent billing</li></ul>',
    '/images/residential-duplex.jpg', '/images/hero-duplex.jpg',
    '["Earthquake-conscious Zone IV structural practices","Transparent per-sq-ft or itemized BOQ costing","Dedicated site engineer supervision","End-to-end material procurement & quality verification"]',
    '["Plot survey & requirement brief","Architectural layout & structural design","Transparent budget & schedule sign-off","Foundation, superstructure & finishing execution"]',
    '[{"question":"Do you build custom duplex houses in Haldwani?","answer":"Yes, we design and construct custom duplex homes, independent residences, and villas across Haldwani, Kathgodam, and Nainital."},{"question":"Can I supply my own finishing materials?","answer":"Yes, we offer both material-inclusive turnkey packages and labor-plus-supervision contracting models."}]',
    1, 'published', 1),
  (2, 1, 'Commercial Construction', 'commercial-construction', 'Building2',
    'High-efficiency office buildings, retail showrooms, hospitality venues, and mixed-use commercial complexes engineered for long-term ROI.',
    '<p>We deliver modern commercial buildings designed for functional space utilization, strong structural spans, fire-safety readiness, and distinctive street presence. Ideal for retail complexes, clinics, offices, and hospitality properties across Haldwani and Kumaon.</p>',
    '/images/commercial-project.jpg', '/images/commercial-project.jpg',
    '["Column-free optimized commercial floor plates","Modern glass, ACP & stone facade execution","MEP coordination for HVAC, lifts, and power backup","Strict commercial timeline accountability"]',
    '["Commercial feasibility & bylaw review","Structural & MEP engineering drawings","Core shell & facade construction","Interior readiness & commissioning"]',
    '[{"question":"Do you handle multi-storey commercial complexes?","answer":"Yes, we undertake multi-storey retail, office, and hospitality buildings with full structural and MEP coordination."}]',
    1, 'published', 2),
  (3, 1, 'Industrial Construction', 'industrial-construction', 'Factory',
    'Pre-engineered warehouses, factory sheds, logistics hubs, and heavy-duty industrial flooring built to operational load specifications.',
    '<p>Industrial operations demand precision grade slabs, robust steel trusses, efficient drainage, and high-clearance loading infrastructure. We execute civil and structural industrial facilities across Sidcul, Haldwani, Rudrapur, and Pantnagar corridors.</p>',
    '/images/industrial-warehouse.jpg', '/images/industrial-warehouse.jpg',
    '["Heavy-load trimix & industrial concrete flooring","PEB steel erection & RCC foundation coordination","Optimized ventilation, daylighting, and loading bays","Compliant utility and drainage civil works"]',
    '["Load requirement & site grading assessment","Foundation & PEB anchor design","Steel erection & roof cladding","Flooring, utilities & safety handover"]',
    '[]',
    1, 'published', 3),
  (4, 2, 'Architectural Planning', 'architectural-planning', 'Compass',
    'Functional 2D floor plans, 3D exterior elevations, Vastu-aligned layouts, and bylaw-compliant architectural drawings.',
    '<p>Great buildings begin on paper. Our architectural planning service balances natural light, ventilation, Kumaon hillside views, and efficient plot utilization to produce build-ready floor plans and photorealistic 3D elevations.</p>',
    '/images/architectural-planning.jpg', '/images/architectural-planning.jpg',
    '["Plot-optimized 2D floor plans & working drawings","Photorealistic 3D architectural exterior concepts","Natural light, cross-ventilation & Vastu harmony","Clear sanction-ready documentation"]',
    '["Site measurement & lifestyle discovery","Concept zoning & 2D plan iterations","3D architectural elevation visualization","Complete working drawings for site execution"]',
    '[]',
    1, 'published', 4),
  (5, 2, 'Civil Engineering', 'civil-engineering', 'HardHat',
    'Comprehensive site grading, retaining walls, drainage systems, reinforced concrete works, and technical civil execution.',
    '<p>Uttarakhand''s foothill and mountain topography requires specialized civil engineeringâ€”especially for retaining walls, stormwater management, foundation bearing capacity, and reinforced concrete structures.</p>',
    '/images/infrastructure-foundation.jpg', '/images/infrastructure-foundation.jpg',
    '["Terrain-specific retaining & foundation engineering","Precision formwork, rebar detailing & concrete curing","Site drainage and waterproofing engineering","Technical site supervision & testing discipline"]',
    '["Geotechnical & topographic evaluation","Civil working drawings & bar bending schedules","Supervised structural execution","Load-bearing & finishing quality sign-off"]',
    '[]',
    1, 'published', 5),
  (6, 2, 'Interior Designing', 'interior-designing', 'Sofa',
    'Bespoke residential and commercial interiors featuring modular kitchens, architectural lighting, custom joinery, and stone finishes.',
    '<p>We align interior architecture seamlessly with structural workâ€”delivering cohesive false ceilings, concealed lighting, Italian/granite flooring, bespoke wardrobes, and commercial reception environments.</p>',
    '/images/luxury-interior.jpg', '/images/luxury-interior.jpg',
    '["Space-planned 3D interior concepts","Custom carpentry, modular kitchens & wardrobes","Architectural cove & ambient lighting integration","Turnkey material sourcing & finishing execution"]',
    '["Style brief & material palette curation","3D interior renders & BOQ","Electrical, ceiling & surface preparation","Joinery installation & final styling"]',
    '[]',
    1, 'published', 6),
  (7, 3, 'Renovation and Remodeling', 'renovation-remodeling', 'Hammer',
    'Structural retrofitting, facade modernization, floor additions, and complete interior remodeling for existing buildings.',
    '<p>Transform aging homes or commercial properties into contemporary spaces without starting from scratch. We evaluate existing structural capacity before executing facade upgrades, layout reconfigurations, and modern waterproofing.</p>',
    '/images/renovation-remodeling.jpg', '/images/renovation-remodeling.jpg',
    '["Structural safety audit before modification","Modern facade and elevation makeovers","Kitchen, bathroom & flooring complete overhauls","Clean, phased site management"]',
    '["Existing structure assessment","Remodeling concept & cost estimate","Controlled demolition & structural upgrade","Modern finishing & handover"]',
    '[]',
    0, 'published', 7),
  (8, 1, 'Turnkey Construction', 'turnkey-construction', 'KeyRound',
    'Single-point accountability from architectural concept and material procurement to construction execution and ready-to-move handover.',
    '<p>Ideal for busy homeowners, NRIs, and business owners who want a stress-free building experience. Under one transparent contract, we manage design, approvals support, labor, certified materials, supervision, and final finishing.</p>',
    '/images/modern-villa.jpg', '/images/modern-villa.jpg',
    '["Single-point founder accountability","Fixed-specification material transparency","Regular photo & milestone progress updates","Ready-to-occupy handover with quality checklist"]',
    '["Concept, specification & turnkey contract","Design & site mobilization","Full civil, MEP & finishing execution","Snag inspection & key handover"]',
    '[{"question":"Can you manage turnkey construction if I live outside Haldwani?","answer":"Yes, we provide structured milestone reporting, documented material bills, and video updates for outstation and NRI clients building in Haldwani and Nainital."}]',
    1, 'published', 8),
  (9, 3, 'Building Contractor Services', 'building-contractor-services', 'Wrench',
    'Reliable civil and building contracting with skilled masonry, bar-bending, shuttering, plastering, and finishing teams.',
    '<p>Already have architectural drawings from your architect? Our disciplined building contracting teams execute your blueprints faithfully with rigorous adherence to tolerances, schedules, and site cleanliness.</p>',
    '/images/construction-team.jpg', '/images/construction-team.jpg',
    '["Experienced skilled & semi-skilled workforce","Strict execution per architect drawings","Transparent labor or with-material contracts","Active daily site supervision"]',
    '["Drawing review & site visit","Rate schedule & contract finalization","Mobilization & milestone execution","Final measurement & handover"]',
    '[]',
    0, 'published', 9),
  (10, 3, 'Infrastructure Development', 'infrastructure-development', 'Landmark',
    'Boundary walls, internal paved roads, stormwater drains, institutional campuses, and plotted township civil infrastructure.',
    '<p>We execute durable site infrastructure for residential colonies, educational campuses, and commercial developmentsâ€”including RCC roads, culverts, retaining walls, overhead tanks, and perimeter security walls.</p>',
    '/images/infrastructure-foundation.jpg', '/images/infrastructure-foundation.jpg',
    '["Durable RCC & paver road construction","Retaining walls & stormwater drainage networks","Campus boundary, gates & utility civil works","Scalable machinery & engineering logistics"]',
    '["Topographic survey & civil layout","Earthwork & sub-base preparation","Structural concrete & utility installation","Quality testing & commissioning"]',
    '[]',
    0, 'published', 10),
  (11, 3, 'Project Management', 'project-management', 'ClipboardCheck',
    'End-to-end construction scheduling, vendor coordination, BOQ cost audits, and site quality assurance consultancy.',
    '<p>Protect your construction investment with disciplined project management. We coordinate contractors, verify bill measurements, enforce construction timelines, and monitor concrete and finishing standards.</p>',
    '/images/architectural-planning.jpg', '/images/architectural-planning.jpg',
    '["Master schedule & critical path tracking","Vendor evaluation & billing verification","Independent quality & safety audits","Cost-overrun prevention reporting"]',
    '["Scope & budget baseline setup","Contractor onboarding & scheduling","Weekly site audits & cost reviews","Closeout documentation"]',
    '[]',
    0, 'published', 11),
  (12, 2, 'Structural Design', 'structural-design', 'Layers',
    'Safe, economical RCC and steel structural analysis, foundation detailing, and seismic-resistant drawings for Uttarakhand.',
    '<p>Engineered for safety and material efficiency. We develop balanced column-beam layouts, foundation designs, slab reinforcement schedules, and steel detailing compliant with Indian Standard (IS) seismic codes.</p>',
    '/images/infrastructure-foundation.jpg', '/images/infrastructure-foundation.jpg',
    '["IS-code seismic structural engineering","Optimized steel & concrete consumption","Clear bar bending schedules for site teams","Foundation engineering for foothill & hill soils"]',
    '["Architectural & soil input review","3D structural load modeling","Foundation & framing working drawings","Site reinforcement inspection"]',
    '[]',
    0, 'published', 12);

-- 13. Project Categories
INSERT IGNORE INTO `project_categories` (`id`, `name`, `slug`, `description`, `display_order`, `is_active`) VALUES
  (1, 'Residential', 'residential', 'Custom independent residences and family homes.', 1, 1),
  (2, 'Commercial', 'commercial', 'Offices, retail complexes, and commercial spaces.', 2, 1),
  (3, 'Industrial', 'industrial', 'Warehouses, industrial sheds, and logistics civil works.', 3, 1),
  (4, 'Duplex Houses', 'duplex-houses', 'Modern luxury multi-level duplex homes.', 4, 1),
  (5, 'Villas', 'villas', 'Contemporary hillside and foothill luxury villas.', 5, 1),
  (6, 'Infrastructure', 'infrastructure', 'Civil foundations, retaining works, and campus infrastructure.', 6, 1),
  (7, 'Renovation', 'renovation', 'Architectural facade makeovers and full home remodeling.', 7, 1);

-- 14. Architectural Project Concepts (Clearly marked is_concept = 1 until client uploads actual completed site photos)
INSERT IGNORE INTO `projects` (
  `id`, `category_id`, `title`, `slug`, `location`, `project_status`, `is_concept`,
  `duration`, `construction_area`, `short_description`, `full_description`, `specifications_json`,
  `featured_image`, `is_featured`, `status`, `display_order`
) VALUES
  (1, 4, 'Modern Foothill Duplex Residence â€” Concept', 'modern-duplex-house-haldwani', 'Haldwani, Uttarakhand', 'ongoing', 1,
    '10 - 12 Months (Typical)', '2,800 sq. ft.',
    'Architectural concept for a contemporary 4BHK duplex residence combining exposed concrete geometry, warm timber soffits, and seismic-conscious RCC framing.',
    '<p><em>Note: Architectural concept illustration showcasing our residential duplex design and turnkey build capability in Haldwani.</em></p><p>Designed for urban plots in Haldwani and Kathgodam, this duplex layout maximizes natural cross-ventilation, shaded parking, double-height living volume, and low-maintenance stone-and-plaster facade detailing.</p>',
    '{"Structure":"Seismic Zone IV RCC Framed Structure","Levels":"Ground + First Floor + Terrace Lounge","Facade":"Natural Stone, Weather-Shield Plaster & Timber Cladding","Execution Mode":"Turnkey Design & Build"}',
    '/images/residential-duplex.jpg', 1, 'published', 1),
  (2, 2, 'Contemporary Commercial Business Center â€” Concept', 'commercial-office-complex-haldwani', 'Haldwani, Nainital', 'upcoming', 1,
    '14 - 18 Months (Typical)', '12,500 sq. ft.',
    'Architectural concept for a modern glass-and-concrete commercial complex tailored for retail showrooms, corporate offices, and medical suites.',
    '<p><em>Note: Architectural concept visualization representing our commercial engineering and construction standards.</em></p><p>Features wide column grids for flexible commercial interiors, energy-efficient curtain glazing, basement/stilt parking provision, and dedicated service cores.</p>',
    '{"Structure":"High-Span RCC Commercial Frame","Facade":"Double-Glazed Glass & Architectural Concrete","MEP":"Provision for Elevator, Fire Hydrant & DG Backup","Execution Mode":"Core & Shell / Turnkey"}',
    '/images/commercial-project.jpg', 1, 'published', 2),
  (3, 5, 'Kumaon Hillside Luxury Villa â€” Concept', 'kumaon-hillside-luxury-villa', 'Bhimtal / Nainital Region, Uttarakhand', 'upcoming', 1,
    '12 - 15 Months (Typical)', '3,600 sq. ft.',
    'Cantilevered hill-view villa concept with panoramic glazing, stone retaining engineering, and warm teak architectural ceilings.',
    '<p><em>Note: Architectural concept visualization tailored for Nainital and Bhimtal sloped terrain.</em></p><p>Engineered with stepped retaining walls, damp-proof perimeter drainage, insulated glazing, and expansive viewing decks facing the Himalayan foothills.</p>',
    '{"Terrain":"Sloped Hill / Foothill Engineering","Foundation":"Stepped RCC with Retaining Walls","Finishes":"Natural Hill Stone, Teak Soffits & Toughened Glass","Execution Mode":"Turnkey Luxury Build"}',
    '/images/modern-villa.jpg', 1, 'published', 3),
  (4, 3, 'Pre-Engineered Industrial Warehouse â€” Concept', 'industrial-warehouse-facility-uttarakhand', 'Haldwani - Rudrapur Corridor, Uttarakhand', 'upcoming', 1,
    '8 - 10 Months (Typical)', '18,000 sq. ft.',
    'High-clearance industrial logistics warehouse concept with heavy-duty trimix concrete flooring and precision steel superstructure.',
    '<p><em>Note: Architectural illustration demonstrating industrial civil and PEB coordination capability.</em></p><p>Built for manufacturing, cold storage, or distribution operations requiring wide dock access, high floor load capacity, and ventilated insulated roofing.</p>',
    '{"Superstructure":"PEB Steel Portal Frame on RCC Pedestals","Flooring":"Laser-Screeded Heavy-Duty Industrial Slab","Clear Height":"9.5 Meters Eave Height","Utilities":"Stormwater Drainage & Heavy Vehicle Apron"}',
    '/images/industrial-warehouse.jpg', 1, 'published', 4),
  (5, 7, 'Contemporary Residence Facade Remodeling â€” Concept', 'contemporary-home-renovation-haldwani', 'Haldwani, Uttarakhand', 'ongoing', 1,
    '3 - 5 Months (Typical)', '2,200 sq. ft.',
    'Architectural remodeling concept upgrading an existing residence with charcoal mineral textures, timber louvers, and modern balcony glazing.',
    '<p><em>Note: Architectural renovation illustration demonstrating facade modernization and structural retrofitting capabilities.</em></p><p>Focuses on exterior waterproofing, contemporary elevation proportions, interior layout opening, and upgraded plumbing and electrical systems.</p>',
    '{"Scope":"Elevation Makeover & Full Interior Refit","Waterproofing":"Multi-Coat Elastomeric Roof & Wall Treatment","Glazing":"UPVC / Aluminum Thermal Windows","Execution Mode":"Turnkey Renovation"}',
    '/images/renovation-remodeling.jpg', 1, 'published', 5),
  (6, 6, 'Heavy RCC Foundation & Site Infrastructure â€” Concept', 'rcc-foundation-infrastructure-uttarakhand', 'Nainital District, Uttarakhand', 'ongoing', 1,
    '6 - 12 Months (Typical)', 'Custom Site Scale',
    'Civil engineering showcase illustrating deep reinforced concrete foundations, precision rebar cages, and disciplined site execution.',
    '<p><em>Note: Architectural civil engineering visualization illustrating our structural foundation and site infrastructure standards.</em></p><p>Covers bulk earthwork, bar-bending accuracy, concrete batch quality control, retaining systems, and campus road infrastructure.</p>',
    '{"Standard":"IS 456 & IS 13920 Ductile Detailing","Concrete":"Design-Mix Reinforced Concrete","Quality Control":"Cube Testing & Curing Protocols","Scope":"Foundations, Retaining & Site Civil Works"}',
    '/images/infrastructure-foundation.jpg', 1, 'published', 6);

-- 15. Gallery Categories & Showcase Images
INSERT IGNORE INTO `gallery_categories` (`id`, `name`, `slug`, `description`, `display_order`, `is_active`) VALUES
  (1, 'Residential', 'residential', 'Duplex homes, villas, and residential facades.', 1, 1),
  (2, 'Commercial', 'commercial', 'Office buildings and commercial architecture.', 2, 1),
  (3, 'Interiors', 'interiors', 'Modern luxury residential and commercial interiors.', 3, 1),
  (4, 'Engineering & Site', 'engineering-site', 'Civil foundations, blueprints, and engineering teams.', 4, 1);

INSERT IGNORE INTO `gallery_images` (`id`, `category_id`, `project_id`, `title`, `caption`, `alt_text`, `media_type`, `media_url`, `thumbnail_url`, `is_concept`, `is_featured`, `status`, `display_order`) VALUES
  (1, 1, 1, 'Foothill Duplex Under Development', 'Architectural concept â€” luxury duplex construction in Haldwani foothills', 'Modern luxury duplex building under development at golden hour in Haldwani', 'image', '/images/hero-duplex.jpg', '/images/hero-duplex.jpg', 1, 1, 'published', 1),
  (2, 1, 1, 'Contemporary Duplex Exterior', 'Architectural illustration â€” stone and timber facade duplex home', 'Completed contemporary Indian duplex residence exterior in Uttarakhand', 'image', '/images/residential-duplex.jpg', '/images/residential-duplex.jpg', 1, 1, 'published', 2),
  (3, 2, 2, 'Commercial Glass & Concrete Tower', 'Architectural concept â€” commercial office building structural execution', 'Modern commercial office building construction with glass and concrete facade', 'image', '/images/commercial-project.jpg', '/images/commercial-project.jpg', 1, 1, 'published', 3),
  (4, 1, 3, 'Kumaon Hillside Villa', 'Architectural concept â€” cantilevered luxury villa overlooking Himalayan pines', 'Modern luxury hillside villa in Nainital Uttarakhand at twilight', 'image', '/images/modern-villa.jpg', '/images/modern-villa.jpg', 1, 1, 'published', 4),
  (5, 3, NULL, 'Double-Height Luxury Living Room', 'Architectural interior illustration â€” travertine stone and walnut paneling', 'Contemporary luxury Indian living room interior with marble floors and cove lighting', 'image', '/images/luxury-interior.jpg', '/images/luxury-interior.jpg', 1, 1, 'published', 5),
  (6, 4, NULL, 'Site Engineering & Blueprint Review', 'Editorial visual â€” civil engineers reviewing structural plans on site', 'Civil engineers in safety helmets reviewing blueprints at construction site', 'image', '/images/construction-team.jpg', '/images/construction-team.jpg', 1, 1, 'published', 6),
  (7, 4, 6, 'Reinforced Concrete Foundation', 'Engineering visual â€” precision rebar formwork and crane operations', 'Reinforced concrete foundation rebar grid at modern construction site', 'image', '/images/infrastructure-foundation.jpg', '/images/infrastructure-foundation.jpg', 1, 1, 'published', 7),
  (8, 2, 4, 'Industrial Warehouse & PEB Facility', 'Architectural concept â€” structural steel warehouse and logistics bay', 'Modern pre-engineered industrial warehouse in India', 'image', '/images/industrial-warehouse.jpg', '/images/industrial-warehouse.jpg', 1, 1, 'published', 8),
  (9, 1, 5, 'Modern Facade Renovation', 'Architectural concept â€” charcoal plaster and timber louver remodeling', 'Contemporary renovated home exterior with timber louvers', 'image', '/images/renovation-remodeling.jpg', '/images/renovation-remodeling.jpg', 1, 0, 'published', 9),
  (10, 4, NULL, 'Architectural Planning & Drafting', 'Studio visual â€” elevation blueprints and architectural scale model', 'Architectural blueprints, brass scale, and building model on studio table', 'image', '/images/architectural-planning.jpg', '/images/architectural-planning.jpg', 1, 0, 'published', 10);

-- 16. Media Library Pre-registration for generated local assets
INSERT IGNORE INTO `media_library` (`id`, `filename`, `original_name`, `url`, `mime_type`, `file_size`, `title`, `alt_text`, `caption`, `folder`) VALUES
  (1, 'hero-duplex.jpg', 'hero-duplex.jpg', '/images/hero-duplex.jpg', 'image/jpeg', 0, 'Hero Duplex Construction Concept', 'Luxury duplex residential building under development in Haldwani', 'Architectural concept visual', 'hero'),
  (2, 'commercial-project.jpg', 'commercial-project.jpg', '/images/commercial-project.jpg', 'image/jpeg', 0, 'Commercial Office Construction Concept', 'Modern commercial office building construction in India', 'Architectural concept visual', 'projects'),
  (3, 'construction-team.jpg', 'construction-team.jpg', '/images/construction-team.jpg', 'image/jpeg', 0, 'Civil Engineering Team', 'Civil engineers reviewing blueprints with safety equipment', 'Editorial engineering visual', 'about'),
  (4, 'residential-duplex.jpg', 'residential-duplex.jpg', '/images/residential-duplex.jpg', 'image/jpeg', 0, 'Residential Duplex Concept', 'Luxury contemporary Indian duplex house facade', 'Architectural concept visual', 'projects'),
  (5, 'modern-villa.jpg', 'modern-villa.jpg', '/images/modern-villa.jpg', 'image/jpeg', 0, 'Hillside Villa Concept', 'Modern luxury residential villa in Uttarakhand hills', 'Architectural concept visual', 'projects'),
  (6, 'industrial-warehouse.jpg', 'industrial-warehouse.jpg', '/images/industrial-warehouse.jpg', 'image/jpeg', 0, 'Industrial Warehouse Concept', 'Pre-engineered structural steel warehouse facility', 'Architectural concept visual', 'projects'),
  (7, 'architectural-planning.jpg', 'architectural-planning.jpg', '/images/architectural-planning.jpg', 'image/jpeg', 0, 'Architectural Blueprints Studio', 'Architects drafting blueprints and building scale model', 'Architectural studio visual', 'services'),
  (8, 'luxury-interior.jpg', 'luxury-interior.jpg', '/images/luxury-interior.jpg', 'image/jpeg', 0, 'Luxury Residence Interior', 'Modern Indian living room with marble and wood paneling', 'Interior architectural concept', 'gallery'),
  (9, 'renovation-remodeling.jpg', 'renovation-remodeling.jpg', '/images/renovation-remodeling.jpg', 'image/jpeg', 0, 'Facade Renovation Concept', 'Modern remodeled building facade with timber louvers', 'Renovation architectural concept', 'services'),
  (10, 'infrastructure-foundation.jpg', 'infrastructure-foundation.jpg', '/images/infrastructure-foundation.jpg', 'image/jpeg', 0, 'RCC Foundation & Rebar Engineering', 'Reinforced concrete foundation steel work at construction site', 'Civil engineering visual', 'services');

-- 17. Leadership Team (Founder only â€” no fabricated staff)
INSERT IGNORE INTO `team_members` (`id`, `name`, `designation`, `bio`, `photo_url`, `email`, `phone`, `is_leadership`, `status`, `display_order`) VALUES
  (1, 'Sartaj Hussain', 'Founder & Managing Director', 'Directing construction execution, client consultations, material quality control, and project delivery across Haldwani, Nainital, and Uttarakhand.', '/images/construction-team.jpg', 'sartajkhan4284@gmail.com', '+91 9897300398', 1, 'published', 1);

-- 18. Statistics (HIDDEN by default with value 0 until admin enters verified real numbers!)
INSERT IGNORE INTO `statistics` (`id`, `stat_key`, `label`, `value`, `suffix`, `icon`, `is_visible`, `display_order`) VALUES
  (1, 'completed_projects', 'Completed Projects', 0, '+', 'Building2', 0, 1),
  (2, 'years_experience', 'Years of Experience', 0, '+', 'CalendarCheck', 0, 2),
  (3, 'happy_clients', 'Happy Clients', 0, '+', 'Users', 0, 3),
  (4, 'ongoing_projects', 'Ongoing Projects', 0, '+', 'HardHat', 0, 4),
  (5, 'team_members', 'Professional Team Members', 0, '+', 'Award', 0, 5);

-- 19. 7-Stage Construction Process
INSERT IGNORE INTO `process_steps` (`id`, `step_number`, `title`, `description`, `icon`, `is_active`, `display_order`) VALUES
  (1, '01', 'Client Consultation', 'Understanding your plot requirements, architectural taste, functional goals, and target budget in detail.', 'MessageSquare', 1, 1),
  (2, '02', 'Site Inspection', 'Physical visit to your site in Haldwani or Uttarakhand to evaluate soil conditions, levels, access, and local bylaws.', 'MapPin', 1, 2),
  (3, '03', 'Planning and Designing', 'Developing practical 2D floor plans, structural engineering layouts, and 3D exterior elevations for approval.', 'Compass', 1, 3),
  (4, '04', 'Budget Estimation', 'Preparing a transparent, itemized Bill of Quantities (BOQ) and stage-wise construction timeline with clear material specs.', 'Calculator', 1, 4),
  (5, '05', 'Construction Execution', 'Mobilizing skilled engineers, shuttering, reinforcement, masonry, MEP, and finishing teams under active supervision.', 'HardHat', 1, 5),
  (6, '06', 'Quality Inspection', 'Multi-stage checks for structural steel, concrete curing, alignment, waterproofing, and finishing craftsmanship.', 'ShieldCheck', 1, 6),
  (7, '07', 'Final Project Handover', 'Comprehensive walkthrough, snag clearance, and timely handover of your ready-to-occupy structure.', 'KeyRound', 1, 7);

-- 20. Suggested FAQs
INSERT IGNORE INTO `faqs` (`id`, `category`, `question`, `answer`, `status`, `display_order`) VALUES
  (1, 'general', 'What construction services do you provide?', 'We provide comprehensive residential construction, commercial construction, industrial civil works, architectural planning, structural design, interior designing, renovation and remodeling, turnkey construction, building contracting, infrastructure development, and project management.', 'published', 1),
  (2, 'residential', 'Do you provide residential construction in Haldwani?', 'Yes, we are headquartered in Haldwani (Nainital, Uttarakhand - 263139) and construct independent houses, modern duplex homes, and custom residences across Haldwani, Kathgodam, and surrounding localities.', 'published', 2),
  (3, 'pricing', 'How can I request a construction quotation?', 'You can submit your plot size, location, and requirements through our Contact page inquiry form, call us directly at +91 9897300398, or start a WhatsApp inquiry. After a site inspection and scope review, we provide a transparent itemized quotation.', 'published', 3),
  (4, 'design', 'Do you provide architectural planning?', 'Yes, we offer complete architectural planning including 2D floor plans, Vastu-aligned layouts, 3D elevation designs, and structural working drawings tailored to your plot and local bylaws.', 'published', 4),
  (5, 'turnkey', 'Can you manage complete turnkey projects?', 'Yes. Our turnkey construction service handles everything under one transparent agreementâ€”planning, material sourcing, skilled labor, engineering supervision, interiors, and final key handover.', 'published', 5),
  (6, 'locations', 'Which locations do you serve?', 'We primarily serve Haldwani, Kathgodam, Nainital, Bhimtal, Rudrapur, Pantnagar, Kaladhungi, Ramnagar, and major residential and commercial corridors across Uttarakhand.', 'published', 6);

-- 21. Footer Sections & Links
INSERT IGNORE INTO `footer_sections` (`id`, `title`, `section_key`, `description`, `is_visible`, `display_order`) VALUES
  (1, 'Quick Links', 'quick_links', 'Primary website navigation', 1, 1),
  (2, 'Our Services', 'services_links', 'Core construction services', 1, 2),
  (3, 'Legal & Info', 'legal_links', 'Policies and client information', 1, 3);

INSERT IGNORE INTO `footer_links` (`id`, `footer_section_id`, `label`, `href`, `target`, `is_visible`, `display_order`) VALUES
  (1, 1, 'Home', '/', '_self', 1, 1),
  (2, 1, 'About Us', '/about', '_self', 1, 2),
  (3, 1, 'Services', '/services', '_self', 1, 3),
  (4, 1, 'Projects', '/projects', '_self', 1, 4),
  (5, 1, 'Our Gallery', '/gallery', '_self', 1, 5),
  (6, 1, 'Contact Us', '/contact', '_self', 1, 6),
  (7, 2, 'Residential Construction', '/services/residential-construction', '_self', 1, 1),
  (8, 2, 'Commercial Construction', '/services/commercial-construction', '_self', 1, 2),
  (9, 2, 'Architectural Planning', '/services/architectural-planning', '_self', 1, 3),
  (10, 2, 'Turnkey Construction', '/services/turnkey-construction', '_self', 1, 4),
  (11, 2, 'Interior Designing', '/services/interior-designing', '_self', 1, 5),
  (12, 2, 'Renovation & Remodeling', '/services/renovation-remodeling', '_self', 1, 6),
  (13, 3, 'Privacy Policy', '/privacy-policy', '_self', 1, 1),
  (14, 3, 'Terms & Conditions', '/terms-and-conditions', '_self', 1, 2),
  (15, 3, 'Request a Quotation', '/contact#inquiry-form', '_self', 1, 3);

-- 22. SEO Metadata (Natural Local SEO for Haldwani & Uttarakhand)
INSERT IGNORE INTO `seo_metadata` (`entity_type`, `entity_slug`, `meta_title`, `meta_description`, `focus_keyword`, `og_title`, `og_description`, `og_image`, `robots_index`, `robots_follow`) VALUES
  ('global', 'default', 'Sartaj Construction | Construction Company in Haldwani, Uttarakhand', 'Trusted construction company and building contractor in Haldwani, Nainital, Uttarakhand for residential duplex houses, commercial buildings, architectural planning, and turnkey construction.', 'Construction Company in Haldwani', 'Sartaj Construction | Haldwani, Uttarakhand', 'Residential, commercial, architectural planning, and turnkey construction services in Haldwani and across Uttarakhand.', '/images/hero-duplex.jpg', 1, 1),
  ('page', 'home', 'Sartaj Construction | Construction Company in Haldwani, Uttarakhand', 'Professional house construction, duplex residences, commercial buildings, civil contracting, and architectural planning in Haldwani, Nainital, Uttarakhand. Call +91 9897300398.', 'Construction Company in Haldwani', 'Sartaj Construction â€” Building Your Vision in Haldwani', 'Delivering residential, commercial, architectural, and turnkey construction solutions across Haldwani and Uttarakhand.', '/images/hero-duplex.jpg', 1, 1),
  ('page', 'about', 'About Us | Building Contractor in Haldwani, Nainital', 'Learn about Sartaj Construction led by Sartaj Hussain in Haldwani, Uttarakhand â€” our civil engineering expertise, quality assurance, safety standards, and transparent contracting.', 'Building Contractor in Haldwani', 'About Sartaj Construction | Haldwani, Uttarakhand', 'Engineering precision, transparent costing, and disciplined project execution across Uttarakhand.', '/images/construction-team.jpg', 1, 1),
  ('page', 'services', 'Construction Services in Haldwani & Uttarakhand', 'Explore residential construction, commercial complexes, industrial warehouses, architectural planning, structural design, interior design, and turnkey building services in Haldwani.', 'Construction Services in Uttarakhand', 'Construction & Engineering Services | Sartaj Construction', 'End-to-end civil engineering, architectural planning, and turnkey construction services.', '/images/commercial-project.jpg', 1, 1),
  ('page', 'projects', 'Projects & Architectural Concepts | House Construction in Haldwani', 'Browse residential duplexes, hillside villas, commercial buildings, renovation concepts, and infrastructure engineering showcases across Haldwani and Nainital.', 'House Construction in Haldwani', 'Architectural Portfolio & Concepts | Sartaj Construction', 'Explore residential, commercial, and infrastructure construction concepts in Uttarakhand.', '/images/residential-duplex.jpg', 1, 1),
  ('page', 'gallery', 'Our Gallery | Duplex & Commercial Construction Showcase', 'View architectural visualizations, residential exteriors, modern interiors, and civil engineering photography from Haldwani, Uttarakhand.', 'Duplex House Construction in Haldwani', 'Architectural & Construction Gallery | Sartaj Construction', 'Curated visuals of modern residences, commercial complexes, and engineering works.', '/images/modern-villa.jpg', 1, 1),
  ('page', 'contact', 'Contact Us | Civil Contractor in Haldwani (+91 9897300398)', 'Contact Sartaj Hussain in Haldwani, Nainital, Uttarakhand - 263139 for house construction estimates, site inspections, and turnkey project consultations.', 'Civil Contractor in Haldwani', 'Contact Sartaj Construction | Haldwani, Uttarakhand', 'Request a free construction consultation or WhatsApp +91 9897300398.', '/images/architectural-planning.jpg', 1, 1),
  ('page', 'privacy-policy', 'Privacy Policy | Sartaj Construction', 'Privacy policy detailing how inquiry data is collected and protected.', 'Privacy Policy', 'Privacy Policy', 'How we protect client inquiry information.', '/images/architectural-planning.jpg', 1, 1),
  ('page', 'terms-and-conditions', 'Terms and Conditions | Sartaj Construction', 'Terms and conditions for website usage, architectural concepts, and construction quotation requests.', 'Terms and Conditions', 'Terms and Conditions', 'Terms governing website use and construction inquiries.', '/images/architectural-planning.jpg', 1, 1);

