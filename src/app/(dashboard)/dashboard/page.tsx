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
  let recommendationCount = 0;

  if (profile.role === "propietario") {
    const { count } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", user.id);
    propertyCount = count || 0;
  }

  const { count: recCount } = await supabase
    .from("service_recommendations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);
  recommendationCount = recCount || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Bienvenido, {profile.full_name}
        </h1>
        <p className="text-muted-foreground">
          Panel de{" "}
          {profile.role === "propietario"
            ? "Propietario"
            : profile.role === "inquilino"
              ? "Inquilino"
              : "Empresa"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {profile.role === "propietario" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Mis Propiedades
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{propertyCount}</div>
              <p className="text-xs text-muted-foreground">
                Propiedades registradas
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Servicios Recomendados
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommendationCount}</div>
            <p className="text-xs text-muted-foreground">
              Recomendaciones activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estado</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Activo</div>
            <p className="text-xs text-muted-foreground">
              Tu perfil está completo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accede directamente a las funciones principales
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {profile.role === "propietario" && (
            <Link href="/forms/propietario" className={buttonVariants()}>
              Registrar Propiedad
            </Link>
          )}
          {profile.role === "inquilino" && (
            <Link href="/forms/inquilino" className={buttonVariants()}>
              Actualizar Preferencias
            </Link>
          )}
          {profile.role === "pymes" && (
            <Link href="/forms/pymes" className={buttonVariants()}>
              Realizar Diagnóstico
            </Link>
          )}
          <Link href="/dashboard/services" className={buttonVariants({ variant: "outline" })}>
            Ver Servicios
          </Link>
          <Link href="/dashboard/profile" className={buttonVariants({ variant: "outline" })}>
            Mi Perfil
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
