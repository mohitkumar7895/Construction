import nodemailer from 'nodemailer';

export interface InquiryEmailPayload {
  fullName: string;
  phone: string;
  email?: string;
  serviceRequired?: string;
  projectType?: string;
  projectLocation?: string;
  estimatedBudget?: string;
  message: string;
}

export async function sendInquiryNotificationEmail(
  recipientEmail: string,
  payload: InquiryEmailPayload
): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || user,
      to: recipientEmail,
      subject: `New Construction Inquiry from ${payload.fullName}`,
      text: [
        `New Inquiry Received`,
        `Name: ${payload.fullName}`,
        `Phone: ${payload.phone}`,
        `Email: ${payload.email || 'Not provided'}`,
        `Service: ${payload.serviceRequired || 'General'}`,
        `Project Type: ${payload.projectType || 'Not specified'}`,
        `Location: ${payload.projectLocation || 'Not specified'}`,
        `Estimated Budget: ${payload.estimatedBudget || 'Not specified'}`,
        ``,
        `Message:`,
        payload.message,
      ].join('\n'),
    });

    return true;
  } catch (err) {
    console.error('SMTP email dispatch failed:', err);
    return false;
  }
}
