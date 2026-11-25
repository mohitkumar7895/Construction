import { describe, expect, it } from 'vitest';
import { buildTelUrl, buildWhatsAppUrl, isValidHexColor, slugify } from '@/lib/utils';
import { sanitizeRichHtml } from '@/lib/sanitize';
import { detectFileSignature, sanitizeUploadBaseName } from '@/lib/media';
import { publicContactSchema, themeSchema, animationSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rate-limit';
import { getDbConnectionConfig, diagnoseDbError } from '@/lib/db';

describe('Core Utilities & Security Helpers', () => {
  it('builds clean WhatsApp and tel links for Haldwani client contact', () => {
    expect(buildWhatsAppUrl('+91 9897300398', 'Hello')).toBe(
      'https://wa.me/919897300398?text=Hello'
    );
    expect(buildTelUrl('+91 9897300398')).toBe('tel:+919897300398');
  });

  it('slugifies titles accurately', () => {
    expect(slugify('Modern Duplex House — Haldwani!')).toBe('modern-duplex-house-haldwani');
    expect(isValidHexColor('#F5B301')).toBe(true);
    expect(isValidHexColor('javascript:alert(1)')).toBe(false);
  });

  it('strips XSS scripts, event handlers, and dangerous URLs from rich HTML', () => {
    const dirty =
      '<h2>Project</h2><script>alert("xss")</script><img src=x onerror=alert(1)><a href="javascript:evil()">Click</a><p>Safe text</p>';
    const clean = sanitizeRichHtml(dirty);
    expect(clean).not.toContain('<script');
    expect(clean).not.toContain('onerror');
    expect(clean).not.toContain('javascript:');
    expect(clean).toContain('<h2>Project</h2>');
    expect(clean).toContain('<p>Safe text</p>');
  });

  it('validates file magic signatures and blocks executable uploads', () => {
    const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    const phpPayload = Buffer.from('<?php system($_GET["cmd"]); ?>');
    expect(detectFileSignature(jpegHeader)).toBe('image/jpeg');
    expect(detectFileSignature(pngHeader)).toBe('image/png');
    expect(detectFileSignature(phpPayload)).toBeNull();
    expect(sanitizeUploadBaseName('../../evil script.php.jpg')).toBe('evil-script-php');
  });

  it('validates public contact form, honeypot spam guard, theme, and animation schemas', () => {
    const validContact = publicContactSchema.safeParse({
      full_name: 'Rohan Joshi',
      phone: '+91 9897300398',
      email: 'rohan@example.com',
      message: 'Need quotation for 2400 sq ft duplex house in Haldwani.',
      privacy_consent: true,
      website_hp: '',
    });
    expect(validContact.success).toBe(true);

    const spamContact = publicContactSchema.safeParse({
      full_name: 'Bot',
      phone: '+91 9897300398',
      message: 'Spam message here',
      privacy_consent: true,
      website_hp: 'http://spam.example',
    });
    expect(spamContact.success).toBe(false);

    expect(
      themeSchema.safeParse({
        primary_color: '#111827',
        secondary_color: '#F5B301',
        dark_bg_color: '#0B0F14',
        light_bg_color: '#F8F9FB',
        surface_color: '#FFFFFF',
        muted_text_color: '#64748B',
        heading_font: 'Space Grotesk',
        body_font: 'Inter',
      }).success
    ).toBe(true);

    expect(
      animationSchema.safeParse({
        animations_enabled: 1,
        smooth_scroll_enabled: 1,
        parallax_enabled: 1,
        hero_animations_enabled: 1,
        project_animations_enabled: 1,
        hover_effects_enabled: 1,
        mobile_animations_enabled: 0,
        animation_style: 'cinematic',
        duration_multiplier: 1.0,
        intensity: 'medium',
      }).success
    ).toBe(true);
  });

  it('enforces sliding-window rate limits', () => {
    const key = `test-rate-${Date.now()}`;
    expect(checkRateLimit(key, 2, 60000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60000).allowed).toBe(true);
    expect(checkRateLimit(key, 2, 60000).allowed).toBe(false);
  });

  it('parses DATABASE_URL with automatic SSL for cloud MySQL and diagnoses connection errors', () => {
    const prevUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = 'mysql://admin:secret@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/construction';
    const cfg = getDbConnectionConfig();
    expect(cfg.host).toBe('gateway01.ap-southeast-1.prod.aws.tidbcloud.com');
    expect(cfg.port).toBe(4000);
    expect(cfg.database).toBe('construction');
    expect(cfg.sslEnabled).toBe(true);
    expect(cfg.isConfiguredForRemote).toBe(true);
    if (prevUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = prevUrl;

    const diag = diagnoseDbError({ code: 'ER_NO_SUCH_TABLE' });
    expect(diag.status).toBe(503);
    expect(diag.message).toContain('schema.sql');
  });
});
