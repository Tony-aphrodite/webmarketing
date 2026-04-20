import { Resend } from "resend";

// Steve 4/19: domain is nexuma.ca, receiver is alexsanabria33@hotmail.com until commercial email ready
const NOTIFICATION_EMAIL = process.env.CONTACT_NOTIFICATION_EMAIL || "alexsanabria33@hotmail.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "WebMarketing <notifications@nexuma.ca>";

// Support multi-recipient: comma-separated emails → array
function parseRecipients(value: string): string[] {
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

export async function sendContactNotification({
  name,
  email,
  phone,
  subject,
}: {
  name: string;
  email: string;
  phone: string | null;
  subject: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email notification");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: FROM_EMAIL,
    to: parseRecipients(NOTIFICATION_EMAIL),
    subject: `New Contact Form: ${subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <table style="border-collapse:collapse;width:100%;max-width:500px">
        <tr><td style="padding:8px;font-weight:bold">Name</td><td style="padding:8px">${name}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px"><a href="mailto:${email}">${email}</a></td></tr>
        ${phone ? `<tr><td style="padding:8px;font-weight:bold">Phone</td><td style="padding:8px">${phone}</td></tr>` : ""}
        <tr><td style="padding:8px;font-weight:bold">Subject</td><td style="padding:8px">${subject}</td></tr>
      </table>
      <p style="color:#666;font-size:12px;margin-top:20px">
        This notification was sent from the WebMarketing contact form.
      </p>
    `,
  });
}
