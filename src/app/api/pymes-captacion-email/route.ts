import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const COMMERCIAL_EMAIL = process.env.COMMERCIAL_AREA_EMAIL || "alexsanabria33@hotmail.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "WebMarketing <notifications@nexuma.ca>";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", user.id)
      .single();

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      resend.emails.send({
        from: FROM_EMAIL,
        to: COMMERCIAL_EMAIL.split(",").map((s) => s.trim()).filter(Boolean),
        subject: `New Client Acquisition Lead — ${body.business_name || "Unknown"}`,
        html: `
          <h2>New Rescue Session Request (Client Acquisition)</h2>
          <p>A PYMES client has completed the Client Acquisition form and requested a rescue session.</p>
          <table style="border-collapse:collapse;width:100%;max-width:600px">
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Contact Name</td><td style="padding:8px">${profile?.full_name || "N/A"}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Email</td><td style="padding:8px"><a href="mailto:${profile?.email || user.email}">${profile?.email || user.email}</a></td></tr>
            ${profile?.phone ? `<tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Phone</td><td style="padding:8px">${profile.phone}</td></tr>` : ""}
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Business Name</td><td style="padding:8px">${body.business_name || "N/A"}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Industry</td><td style="padding:8px">${body.industry || "N/A"}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Goals</td><td style="padding:8px">${Array.isArray(body.business_goals) ? body.business_goals.join(", ") : body.business_goals || "N/A"}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;background:#f5f5f5">Biggest Challenge</td><td style="padding:8px">${body.biggest_challenge || "N/A"}</td></tr>
          </table>
          <p style="margin-top:20px;color:#666;font-size:12px">Please contact this lead within 24 hours to schedule their rescue session.</p>
        `,
      }).catch((err) => console.error("Captacion email send failed:", err));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Captacion email error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
