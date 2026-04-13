import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Dedicated callback for password recovery.
// Supabase redirects here with ?code=xxx after email link click.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/reset-password`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=recovery_failed`);
}
