import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Building2, FileText, Heart } from "lucide-react";
import Link from "next/link";

const ROLE_LABELS: Record<string, string> = {
  propietario: "Property Owner",
  propietario_preferido: "Preferred Owner",
  inversionista: "Investor",
  inquilino: "Tenant",
  inquilino_premium: "Premium Tenant",
  pymes: "Business Owner",
  admin: "Administrator",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Fetch stats based on role
  let propertyCount = 0;
  let serviceCount = 0;

  if (
    profile.role === "propietario" ||
    profile.role === "propietario_preferido" ||
    profile.role === "inversionista"
  ) {
    const { count } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", user.id);
    propertyCount = count || 0;
  }

  const { count: svcCount } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);
  serviceCount = svcCount || 0;

  const isOwnerRole =
    profile.role === "propietario" ||
    profile.role === "propietario_preferido" ||
    profile.role === "inversionista";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome, {profile.full_name}
        </h1>
        <p className="text-muted-foreground">
          {ROLE_LABELS[profile.role] || profile.role} Dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {isOwnerRole && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                My Properties
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{propertyCount}</div>
              <p className="text-xs text-muted-foreground">
                Registered properties
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Available Services
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceCount}</div>
            <p className="text-xs text-muted-foreground">
              Active services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">
              Your profile is complete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Access key features directly
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {isOwnerRole && (
            <Link href="/forms/propietario" className={buttonVariants()}>
              Discovery Brief
            </Link>
          )}
          {(profile.role === "inquilino" || profile.role === "inquilino_premium") && (
            <Link href="/forms/inquilino" className={buttonVariants()}>
              Update Preferences
            </Link>
          )}
          {profile.role === "pymes" && (
            <Link href="/forms/pymes" className={buttonVariants()}>
              Sales Leak Calculator
            </Link>
          )}
          <Link href="/dashboard/services" className={buttonVariants({ variant: "outline" })}>
            View Services
          </Link>
          <Link href="/dashboard/profile" className={buttonVariants({ variant: "outline" })}>
            My Profile
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
