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

const MONTREAL_ZONES = [
  "Downtown",
  "Griffintown",
  "Old Montreal",
  "Plateau Mont-Royal",
  "Mile End",
  "Outremont",
  "Westmount",
  "NDG",
  "Verdun",
  "South Shore",
  "Laval",
  "West Island",
  "Other",
];

const AMENITIES = [
  "Gym",
  "Pool",
  "Concierge",
  "Rooftop Terrace",
  "In-unit Laundry",
  "Parking",
  "Storage",
  "Doorman",
  "Pet-friendly",
  "Balcony",
];

const EMPLOYMENT_TYPES = [
  { value: "employed_stable", label: "Stable employment (full-time)" },
  { value: "self_employed", label: "Self-employed" },
  { value: "student", label: "Student" },
  { value: "retired", label: "Retired" },
  { value: "other", label: "Other" },
];

const STYLE_PREFS = [
  { value: "modern", label: "Modern / Contemporary" },
  { value: "classic", label: "Classic / Traditional" },
  { value: "minimalist", label: "Minimalist" },
  { value: "industrial", label: "Industrial / Loft" },
  { value: "other", label: "Other" },
];

const CONTRACT_DURATIONS = [
  { value: "6_months", label: "6 months" },
  { value: "12_months", label: "12 months" },
  { value: "18_months", label: "18 months" },
  { value: "24_months", label: "24 months" },
];

function countPremiumCriteria(data: TenantFormData): number {
  let count = 0;
  if (data.employment_type === "employed_stable" && data.employment_verifiable)
    count++;
  if (data.max_budget >= 2500) count++;
  if (data.seeks_premium_amenities) count++;
  if (data.prefers_urban_zone) count++;
  if (data.bedrooms_needed >= 2 && data.bedrooms_needed <= 4) count++;
  if (data.smart_home_interest) count++;
  if (
    data.style_preference === "modern" ||
    data.style_preference === "minimalist"
  )
    count++;
  if (
    data.contract_duration === "12_months" ||
    data.contract_duration === "18_months" ||
    data.contract_duration === "24_months"
  )
    count++;
  return count;
}

