import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin } from "lucide-react";

export default async function PropertiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Properties</h1>
          <p className="text-muted-foreground">
            Manage your registered properties
          </p>
        </div>
        <Link href="/forms/propietario" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" />
          New Property
        </Link>
      </div>

      {!properties || properties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="mb-4 text-muted-foreground">
              You haven&apos;t registered any properties yet
            </p>
            <Link href="/forms/propietario" className={buttonVariants()}>
              Register my first property
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              {/* Thumbnail */}
              <div className="aspect-video bg-muted">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.address}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{property.property_type}</CardTitle>
                  <Badge variant={property.is_available ? "default" : "secondary"}>
                    {property.is_available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {property.city}
                  {property.province ? `, ${property.province}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {property.monthly_rent && (
                    <span className="text-lg font-bold">
                      ${Number(property.monthly_rent).toLocaleString()} CAD/mo
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground capitalize">
                    {property.property_type}
                  </span>
                </div>
                {(property.bedrooms || property.bathrooms || property.area_sqft) && (
                  <div className="mt-2 flex gap-3 text-sm text-muted-foreground">
                    {property.bedrooms && <span>{property.bedrooms} bed</span>}
                    {property.bathrooms && <span>{property.bathrooms} bath</span>}
                    {property.area_sqft && <span>{property.area_sqft} sq ft</span>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
