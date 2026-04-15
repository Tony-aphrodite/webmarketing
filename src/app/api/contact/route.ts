import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendContactNotification } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;

    if (!name || !email || !subject) {
      return NextResponse.json(
        { error: "Name, email and subject are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Save as lead with source "contact_form"
    await supabase.from("leads").insert({
      full_name: name,
      email,
      phone: phone || null,
      source: "contact_form",
      status: "nuevo",
      notes: subject,
    });

    // Send email notification (non-blocking)
    sendContactNotification({ name, email, phone: phone || null, subject }).catch(
      (err) => console.error("Email notification failed:", err)
    );

    // Redirect back to homepage with success message
    return NextResponse.redirect(new URL("/?contact=success", request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/?contact=error", request.url), 303);
  }
}
