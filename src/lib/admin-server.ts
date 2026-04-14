import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side helper: verifies the current user is an admin.
 * Redirects to /dashboard if not. Call from server components / route handlers only.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return { user, supabase };
}