export default function TenantFormPage() {
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
  } = useForm<TenantFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tenantFormSchema) as any,
    defaultValues: {
      preferred_city: "Montreal",
      preferred_zones: [],
      preferred_amenities: [],
      pet_friendly: false,
      parking_needed: false,
      employment_verifiable: false,
      seeks_premium_amenities: false,
      prefers_urban_zone: false,
      smart_home_interest: false,
      consent_data_processing: false,
      consent_marketing: false,
    },
  });

  const zones = watch("preferred_zones");
  const amenities = watch("preferred_amenities");

  async function nextStep() {
    let fieldsToValidate: (keyof TenantFormData)[] = [];
    if (step === 1) fieldsToValidate = ["min_budget", "max_budget", "bedrooms_needed", "move_in_date"];
    if (step === 2) fieldsToValidate = ["employment_type", "contract_duration"];

    const valid =
      fieldsToValidate.length === 0 || (await trigger(fieldsToValidate));
    if (valid) setStep(step + 1);
  }

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

      const premiumCount = countPremiumCriteria(data);
      const isPremium = premiumCount >= 3;

      // Check if preferences already exist
      const { data: existing } = await supabase
        .from("tenant_preferences")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const payload = {
        user_id: user.id,
        preferred_city: data.preferred_city || "Montreal",
        preferred_zones: data.preferred_zones,
        min_budget: data.min_budget,
        max_budget: data.max_budget,
        bedrooms_needed: data.bedrooms_needed,
        bathrooms_needed: data.bathrooms_needed || null,
        move_in_date: data.move_in_date,
        employment_type: data.employment_type,
        employment_verifiable: data.employment_verifiable,
        seeks_premium_amenities: data.seeks_premium_amenities,
        preferred_amenities: data.preferred_amenities,
        prefers_urban_zone: data.prefers_urban_zone,
        smart_home_interest: data.smart_home_interest,
        style_preference: data.style_preference || null,
        contract_duration: data.contract_duration,
        premium_criteria_count: premiumCount,
        is_premium: isPremium,
        consent_data_processing: data.consent_data_processing,
        consent_marketing: data.consent_marketing,
        pet_friendly: data.pet_friendly,
        parking_needed: data.parking_needed,
        additional_requirements: data.additional_requirements || null,
      };

      if (existing) {
        const { error: updateError } = await supabase
          .from("tenant_preferences")
          .update(payload)
          .eq("id", existing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("tenant_preferences")
          .insert(payload);
        if (insertError) throw insertError;
      }

      // Create lead
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "tenant_form" }),
      });

      router.push("/dashboard");
    } catch (err) {
      setError("Failed to save preferences. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Tenant Preferences</CardTitle>
          <CardDescription>
            Complete your profile to find your ideal home. Step {step} of 3.
          </CardDescription>
          <div className="flex gap-1 pt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`}
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

            {/* Step 1: Basic Preferences */}
            {step === 1 && (
              <>
                <div className="space-y-3">
                  <Label>Preferred neighbourhoods</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {MONTREAL_ZONES.map((zone) => (
                      <div key={zone} className="flex items-center gap-2">
                        <Checkbox
                          id={`zone-${zone}`}
                          checked={zones.includes(zone)}
                          onCheckedChange={(checked) => {
                            setValue(
                              "preferred_zones",
                              checked
                                ? [...zones, zone]
                                : zones.filter((z) => z !== zone)
                            );
                          }}
                        />
                        <Label
                          htmlFor={`zone-${zone}`}
                          className="text-sm font-normal"
                        >
                          {zone}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_budget">Min budget (CAD/month)</Label>
                    <Input
                      id="min_budget"
                      type="number"
                      placeholder="1000"
                      {...register("min_budget")}
                    />
                    {errors.min_budget && (
                      <p className="text-sm text-destructive">
                        {errors.min_budget.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_budget">Max budget (CAD/month)</Label>
                    <Input
                      id="max_budget"
                      type="number"
                      placeholder="2500"
                      {...register("max_budget")}
                    />
                    {errors.max_budget && (
                      <p className="text-sm text-destructive">
                        {errors.max_budget.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms_needed">Bedrooms needed</Label>
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
                    <Label htmlFor="move_in_date">Move-in date</Label>
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

                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="pet_friendly"
                      checked={watch("pet_friendly")}
                      onCheckedChange={(c) => setValue("pet_friendly", c === true)}
                    />
                    <Label htmlFor="pet_friendly" className="font-normal">
                      Pet-friendly
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="parking_needed"
                      checked={watch("parking_needed")}
                      onCheckedChange={(c) =>
                        setValue("parking_needed", c === true)
                      }
                    />
                    <Label htmlFor="parking_needed" className="font-normal">
                      Parking needed
                    </Label>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Premium Criteria */}
            {step === 2 && (
              <>
                <p className="text-sm text-muted-foreground">
                  These details help us match you with the best properties. Meeting
                  3+ criteria qualifies you as a Premium Tenant.
                </p>

                <div className="space-y-2">
                  <Label>Employment type</Label>
                  <Select
                    onValueChange={(val) =>
                      setValue(
                        "employment_type",
                        val as TenantFormData["employment_type"]
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_TYPES.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {e.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.employment_type && (
                    <p className="text-sm text-destructive">
                      {errors.employment_type.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="employment_verifiable"
                    checked={watch("employment_verifiable")}
                    onCheckedChange={(c) =>
                      setValue("employment_verifiable", c === true)
                    }
                  />
                  <Label htmlFor="employment_verifiable" className="font-normal">
                    Employment is verifiable (can provide proof)
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="seeks_premium"
                    checked={watch("seeks_premium_amenities")}
                    onCheckedChange={(c) =>
                      setValue("seeks_premium_amenities", c === true)
                    }
                  />
                  <Label htmlFor="seeks_premium" className="font-normal">
                    I am looking for premium amenities
                  </Label>
                </div>

                {watch("seeks_premium_amenities") && (
                  <div className="space-y-2 rounded-md border p-4">
                    <Label>Which amenities?</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {AMENITIES.map((a) => (
                        <div key={a} className="flex items-center gap-2">
                          <Checkbox
                            id={`amenity-${a}`}
                            checked={amenities.includes(a)}
                            onCheckedChange={(checked) => {
                              setValue(
                                "preferred_amenities",
                                checked
                                  ? [...amenities, a]
                                  : amenities.filter((x) => x !== a)
                              );
                            }}
                          />
                          <Label
                            htmlFor={`amenity-${a}`}
                            className="text-sm font-normal"
                          >
                            {a}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="urban_zone"
                    checked={watch("prefers_urban_zone")}
                    onCheckedChange={(c) =>
                      setValue("prefers_urban_zone", c === true)
                    }
                  />
                  <Label htmlFor="urban_zone" className="font-normal">
                    I prefer downtown / urban areas
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="smart_home"
                    checked={watch("smart_home_interest")}
                    onCheckedChange={(c) =>
                      setValue("smart_home_interest", c === true)
                    }
                  />
                  <Label htmlFor="smart_home" className="font-normal">
                    Interested in smart home features
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label>Style preference</Label>
                  <Select
                    onValueChange={(val) =>
                      setValue(
                        "style_preference",
                        val as TenantFormData["style_preference"]
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      {STYLE_PREFS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Contract duration</Label>
                  <Select
                    onValueChange={(val) =>
                      setValue(
                        "contract_duration",
                        val as TenantFormData["contract_duration"]
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTRACT_DURATIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.contract_duration && (
                    <p className="text-sm text-destructive">
                      {errors.contract_duration.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional">Additional requirements (optional)</Label>
                  <Textarea
                    id="additional"
                    placeholder="Any other details..."
                    rows={3}
                    {...register("additional_requirements")}
                  />
                </div>
              </>
            )}

            {/* Step 3: Consents */}
            {step === 3 && (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Please review and accept the following consents before submitting.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="consent_data"
                      checked={watch("consent_data_processing")}
                      onCheckedChange={(c) =>
                        setValue("consent_data_processing", c === true)
                      }
                    />
                    <Label htmlFor="consent_data" className="text-sm font-normal leading-relaxed">
                      I consent to the processing of my personal data as
                      described in the Privacy Policy. (Required)
                    </Label>
                  </div>
                  {errors.consent_data_processing && (
                    <p className="text-sm text-destructive">
                      {errors.consent_data_processing.message}
                    </p>
                  )}

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="consent_mktg"
                      checked={watch("consent_marketing")}
                      onCheckedChange={(c) =>
                        setValue("consent_marketing", c === true)
                      }
                    />
                    <Label htmlFor="consent_mktg" className="text-sm font-normal leading-relaxed">
                      I agree to receive marketing communications. (Optional)
                    </Label>
                  </div>
                </div>
              </>
            )}
          </CardContent>

          <div className="flex justify-between px-6 pb-6">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                Previous
              </Button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Preferences"}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
