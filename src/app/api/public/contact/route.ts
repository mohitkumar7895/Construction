import { NextResponse } from 'next/server';
import { execute, queryOne } from '@/lib/db';
import { getClientIp } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { publicContactSchema } from '@/lib/validation';
import { sendInquiryNotificationEmail } from '@/lib/mailer';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`contact:${ip}`, 5, 10 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many inquiries submitted. Please try again in ${rate.retryAfterSeconds}s.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = publicContactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Please check the form fields.' },
        { status: 400 }
      );
    }

    const d = parsed.data;

    const result = await execute(
      `INSERT INTO inquiries (
        full_name, phone, email, service_required, project_type,
        project_location, estimated_budget, message, source, status, ip_address, privacy_consent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, 1)`,
      [
        d.full_name,
        d.phone,
        d.email || null,
        d.service_required || null,
        d.project_type || null,
        d.project_location || null,
        d.estimated_budget || null,
        d.message,
        d.source || 'contact_form',
        ip,
      ]
    );

    const contactRow = await queryOne<{ email: string }>(
      `SELECT email FROM contact_settings ORDER BY id ASC LIMIT 1`
    );
    const recipient = contactRow?.email || 'sartajkhan4284@gmail.com';

    // Non-blocking SMTP dispatch if configured
    void sendInquiryNotificationEmail(recipient, {
      fullName: d.full_name,
      phone: d.phone,
      email: d.email || undefined,
      serviceRequired: d.service_required || undefined,
      projectType: d.project_type || undefined,
      projectLocation: d.project_location || undefined,
      estimatedBudget: d.estimated_budget || undefined,
      message: d.message,
    });

    return NextResponse.json(
      {
        success: true,
        id: result.insertId,
        message: 'Thank you! Your inquiry has been received. Our team will contact you shortly.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Public inquiry submission error:', error);
    return NextResponse.json(
      { error: 'Unable to submit inquiry right now. Please call or WhatsApp us directly.' },
      { status: 500 }
    );
  }
}
