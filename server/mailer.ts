import { Resend } from 'resend';
import type { Enquiry } from '@shared/schema';

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);


export async function sendLeadNotification(enquiry: Enquiry) {
  try {
    const safeEnquiry = enquiry || {};
    const name = safeEnquiry.name || 'N/A';
    const company = safeEnquiry.company || 'N/A';
    const email = safeEnquiry.email || 'N/A';
    const message = safeEnquiry.message || '';
    const type = safeEnquiry.type || 'buyer';
    
    // Extract properties forwarded by the updated routing logic
    const rawProduct = (safeEnquiry as any).product || '';
    const quantity = (safeEnquiry as any).quantity || '';

    // 💡 Translation Helper: Converts raw technical Select IDs into human-readable email labels
    let productLabel = "General Enquiry";
    if (type === 'buyer') {
      if (rawProduct === "1") productLabel = "Fresh Hass Avocados";
      else if (rawProduct === "2") productLabel = "Crude Avocado Oil";
      else if (rawProduct === "3") productLabel = "Macadamia Nuts (Style 0)";
      else if (rawProduct) productLabel = `Product (ID: ${rawProduct})`; 
      else productLabel = "Unspecified Product Interest";
    } else {
      productLabel = "Supplier Partnership Capacity Application";
    }

    const { data, error } = await resend.emails.send({
      // Unified brand name signature matching global layout guidelines
      from: 'Avolink International <onboarding@resend.dev>', 
      // Receives system administrative notifications
      to: [process.env.ADMIN_EMAIL || 'your-personal-email@gmail.com'],
      subject: `🌐 New ${type.toUpperCase()} Lead: ${company} | Avolink International`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; color: #334155; background-color: #ffffff;">
          <h2 style="color: #15803d; margin-top: 0; font-size: 20px; font-weight: 700;">New B2B Marketplace Submission</h2>
          <p style="font-size: 14px; color: #64748b; margin-bottom: 20px;">Received via Avolink International trading portal.</p>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #475569; width: 140px;">Account Type:</td>
              <td style="padding: 8px 0; text-transform: capitalize; color: #0f172a;">${type}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #475569;">Company Name:</td>
              <td style="padding: 8px 0; color: #0f172a;">${company}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #475569;">Contact Person:</td>
              <td style="padding: 8px 0; color: #0f172a;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #475569;">Email Address:</td>
              <td style="padding: 8px 0; color: #0f172a;"><a href="mailto:${email}" style="color: #16a34a; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #475569;">Core Interest:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">${productLabel}</td>
            </tr>
            ${type === 'buyer' && quantity ? `
            <tr>
              <td style="padding: 8px 0; font-weight: 600; color: #475569;">Est. Quantity:</td>
              <td style="padding: 8px 0; color: #0f172a;">${quantity}</td>
            </tr>
            ` : ''}
          </table>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          
          <p style="font-weight: 600; color: #475569; font-size: 14px; margin-bottom: 8px;">
            ${type === 'buyer' ? 'Additional Details:' : 'Production Capacity & Details:'}
          </p>
          <div style="background-color: #f8fafc; padding: 16px; border-left: 4px solid #16a34a; border-radius: 4px; font-style: italic; font-size: 14px; line-height: 1.5; color: #334155;">
            "${message || 'No additional notes provided by user.'}"
          </div>
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