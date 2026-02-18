import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendEmail(name: string, email: string, message: string) {
  return await resend.emails.send({
    from: "onboarding@resend.dev", // change to your verified domain if needed
    to: "janengene12@gmail.com",      // where enquiries will be sent
    subject: "New Enquiry from AvoLink",
    text: `
Name: ${name}
Email: ${email}

Message:
${message}
    `,
  });
}
