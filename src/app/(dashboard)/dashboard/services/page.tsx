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

  // Fetch all active services
  const { data: allServices } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("category");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="text-muted-foreground">
          Available services for your account
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Services</h2>
        {!allServices || allServices.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No services available at this time.
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
                  {service.features && service.features.length > 0 && (
                    <ul className="mb-3 space-y-1 text-sm text-muted-foreground">
                      {service.features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="text-primary">&#8226;</span> {feature}
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
        )}
      </div>
    </div>
  );
}
