"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { ownerFormSchema, type OwnerFormData } from "@/types/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Building2, ArrowLeft, ArrowRight } from "lucide-react";

// ─── Objectives (PDF 5.2.1 - 8 options) ─────────────
const OBJECTIVES = [
  "Rent extra spaces (rooms, den)",
  "Rent a full unit (basement, suite, house, apartment, penthouse)",
  "Cover mortgage payments",
  "Increase income",
  "Get return on property investment",
  "Short-term rentals",
  "Long-term rentals",
  "Optimize assets",
];

// ─── Property types (PDF 5.2.1.1) ───────────────────
const PROPERTY_TYPES = [
  { value: "house", label: "House" },
  { value: "condo", label: "Condo" },
  { value: "penthouse", label: "Penthouse" },
  { value: "basement", label: "Basement" },
  { value: "studio", label: "Studio / Apartastudio" },
  { value: "rooms_only", label: "Rooms only" },
];

// ─── Amenities (PDF 5.2.1.1 - 16+) ─────────────────
const AMENITIES = [
  "Gym", "Rooftop", "Coworking", "Pool", "Jacuzzi", "Sauna",
  "Covered parking", "Open parking", "Private parking",
  "In-unit laundry (washer & dryer)", "Building laundry (paid)",
  "In-unit washer only", "Fireplace", "Internet", "Airfryer", "Other",
];

// ─── Common areas (PDF 5.2.1.1) ─────────────────────
const COMMON_AREAS = ["BBQ zone", "SPA", "Billiards", "Pool"];

// ─── Smart home features ─────────────────────────────
const SMART_HOME_FEATURES = ["Smart locks", "Keyless entry card", "Other"];

// ─── Bedrooms / Bathrooms ────────────────────────────
const BEDROOMS = ["1 BR", "2 BR", "3 BR", "4 BR", "5 BR", "6 BR", "7 BR"];
const BATHROOMS = ["1 Bath", "1.5 Bath", "2 Bath", "2.5 Bath", "3 Bath", "3.5 Bath"];

// ─── Styles ──────────────────────────────────────────
const STYLES = [
  { value: "minimalist", label: "Minimalist" },
  { value: "modern", label: "Modern" },
  { value: "classic", label: "Classic" },
  { value: "elegant", label: "Elegant" },
  { value: "other", label: "Other" },
];

// ─── SkyTrain lines ──────────────────────────────────
const SKYTRAIN_LINES = ["Millennium Line", "Expo Line", "Canada Line"];

// ─── BC Supermarkets (PDF 5.2.1.2) ──────────────────
const SUPERMARKETS = [
  "Superstore", "Walmart", "Costco", "Save-On-Foods",
  "Whole Foods", "T&T Supermarket", "No Frills", "Safeway", "Dollarama",
];

// ─── BC Cities ───────────────────────────────────────
const BC_CITIES = [
  "Vancouver", "Burnaby", "Surrey", "Richmond", "North Vancouver",
  "West Vancouver", "Coquitlam", "New Westminster", "Victoria",
  "Kelowna", "Langley", "Abbotsford",
];

const TOTAL_STEPS = 5;

function getServiceTier(count: number): string {
  if (count >= 4) return "Elite Assets & Legacy";
  if (count >= 2) return "Preferred Owners";
  return "Basic";
}

