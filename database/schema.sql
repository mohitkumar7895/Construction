-- ============================================================================
-- Sartaj Construction Platform - Complete MySQL / MariaDB Schema
-- Database: construction
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `construction`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `construction`;

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
