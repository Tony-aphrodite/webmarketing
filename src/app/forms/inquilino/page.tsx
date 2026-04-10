"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { tenantFormSchema, type TenantFormData } from "@/types/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function TenantFormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TenantFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tenantFormSchema) as any,
    defaultValues: {
      pet_friendly: false,
      parking_needed: false,
    },
  });

  const petFriendly = watch("pet_friendly");
  const parkingNeeded = watch("parking_needed");

  async function onSubmit(data: TenantFormData) {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Check if preferences already exist
      const { data: existing } = await supabase
        .from("tenant_preferences")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existing) {
        // Update existing preferences
        const { error: updateError } = await supabase
          .from("tenant_preferences")
          .update({
            preferred_city: data.preferred_city,
            preferred_zone: data.preferred_zone || null,
            min_budget: data.min_budget,
            max_budget: data.max_budget,
            bedrooms_needed: data.bedrooms_needed,
            move_in_date: data.move_in_date,
            pet_friendly: data.pet_friendly,
            parking_needed: data.parking_needed,
            additional_requirements: data.additional_requirements || null,
          })
          .eq("id", existing.id);

        if (updateError) throw updateError;
      } else {
        // Insert new preferences
        const { error: insertError } = await supabase
          .from("tenant_preferences")
          .insert({
            user_id: user.id,
            preferred_city: data.preferred_city,
            preferred_zone: data.preferred_zone || null,
            min_budget: data.min_budget,
            max_budget: data.max_budget,
            bedrooms_needed: data.bedrooms_needed,
            move_in_date: data.move_in_date,
            pet_friendly: data.pet_friendly,
            parking_needed: data.parking_needed,
            additional_requirements: data.additional_requirements || null,
          });

        if (insertError) throw insertError;
      }

      // Create lead
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "formulario_inquilino" }),
      });

      router.push("/dashboard");
    } catch (err) {
      setError("Error al guardar preferencias. Intente nuevamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Preferencias de Vivienda</CardTitle>
          <CardDescription>
            Complete sus preferencias para encontrar la vivienda ideal
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferred_city">Ciudad preferida</Label>
                <Input
                  id="preferred_city"
                  placeholder="Ej: Bogotá"
                  {...register("preferred_city")}
                />
                {errors.preferred_city && (
                  <p className="text-sm text-destructive">
                    {errors.preferred_city.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferred_zone">Zona (opcional)</Label>
                <Input
                  id="preferred_zone"
                  placeholder="Ej: Zona Norte"
                  {...register("preferred_zone")}
                />
              </div>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_budget">Presupuesto mínimo (USD)</Label>
                <Input
                  id="min_budget"
                  type="number"
                  placeholder="500"
                  {...register("min_budget")}
                />
                {errors.min_budget && (
                  <p className="text-sm text-destructive">
                    {errors.min_budget.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_budget">Presupuesto máximo (USD)</Label>
                <Input
                  id="max_budget"
                  type="number"
                  placeholder="1500"
                  {...register("max_budget")}
                />
                {errors.max_budget && (
                  <p className="text-sm text-destructive">
                    {errors.max_budget.message}
                  </p>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms_needed">Habitaciones necesarias</Label>
                <Input
                  id="bedrooms_needed"
                  type="number"
                  placeholder="2"
                  {...register("bedrooms_needed")}
                />
                {errors.bedrooms_needed && (
                  <p className="text-sm text-destructive">
                    {errors.bedrooms_needed.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="move_in_date">Fecha de mudanza</Label>
                <Input
                  id="move_in_date"
                  type="date"
                  {...register("move_in_date")}
                />
                {errors.move_in_date && (
                  <p className="text-sm text-destructive">
                    {errors.move_in_date.message}
                  </p>
                )}
              </div>
            </div>

            {/* Preferences */}
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="pet_friendly"
                  checked={petFriendly}
                  onCheckedChange={(checked) =>
                    setValue("pet_friendly", checked === true)
                  }
                />
                <Label htmlFor="pet_friendly" className="font-normal">
                  Acepta mascotas
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="parking_needed"
                  checked={parkingNeeded}
                  onCheckedChange={(checked) =>
                    setValue("parking_needed", checked === true)
                  }
                />
                <Label htmlFor="parking_needed" className="font-normal">
                  Necesita parqueadero
                </Label>
              </div>
            </div>

            {/* Additional */}
            <div className="space-y-2">
              <Label htmlFor="additional_requirements">
                Requisitos adicionales (opcional)
              </Label>
              <Textarea
                id="additional_requirements"
                placeholder="Cualquier otro detalle importante..."
                rows={3}
                {...register("additional_requirements")}
              />
            </div>
          </CardContent>

          <div className="flex justify-end px-6 pb-6">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Preferencias"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
