import { Resend } from 'resend';
import type { Enquiry } from '@shared/schema';

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendLeadNotification(enquiry: Enquiry) {
  try {
    const { data, error } = await resend.emails.send({
      // 1. MUST use 'onboarding@resend.dev' if your domain isn't verified
      from: 'AvoLink Market <onboarding@resend.dev>', 
      // 2. The email where you want to receive notifications
      to: [process.env.ADMIN_EMAIL || 'your-personal-email@gmail.com'],
      subject: `New ${enquiry.type.toUpperCase()} Lead: ${enquiry.company}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #10b981;">New Marketplace Enquiry</h2>
          <p><strong>Type:</strong> ${enquiry.type}</p>
          <p><strong>Company:</strong> ${enquiry.company}</p>
          <p><strong>Contact Person:</strong> ${enquiry.name}</p>
          <p><strong>Email:</strong> ${enquiry.email}</p>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p><strong>Message:</strong></p>
          <p style="font-style: italic;">"${enquiry.message}"</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Error Detail:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error("Mailer Crash:", err);
    return { success: false, error: err };
  }
}