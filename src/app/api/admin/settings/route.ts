import { NextResponse } from 'next/server';
import { execute, query, queryOne } from '@/lib/db';
import { getClientIp, logActivity, requireAdmin } from '@/lib/auth';
import { revalidatePublicSite } from '@/lib/revalidate';

export async function GET() {
  const { error } = await requireAdmin('dashboard.view');
  if (error) return error;

  try {
    const [website, company, contact, socialLinks, navigation, footerSections, footerLinks] =
      await Promise.all([
        queryOne(`SELECT * FROM website_settings ORDER BY id ASC LIMIT 1`),
        queryOne(`SELECT * FROM company_profiles ORDER BY id ASC LIMIT 1`),
        queryOne(`SELECT * FROM contact_settings ORDER BY id ASC LIMIT 1`),
        query(`SELECT * FROM social_links ORDER BY display_order ASC, id ASC`),
        query(`SELECT * FROM navigation_items ORDER BY display_order ASC, id ASC`),
        query(`SELECT * FROM footer_sections ORDER BY display_order ASC, id ASC`),
        query(`SELECT * FROM footer_links ORDER BY display_order ASC, id ASC`),
      ]);

    return NextResponse.json({
      website,
      company,
      contact,
      socialLinks,
      navigation,
      footerSections,
      footerLinks,
    });
  } catch (err) {
    console.error('Settings GET error:', err);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const { user, error } = await requireAdmin('settings.manage');
  if (error || !user) return error!;

  try {
    const body = await request.json();
    const { section, data } = body as { section: string; data: Record<string, any> };
    const ip = getClientIp(request);

    if (section === 'website') {
      await execute(
        `UPDATE website_settings SET
          site_name = ?, tagline = ?, domain_name = ?, logo_url = ?, logo_dark_url = ?, favicon_url = ?,
          google_analytics_id = ?, google_search_console_code = ?,
          header_cta_primary_label = ?, header_cta_primary_url = ?,
          header_cta_secondary_label = ?, header_cta_secondary_url = ?,
          show_top_bar = ?, maintenance_mode = ?, footer_copyright = ?
        WHERE id = 1`,
        [
          data.site_name || 'Sartaj Construction',
          data.tagline || null,
          data.domain_name || null,
          data.logo_url || null,
          data.logo_dark_url || null,
          data.favicon_url || null,
          data.google_analytics_id || null,
          data.google_search_console_code || null,
          data.header_cta_primary_label || 'Get a Quote',
          data.header_cta_primary_url || '/contact',
          data.header_cta_secondary_label || 'Inquire Now',
          data.header_cta_secondary_url || '/contact#inquiry-form',
          data.show_top_bar ? 1 : 0,
          data.maintenance_mode ? 1 : 0,
          data.footer_copyright || null,
        ]
      );
    } else if (section === 'company') {
      await execute(
        `UPDATE company_profiles SET
          company_name = ?, owner_name = ?, owner_title = ?, owner_bio = ?, owner_image_url = ?,
          business_type = ?, short_intro = ?, about_overview = ?, company_history = ?,
          mission = ?, vision = ?, core_values_json = ?, expertise_json = ?,
          quality_assurance = ?, safety_standards = ?, why_choose_us_json = ?,
          about_image_url = ?, established_year = ?, service_areas = ?
        WHERE id = 1`,
        [
          data.company_name || 'Sartaj Construction',
          data.owner_name || 'Sartaj Hussain',
          data.owner_title || null,
          data.owner_bio || null,
          data.owner_image_url || null,
          data.business_type || null,
          data.short_intro || null,
          data.about_overview || null,
          data.company_history || null,
          data.mission || null,
          data.vision || null,
          typeof data.core_values_json === 'string'
            ? data.core_values_json
            : JSON.stringify(data.core_values_json ?? []),
          typeof data.expertise_json === 'string'
            ? data.expertise_json
            : JSON.stringify(data.expertise_json ?? []),
          data.quality_assurance || null,
          data.safety_standards || null,
          typeof data.why_choose_us_json === 'string'
            ? data.why_choose_us_json
            : JSON.stringify(data.why_choose_us_json ?? []),
          data.about_image_url || null,
          data.established_year || null,
          data.service_areas || null,
        ]
      );
    } else if (section === 'contact') {
      await execute(
        `UPDATE contact_settings SET
          owner_name = ?, phone = ?, secondary_phone = ?, whatsapp_number = ?, whatsapp_default_message = ?,
          email = ?, address_line = ?, city = ?, district = ?, state = ?, pin_code = ?, country = ?,
          working_hours = ?, google_maps_embed_url = ?,
          floating_whatsapp_enabled = ?, floating_call_enabled = ?, floating_quote_enabled = ?,
          floating_position = ?, floating_whatsapp_color = ?, floating_call_color = ?, floating_quote_color = ?
        WHERE id = 1`,
        [
          data.owner_name || 'Sartaj Hussain',
          data.phone || '+91 9897300398',
          data.secondary_phone || null,
          data.whatsapp_number || '+91 9897300398',
          data.whatsapp_default_message || 'Hello, I am interested in your construction services. Please share more details.',
          data.email || 'sartajkhan4284@gmail.com',
          data.address_line || 'Haldwani',
          data.city || 'Haldwani',
          data.district || 'Nainital',
          data.state || 'Uttarakhand',
          data.pin_code || '263139',
          data.country || 'India',
          data.working_hours || null,
          data.google_maps_embed_url || null,
          data.floating_whatsapp_enabled ? 1 : 0,
          data.floating_call_enabled ? 1 : 0,
          data.floating_quote_enabled ? 1 : 0,
          data.floating_position === 'bottom-left' ? 'bottom-left' : 'bottom-right',
          data.floating_whatsapp_color || '#25D366',
          data.floating_call_color || '#111827',
          data.floating_quote_color || '#F5B301',
        ]
      );
    } else {
      return NextResponse.json({ error: 'Unknown settings section' }, { status: 400 });
    }

    await logActivity({
      adminUserId: user.id,
      action: 'update',
      module: `settings_${section}`,
      entityId: 1,
      description: `Updated ${section} settings`,
      ipAddress: ip,
    });

    revalidatePublicSite();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Settings PATCH error:', err);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
