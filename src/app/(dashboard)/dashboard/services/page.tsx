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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Fetch all active services
  const { data: allServices } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("category");

  // Filter services relevant to user's role
  const relevantServices = allServices?.filter(
    (service) =>
      service.target_roles &&
      profile?.role &&
      service.target_roles.includes(profile.role)
  );

  const otherServices = allServices?.filter(
    (service) =>
      !service.target_roles ||
      !profile?.role ||
      !service.target_roles.includes(profile.role)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="text-muted-foreground">
          Recommended and available services for you
        </p>
      </div>

      {/* Recommended services for user's role */}
      {relevantServices && relevantServices.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recommended for You</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {relevantServices.map((service) => (
              <Card key={service.id} className="border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Badge variant="secondary">Recommended</Badge>
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {service.features && service.features.length > 0 && (
                    <ul className="mb-3 space-y-1 text-sm text-muted-foreground">
                      {service.features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="text-primary">•</span> {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  <span className="text-lg font-bold">
                    ${service.price?.toLocaleString()} {service.currency || "CAD"}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All other services */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Services</h2>
        {!otherServices || otherServices.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No additional services available at this time.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {otherServices.map((service) => (
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
                    ${service.price?.toLocaleString()} {service.currency || "CAD"}
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
