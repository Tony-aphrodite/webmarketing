"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { ownerFormSchema, type OwnerFormData } from "@/types/forms";
import { ImageUpload } from "@/components/forms/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PROPERTY_TYPES = [
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
  { value: "oficina", label: "Oficina" },
  { value: "local", label: "Local Comercial" },
  { value: "terreno", label: "Terreno" },
  { value: "bodega", label: "Bodega" },
];

const AMENITIES = [
  "Piscina",
  "Gimnasio",
  "Parqueadero",
  "Seguridad 24h",
  "Zona BBQ",
  "Salón Social",
  "Jardín",
  "Terraza",
  "Ascensor",
  "Pet Friendly",
];

export default function OwnerFormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useForm<OwnerFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(ownerFormSchema) as any,
    defaultValues: {
      amenities: [],
    },
  });

  const propertyType = watch("property_type");
  const amenities = watch("amenities");
  const showRooms = propertyType === "apartamento" || propertyType === "casa";

  async function nextStep() {
    let fieldsToValidate: (keyof OwnerFormData)[] = [];
    if (step === 1) fieldsToValidate = ["title", "description", "property_type"];
    if (step === 2) fieldsToValidate = ["address", "city"];
    if (step === 3) fieldsToValidate = ["price"];

    const valid = await trigger(fieldsToValidate);
    if (valid) setStep(step + 1);
  }

  async function uploadImages(propertyId: string) {
    const supabase = createClient();
    const urls: string[] = [];

    for (const file of images) {
      const ext = file.name.split(".").pop();
      const fileName = `${propertyId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("property-images").getPublicUrl(fileName);

      urls.push(publicUrl);
    }

    return urls;
  }

  async function onSubmit(data: OwnerFormData) {
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

      // Create property record first (without images)
      const { data: property, error: insertError } = await supabase
        .from("properties")
        .insert({
          owner_id: user.id,
          title: data.title,
          description: data.description,
          property_type: data.property_type,
          address: data.address,
          city: data.city,
          state: data.state || null,
          price: data.price,
          bedrooms: data.bedrooms || null,
          bathrooms: data.bathrooms || null,
          area_sqm: data.area_sqm || null,
          amenities: data.amenities,
          images: [],
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Upload images and update property
      if (images.length > 0 && property) {
        const imageUrls = await uploadImages(property.id);
        await supabase
          .from("properties")
          .update({ images: imageUrls })
          .eq("id", property.id);
      }

      // Create lead via API
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "formulario_propietario" }),
      });

      router.push("/dashboard/properties");
    } catch (err) {
      setError("Error al registrar la propiedad. Intente nuevamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Registrar Propiedad</CardTitle>
          <CardDescription>
            Complete la información de su propiedad. Paso {step} de 4.
          </CardDescription>
          {/* Progress bar */}
          <div className="flex gap-1 pt-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Título del anuncio</Label>
                  <Input
                    id="title"
                    placeholder="Ej: Apartamento moderno en zona norte"
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Describa las características principales de la propiedad..."
                    rows={4}
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Tipo de propiedad</Label>
                  <Select
                    onValueChange={(val) =>
                      setValue("property_type", val as OwnerFormData["property_type"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.property_type && (
                    <p className="text-sm text-destructive">{errors.property_type.message}</p>
                  )}
                </div>
              </>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    placeholder="Calle, número, barrio"
                    {...register("address")}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad</Label>
                    <Input id="city" placeholder="Ej: Bogotá" {...register("city")} />
                    {errors.city && (
                      <p className="text-sm text-destructive">{errors.city.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Departamento (opcional)</Label>
                    <Input
                      id="state"
                      placeholder="Ej: Cundinamarca"
                      {...register("state")}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="150000"
                      {...register("price")}
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive">{errors.price.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area_sqm">Área (m²)</Label>
                    <Input
                      id="area_sqm"
                      type="number"
                      placeholder="80"
                      {...register("area_sqm")}
                    />
                  </div>
                </div>
                {showRooms && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bedrooms">Habitaciones</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        placeholder="3"
                        {...register("bedrooms")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bathrooms">Baños</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        placeholder="2"
                        {...register("bathrooms")}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  <Label>Amenidades</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {AMENITIES.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2">
                        <Checkbox
                          id={`amenity-${amenity}`}
                          checked={amenities.includes(amenity)}
                          onCheckedChange={(checked) => {
                            const current = amenities || [];
                            setValue(
                              "amenities",
                              checked
                                ? [...current, amenity]
                                : current.filter((a) => a !== amenity)
                            );
                          }}
                        />
                        <Label htmlFor={`amenity-${amenity}`} className="text-sm font-normal">
                          {amenity}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Photos */}
            {step === 4 && (
              <div className="space-y-2">
                <Label>Fotografías de la propiedad</Label>
                <ImageUpload images={images} onImagesChange={setImages} maxImages={10} />
              </div>
            )}
          </CardContent>

          {/* Navigation buttons */}
          <div className="flex justify-between px-6 pb-6">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                Anterior
              </Button>
            ) : (
              <div />
            )}
            {step < 4 ? (
              <Button type="button" onClick={nextStep}>
                Siguiente
              </Button>
            ) : (
              <Button type="submit" disabled={loading}>
                {loading ? "Registrando..." : "Registrar Propiedad"}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
