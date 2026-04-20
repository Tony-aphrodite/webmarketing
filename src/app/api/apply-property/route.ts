import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

// Steve 4/19: nexuma.ca domain + alexsanabria33@hotmail.com as commercial receiver
const COMMERCIAL_EMAIL = process.env.COMMERCIAL_AREA_EMAIL || process.env.CONTACT_NOTIFICATION_EMAIL || "alexsanabria33@hotmail.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "WebMarketing <notifications@nexuma.ca>";

export async function POST(request: Request) {
  try {
    const { property_id } = await request.json();
    if (!property_id) {
      return NextResponse.json({ error: "property_id required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get tenant profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, phone, role")
      .eq("id", user.id)
      .single();

    // Get property details
    const { data: property } = await supabase
      .from("properties")
      .select("id, property_type, address, city, monthly_rent, owner_id")
      .eq("id", property_id)
      .single();

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Create application record as lead
    await supabase.from("leads").insert({
      user_id: user.id,
      full_name: profile?.full_name || user.email,
      email: profile?.email || user.email,
      phone: profile?.phone || null,
      source: "tenant_apply",
      status: "nuevo",
      notes: `Tenant application for property ${property.id} — ${property.property_type} at ${property.address}, ${property.city}`,
    });

    // Send email to commercial area (non-blocking)
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      resend.emails.send({
        from: FROM_EMAIL,
        to: COMMERCIAL_EMAIL.split(",").map((s) => s.trim()).filter(Boolean),
        subject: `New Tenant Application — ${property.property_type} in ${property.city}`,
        html: `
          <h2>New Tenant Application</h2>
          <p>A tenant has applied for a property via the matched properties feature.</p>
          <table style="border-collapse:collapse;width:100%;max-width:500px">
            <tr><td style="padding:8px;font-weight:bold">Tenant</td><td style="padding:8px">${profile?.full_name || "N/A"}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px"><a href="mailto:${profile?.email || user.email}">${profile?.email || user.email}</a></td></tr>
            ${profile?.phone ? `<tr><td style="padding:8px;font-weight:bold">Phone</td><td style="padding:8px">${profile.phone}</td></tr>` : ""}
            <tr><td style="padding:8px;font-weight:bold">Role</td><td style="padding:8px">${profile?.role || "tenant"}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Property</td><td style="padding:8px">${property.property_type} — ${property.address}, ${property.city}</td></tr>
            ${property.monthly_rent ? `<tr><td style="padding:8px;font-weight:bold">Rent</td><td style="padding:8px">$${Number(property.monthly_rent).toLocaleString()} CAD/mo</td></tr>` : ""}
          </table>
        `,
      }).catch((err) => console.error("Application email failed:", err));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Apply property error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