export default function OwnerFormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
      property_count: 1,
      objectives: [],
      cities: [""],
      rents: [0],
      amenities: [],
      common_areas: [],
      smart_home_features: [],
      skytrain_lines: [],
      nearby_supermarkets: [],
      pet_friendly: false,
      smart_home: false,
      shared_unit: false,
      dishwasher: false,
      furnished: false,
      utilities_included: false,
      near_parks: false,
      near_churches: false,
      near_skytrain: false,
      near_bus: false,
      near_mall: false,
      province: "British Columbia",
      consent_image_usage: false,
      consent_data_processing: false,
      consent_marketing: false,
      consent_third_party: false,
      area_unit: "sqft",
    },
  });

  const objectives = watch("objectives") as string[];
  const amenities = watch("amenities") as string[];
  const commonAreas = watch("common_areas") as string[];
  const smartHomeFeatures = watch("smart_home_features") as string[];
  const skytrainLines = watch("skytrain_lines") as string[];
  const supermarkets = watch("nearby_supermarkets") as string[];
  const propertyCount = (watch("property_count") as number) || 1;
  const cities = watch("cities") as string[];
  const rents = watch("rents") as number[];
  const smartHome = watch("smart_home") as boolean;
  const nearSkytrain = watch("near_skytrain") as boolean;

  function toggleArray(field: keyof OwnerFormData, value: string, arr: string[]) {
    const next = arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
    setValue(field, next as never);
  }

  // Keep cities/rents arrays in sync with property_count
  function syncPropertyArrays(count: number) {
    const newCities = [...cities];
    const newRents = [...rents];
    while (newCities.length < count) newCities.push("");
    while (newRents.length < count) newRents.push(0);
    setValue("cities", newCities.slice(0, count));
    setValue("rents", newRents.slice(0, count));
  }

  async function nextStep() {
    let valid = true;
    if (step === 1) {
      valid = await trigger(["property_count", "objectives"]);
    }
    if (step === 3) {
      valid = await trigger(["property_type", "bedrooms", "bathrooms"]);
    }
    if (step === 4) {
      valid = await trigger(["address", "zone_city"]);
    }
    if (valid) setStep(step + 1);
  }

  async function onSubmit(data: OwnerFormData) {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const tier = propertyCount >= 4 ? "elite" : propertyCount >= 2 ? "preferred_owners" : "basic";

      // Save owner profile to discovery_briefs
      const { error: briefError } = await supabase
        .from("discovery_briefs")
        .insert({
          user_id: user.id,
          property_objective: "rent",
          property_type: data.property_type,
          current_state: "vacant",
          monthly_rent: data.rents[0] || null,
          main_challenge: "find_tenants",
          property_count: data.property_count,
          has_professional_photos: false,
          current_listings: [],
          objectives: data.objectives,
          cities: data.cities,
          rents: data.rents,
          assigned_path: tier,
          consent_data_processing: data.consent_data_processing,
          consent_image_usage: data.consent_image_usage,
          consent_marketing: data.consent_marketing,
          consent_third_party: data.consent_third_party,
        });

      if (briefError) throw briefError;

      // Save first property details
      const { error: propError } = await supabase.from("properties").insert({
        owner_id: user.id,
        title: `${data.property_type} in ${data.zone_city}`,
        property_type: data.property_type,
        address: data.address,
        city: data.zone_city,
        province: data.province,
        postal_code: data.postal_code || null,
        monthly_rent: data.rents[0] || null,
        bedrooms: parseInt(data.bedrooms),
        bathrooms: parseFloat(data.bathrooms.replace(" Bath", "")),
        area_sqft: typeof data.area_sqft === "number" ? data.area_sqft : null,
        amenities: data.amenities,
        common_areas: data.common_areas,
        availability_date: data.availability_date || null,
        dishwasher: data.dishwasher,
        pet_friendly: data.pet_friendly,
        smart_home: data.smart_home,
        smart_home_features: data.smart_home_features,
        shared_unit: data.shared_unit,
        levels: data.levels || null,
        furnished: data.furnished,
        utilities_included: data.utilities_included,
        style: data.style || null,
        near_parks: data.near_parks,
        near_churches: data.near_churches,
        near_skytrain: data.near_skytrain,
        skytrain_lines: data.skytrain_lines,
        near_bus: data.near_bus,
        social_life: data.social_life || null,
        near_mall: data.near_mall,
        nearby_supermarkets: data.nearby_supermarkets,
        service_tier: tier,
        is_available: true,
      });

      if (propError) throw propError;

      // Update profile property count
      await supabase
        .from("profiles")
        .update({ property_count: data.property_count })
        .eq("id", user.id);

      // Create lead
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "owner_form" }),
      });

      router.push("/dashboard/properties");
    } catch (err) {
      setError("Failed to save. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4 py-8">
      {/* Progress */}
      <div className="mb-8 w-full max-w-2xl">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            Owner Profile
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card className="w-full max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-xl">
              {step === 1 && "Owner Profile"}
              {step === 2 && "Property Portfolio"}
              {step === 3 && "Property Details"}
              {step === 4 && "Zone & Location"}
              {step === 5 && "Legal Consents"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us about your properties and objectives."}
              {step === 2 && "Enter the city and desired rent for each property."}
              {step === 3 && "Describe your first property. You can add more from your dashboard."}
              {step === 4 && "Location details help us match tenants to your property."}
              {step === 5 && "Please review and accept the following consents."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* ═══ Step 1: Owner Profile ═══ */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="property_count">Number of properties</Label>
                  <Input
                    id="property_count"
                    type="number"
                    min={1}
                    placeholder="e.g. 2"
                    {...register("property_count", {
                      onChange: (e) => syncPropertyArrays(parseInt(e.target.value) || 1),
                    })}
                  />
                  {errors.property_count && (
                    <p className="text-sm text-destructive">{errors.property_count.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Your service tier: <strong>{getServiceTier(propertyCount)}</strong>
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>What are your objectives? (select all that apply)</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {OBJECTIVES.map((obj) => (
                      <div key={obj} className="flex items-center gap-2">
                        <Checkbox
                          id={`obj-${obj}`}
                          checked={objectives.includes(obj)}
                          onCheckedChange={() => toggleArray("objectives", obj, objectives)}
                        />
                        <Label htmlFor={`obj-${obj}`} className="text-sm font-normal">
                          {obj}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.objectives && (
                    <p className="text-sm text-destructive">{errors.objectives.message}</p>
                  )}
                </div>
              </>
            )}

            {/* ═══ Step 2: Per-property city & rent ═══ */}
            {step === 2 && (
              <>
                <p className="text-sm text-muted-foreground">
                  Enter the city and desired monthly rent for each of your {propertyCount} {propertyCount === 1 ? "property" : "properties"}.
                  Limited to British Columbia.
                </p>
                {Array.from({ length: Math.min(propertyCount, 10) }, (_, i) => (
                  <div key={i} className="rounded-lg border p-4 space-y-3">
                    <p className="text-sm font-medium">Property {i + 1}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">City</Label>
                        <Select
                          value={cities[i] ?? ""}
                          onValueChange={(val: string | null) => {
                            if (!val) return;
                            const newCities = [...cities];
                            newCities[i] = val;
                            setValue("cities", newCities);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {BC_CITIES.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Monthly rent (CAD)</Label>
                        <Input
                          type="number"
                          min={300}
                          max={8000}
                          placeholder="e.g. 2500"
                          value={rents[i] || ""}
                          onChange={(e) => {
                            const newRents = [...rents];
                            newRents[i] = parseInt(e.target.value) || 0;
                            setValue("rents", newRents);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {errors.cities && (
                  <p className="text-sm text-destructive">{errors.cities.message}</p>
                )}
              </>
            )}

            {/* ═══ Step 3: Property Details ═══ */}
            {step === 3 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Property type</Label>
                    <Select onValueChange={(val: string | null) => val && setValue("property_type", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.property_type && (
                      <p className="text-sm text-destructive">{errors.property_type.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Availability date</Label>
                    <Input type="date" {...register("availability_date")} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Bedrooms</Label>
                    <Select onValueChange={(val: string | null) => val && setValue("bedrooms", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {BEDROOMS.map((b) => (
                          <SelectItem key={b} value={b.replace(" BR", "")}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.bedrooms && (
                      <p className="text-sm text-destructive">{errors.bedrooms.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Bathrooms</Label>
                    <Select onValueChange={(val: string | null) => val && setValue("bathrooms", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {BATHROOMS.map((b) => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.bathrooms && (
                      <p className="text-sm text-destructive">{errors.bathrooms.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Size</Label>
                    <div className="flex gap-1">
                      <Input type="number" placeholder="800" {...register("area_sqft")} className="min-w-0" />
                      <Select value={(watch("area_unit") as string) || "sqft"} onValueChange={(v: string | null) => v && setValue("area_unit", v as "sqft" | "m2")}>
                        <SelectTrigger className="w-20 shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sqft">ft²</SelectItem>
                          <SelectItem value="m2">m²</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Style</Label>
                  <Select onValueChange={(val: string | null) => val && setValue("style", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Levels / Floor</Label>
                  <Select onValueChange={(val: string | null) => val && setValue("levels", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {["1", "2", "3", "4", "Other"].map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {[
                    { id: "dishwasher", label: "Dishwasher", field: "dishwasher" as const },
                    { id: "pet_friendly", label: "Pet-friendly", field: "pet_friendly" as const },
                    { id: "shared_unit", label: "Shared unit", field: "shared_unit" as const },
                    { id: "furnished", label: "Furnished", field: "furnished" as const },
                    { id: "utilities", label: "Utilities included", field: "utilities_included" as const },
                  ].map(({ id, label, field }) => (
                    <div key={id} className="flex items-center gap-2">
                      <Checkbox
                        id={id}
                        checked={watch(field) as boolean}
                        onCheckedChange={(c) => setValue(field, c === true)}
                      />
                      <Label htmlFor={id} className="font-normal">{label}</Label>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="smart_home"
                    checked={smartHome}
                    onCheckedChange={(c) => setValue("smart_home", c === true)}
                  />
                  <Label htmlFor="smart_home" className="font-normal">Smart home</Label>
                </div>
                {smartHome && (
                  <div className="ml-6 space-y-2">
                    {SMART_HOME_FEATURES.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <Checkbox
                          id={`sh-${f}`}
                          checked={smartHomeFeatures.includes(f)}
                          onCheckedChange={() => toggleArray("smart_home_features", f, smartHomeFeatures)}
                        />
                        <Label htmlFor={`sh-${f}`} className="text-sm font-normal">{f}</Label>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  <Label>Amenities</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {AMENITIES.map((a) => (
                      <div key={a} className="flex items-center gap-2">
                        <Checkbox
                          id={`am-${a}`}
                          checked={amenities.includes(a)}
                          onCheckedChange={() => toggleArray("amenities", a, amenities)}
                        />
                        <Label htmlFor={`am-${a}`} className="text-sm font-normal">{a}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Building common areas</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {COMMON_AREAS.map((a) => (
                      <div key={a} className="flex items-center gap-2">
                        <Checkbox
                          id={`ca-${a}`}
                          checked={commonAreas.includes(a)}
                          onCheckedChange={() => toggleArray("common_areas", a, commonAreas)}
                        />
                        <Label htmlFor={`ca-${a}`} className="text-sm font-normal">{a}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ═══ Step 4: Zone & Location ═══ */}
            {step === 4 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zone_city">City</Label>
                    <Select
                      value={(watch("zone_city") as string) ?? ""}
                      onValueChange={(val: string | null) => val && setValue("zone_city", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {BC_CITIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.zone_city && (
                      <p className="text-sm text-destructive">{errors.zone_city.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal code</Label>
                    <Input id="postal_code" placeholder="V6B 1A1" {...register("postal_code")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="123 Main St" {...register("address")} />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address.message}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Nearby features</Label>
                  {[
                    { id: "near_parks", label: "Parks nearby", field: "near_parks" as const },
                    { id: "near_churches", label: "Churches nearby", field: "near_churches" as const },
                    { id: "near_bus", label: "Bus stop nearby", field: "near_bus" as const },
                    { id: "near_mall", label: "Shopping mall nearby", field: "near_mall" as const },
                  ].map(({ id, label, field }) => (
                    <div key={id} className="flex items-center gap-2">
                      <Checkbox
                        id={id}
                        checked={watch(field) as boolean}
                        onCheckedChange={(c) => setValue(field, c === true)}
                      />
                      <Label htmlFor={id} className="font-normal">{label}</Label>
                    </div>
                  ))}

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="near_skytrain"
                      checked={nearSkytrain}
                      onCheckedChange={(c) => setValue("near_skytrain", c === true)}
                    />
                    <Label htmlFor="near_skytrain" className="font-normal">SkyTrain nearby</Label>
                  </div>
                  {nearSkytrain && (
                    <div className="ml-6 space-y-2">
                      <Label className="text-sm">Which line?</Label>
                      {SKYTRAIN_LINES.map((line) => (
                        <div key={line} className="flex items-center gap-2">
                          <Checkbox
                            id={`sky-${line}`}
                            checked={skytrainLines.includes(line)}
                            onCheckedChange={() => toggleArray("skytrain_lines", line, skytrainLines)}
                          />
                          <Label htmlFor={`sky-${line}`} className="text-sm font-normal">{line}</Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="social_life">Social life nearby (optional)</Label>
                  <Input
                    id="social_life"
                    placeholder="e.g. bars, cinemas, entertainment..."
                    {...register("social_life")}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Nearby supermarkets</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {SUPERMARKETS.map((s) => (
                      <div key={s} className="flex items-center gap-2">
                        <Checkbox
                          id={`sm-${s}`}
                          checked={supermarkets.includes(s)}
                          onCheckedChange={() => toggleArray("nearby_supermarkets", s, supermarkets)}
                        />
                        <Label htmlFor={`sm-${s}`} className="text-sm font-normal">{s}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ═══ Step 5: Legal Consents ═══ */}
            {step === 5 && (
              <div className="space-y-4">
                {[
                  {
                    id: "consent_image",
                    field: "consent_image_usage" as const,
                    label: "I authorize the use and editing of property images for commercial purposes.",
                  },
                  {
                    id: "consent_data",
                    field: "consent_data_processing" as const,
                    label: "I accept the rights and privacy declaration.",
                  },
                  {
                    id: "consent_comms",
                    field: "consent_marketing" as const,
                    label: "I consent to electronic communications (CASL).",
                  },
                  {
                    id: "consent_terms",
                    field: "consent_third_party" as const,
                    label: "I accept the terms and conditions.",
                  },
                ].map(({ id, field, label }) => (
                  <div key={id}>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={id}
                        checked={watch(field) as boolean}
                        onCheckedChange={(c) => setValue(field, c === true)}
                      />
                      <Label htmlFor={id} className="text-sm font-normal leading-relaxed">
                        {label}
                      </Label>
                    </div>
                    {errors[field] && (
                      <p className="mt-1 ml-7 text-sm text-destructive">
                        {(errors[field] as { message?: string })?.message}
                      </p>
                    )}
                  </div>
                ))}

                {/* Review summary */}
                <div className="rounded-lg border bg-primary/5 p-4 mt-4">
                  <p className="text-sm font-medium text-primary">Your service tier:</p>
                  <p className="mt-1 text-lg font-bold">{getServiceTier(propertyCount)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {propertyCount} {propertyCount === 1 ? "property" : "properties"} in British Columbia
                  </p>
                </div>
              </div>
            )}
          </CardContent>

          {/* Navigation */}
          <div className="flex justify-between px-6 pb-6">
            {step > 1 ? (
              <Button type="button" variant="ghost" onClick={() => setStep(step - 1)} className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}
            {step < TOTAL_STEPS ? (
              <Button type="button" onClick={nextStep} className="gap-1">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={loading} className="gap-1">
                {loading ? "Submitting..." : "Submit"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
