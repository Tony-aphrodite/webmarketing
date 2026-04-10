import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ServicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch recommended services for this user
  const { data: recommendations } = await supabase
    .from("service_recommendations")
    .select("*, services(*)")
    .eq("user_id", user.id);

  // Fetch all active services
  const { data: allServices } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("category");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Servicios</h1>
        <p className="text-muted-foreground">
          Servicios recomendados y disponibles para ti
        </p>
      </div>

      {/* Recommended services */}
      {recommendations && recommendations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recomendados para Ti</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {recommendations.map((rec) => (
              <Card key={rec.id} className="border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">
                      {(rec.services as Record<string, string>)?.name || "Servicio"}
                    </CardTitle>
                    <Badge variant="secondary">Recomendado</Badge>
                  </div>
                  <CardDescription>
                    {(rec.services as Record<string, string>)?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {rec.reason && (
                    <p className="mb-3 text-sm text-muted-foreground italic">
                      &quot;{rec.reason}&quot;
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">
                      ${(rec.services as Record<string, number>)?.price?.toLocaleString()}{" "}
                      {(rec.services as Record<string, string>)?.currency || "USD"}
                    </span>
                    {rec.is_purchased && (
                      <Badge className="bg-green-600">Contratado</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All services */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Todos los Servicios</h2>
        {!allServices || allServices.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No hay servicios disponibles en este momento.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {allServices.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {service.category}
                    </Badge>
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-lg font-bold">
                    ${service.price?.toLocaleString()} {service.currency}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
