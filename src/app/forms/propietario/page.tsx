"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import {
  discoveryBriefSchema,
  type DiscoveryBriefData,
} from "@/types/forms";
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
import { ArrowLeft, ArrowRight, Building2 } from "lucide-react";

const TOTAL_STEPS = 13; // 11 questions + consents + confirmation

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "condo", label: "Condo" },
  { value: "house", label: "House" },
  { value: "townhouse", label: "Townhouse" },
  { value: "duplex", label: "Duplex" },
  { value: "commercial", label: "Commercial" },
];

const OBJECTIVES = [
  { value: "rent", label: "Rent it out" },
  { value: "sell", label: "Sell it" },
  { value: "both", label: "Both (rent & sell)" },
  { value: "not_sure", label: "Not sure yet" },
];

const STATES = [
  { value: "occupied", label: "Currently occupied" },
  { value: "vacant", label: "Vacant" },
  { value: "under_renovation", label: "Under renovation" },
  { value: "new_construction", label: "New construction" },
];

const CHALLENGES = [
  { value: "find_tenants", label: "Find quality tenants" },
  { value: "improve_visibility", label: "Improve property visibility" },
  { value: "increase_value", label: "Increase property value" },
  { value: "manage_portfolio", label: "Manage my portfolio" },
  { value: "other", label: "Other" },
];

const LISTING_PLATFORMS = [
  "Centris",
  "Kijiji",
  "Facebook Marketplace",
  "Realtor.ca",
  "None",
  "Other",
];

const BUDGETS = [
  { value: "under_500", label: "Under $500 CAD" },
  { value: "500_1000", label: "$500 - $1,000 CAD" },
  { value: "1000_2500", label: "$1,000 - $2,500 CAD" },
  { value: "2500_5000", label: "$2,500 - $5,000 CAD" },
  { value: "over_5000", label: "Over $5,000 CAD" },
];

const TIMELINES = [
  { value: "immediate", label: "Immediately" },
  { value: "1_3_months", label: "1 - 3 months" },
  { value: "3_6_months", label: "3 - 6 months" },
  { value: "no_rush", label: "No rush" },
];

export default function DiscoveryBriefPage() {
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
  } = useForm<DiscoveryBriefData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(discoveryBriefSchema) as any,
    defaultValues: {
      current_listings: [],
      has_professional_photos: false,
      consent_data_processing: false,
      consent_image_usage: false,
      consent_marketing: false,
      consent_third_party: false,
    },
  });

  const propertyObjective = watch("property_objective");
  const currentListings = watch("current_listings");
  const propertyCount = watch("property_count");

  function getAssignedPath(): string {
    const count = propertyCount || 0;
    if (count >= 4) return "elite";
    if (count >= 2) return "preferred_owners";
    return "basic";
  }

  function getPathLabel(): string {
    const path = getAssignedPath();
    if (path === "elite") return "Elite Assets & Legacy (4+ properties)";
    if (path === "preferred_owners") return "Preferred Owners (2-3 properties)";
    return "Basic (1 property)";
  }

  async function onSubmit(data: DiscoveryBriefData) {
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

      const assignedPath = getAssignedPath();

      // Save discovery brief
      const { error: insertError } = await supabase
        .from("discovery_briefs")
        .insert({
          user_id: user.id,
          property_objective: data.property_objective,
          property_type: data.property_type,
          current_state: data.current_state,
          monthly_rent: data.monthly_rent || null,
          main_challenge: data.main_challenge,
          property_count: data.property_count,
          has_professional_photos: data.has_professional_photos,
          current_listings: data.current_listings,
          marketing_budget: data.marketing_budget || null,
          timeline: data.timeline || null,
          additional_comments: data.additional_comments || null,
          assigned_path: assignedPath,
          consent_data_processing: data.consent_data_processing,
          consent_image_usage: data.consent_image_usage,
          consent_marketing: data.consent_marketing,
          consent_third_party: data.consent_third_party,
        });

      if (insertError) throw insertError;

      // Create lead
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "discovery_brief" }),
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
      {/* Progress bar */}
      <div className="mb-8 w-full max-w-xl">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Discovery Brief</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card className="w-full max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">
                {step <= 11
                  ? `Question ${step} of 11`
                  : step === 12
                    ? "Legal Consents"
                    : "Review & Submit"}
              </CardTitle>
            </div>
            <CardDescription>
              {step <= 11
                ? "One question at a time. Take your time."
                : step === 12
                  ? "Please review and accept the following consents."
                  : "You are all set! Review your path and submit."}
            </CardDescription>
          </CardHeader>

          <CardContent className="min-h-[200px]">
            {error && (
              <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Q1: Property objective */}
            {step === 1 && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  What is your property objective?
                </Label>
                <div className="grid gap-2">
                  {OBJECTIVES.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setValue("property_objective", opt.value as DiscoveryBriefData["property_objective"]);
                        setStep(2);
                      }}
                      className={`rounded-lg border p-4 text-left text-sm transition-all hover:border-primary hover:bg-primary/5 ${
                        propertyObjective === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Q2: Property type */}
            {step === 2 && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  What type of property is it?
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setValue("property_type", type.value as DiscoveryBriefData["property_type"]);
                        setStep(3);
                      }}
                      className={`rounded-lg border p-4 text-left text-sm transition-all hover:border-primary hover:bg-primary/5 ${
                        watch("property_type") === type.value
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Q3: Current state */}
            {step === 3 && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  What is the current state of the property?
                </Label>
                <div className="grid gap-2">
                  {STATES.map((state) => (
                    <button
                      key={state.value}
                      type="button"
                      onClick={() => {
                        setValue("current_state", state.value as DiscoveryBriefData["current_state"]);
                        setStep(4);
                      }}
                      className={`rounded-lg border p-4 text-left text-sm transition-all hover:border-primary hover:bg-primary/5 ${
                        watch("current_state") === state.value
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      {state.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Q4: Monthly rent */}
            {step === 4 && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  What is the monthly rent? (CAD)
                </Label>
                <p className="text-sm text-muted-foreground">
                  {propertyObjective === "sell"
                    ? "Skip if you are only selling."
                    : "Enter the current or expected monthly rent."}
                </p>
                <Input
                  type="number"
                  placeholder="e.g. 2500"
                  {...register("monthly_rent")}
                />
                {errors.monthly_rent && (
                  <p className="text-sm text-destructive">
                    {errors.monthly_rent.message}
                  </p>
                )}
              </div>
            )}

            {/* Q5: Main challenge */}
            {step === 5 && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  What is your main challenge?
                </Label>
                <div className="grid gap-2">
                  {CHALLENGES.map((ch) => (
                    <button
                      key={ch.value}
                      type="button"
                      onClick={() => {
                        setValue("main_challenge", ch.value as DiscoveryBriefData["main_challenge"]);
                        setStep(6);
                      }}
                      className={`rounded-lg border p-4 text-left text-sm transition-all hover:border-primary hover:bg-primary/5 ${
                        watch("main_challenge") === ch.value
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Q6: Property count */}
            {step === 6 && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  How many properties do you own?
                </Label>
                <p className="text-sm text-muted-foreground">
                  This determines your service tier: Basic (1), Preferred (2-3),
                  or Elite (4+).
                </p>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 2"
                  {...register("property_count")}
                />
                {errors.property_count && (
                  <p className="text-sm text-destructive">
                    {errors.property_count.message}
                  </p>
                )}
              </div>
            )}

            {/* Q7: Professional photos */}
            {step === 7 && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Do you have professional photos of your property?
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: true, label: "Yes" },
                    { value: false, label: "No" },
                  ].map((opt) => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => {
                        setValue("has_professional_photos", opt.value);
                        setStep(8);
                      }}
                      className={`rounded-lg border p-4 text-center text-sm transition-all hover:border-primary hover:bg-primary/5 ${
                        watch("has_professional_photos") === opt.value
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Q8: Current listings */}
            {step === 8 && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Where is the property currently listed?
                </Label>
                <p className="text-sm text-muted-foreground">
                  Select all that apply.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {LISTING_PLATFORMS.map((platform) => (
                    <div key={platform} className="flex items-center gap-2">
                      <Checkbox
                        id={`listing-${platform}`}
                        checked={currentListings.includes(platform)}
                        onCheckedChange={(checked) => {
                          setValue(
                            "current_listings",
                            checked
                              ? [...currentListings, platform]
                              : currentListings.filter((p) => p !== platform)
                          );
                        }}
                      />
                      <Label
                        htmlFor={`listing-${platform}`}
                        className="text-sm font-normal"
                      >
                        {platform}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Q9: Marketing budget */}
            {step === 9 && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  What is your monthly marketing budget?
                </Label>
                <div className="grid gap-2">
                  {BUDGETS.map((b) => (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => {
                        setValue("marketing_budget", b.value as DiscoveryBriefData["marketing_budget"]);
                        setStep(10);
                      }}
                      className={`rounded-lg border p-4 text-left text-sm transition-all hover:border-primary hover:bg-primary/5 ${
                        watch("marketing_budget") === b.value
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Q10: Timeline */}
            {step === 10 && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  How soon do you need results?
                </Label>
                <div className="grid gap-2">
                  {TIMELINES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => {
                        setValue("timeline", t.value as DiscoveryBriefData["timeline"]);
                        setStep(11);
                      }}
                      className={`rounded-lg border p-4 text-left text-sm transition-all hover:border-primary hover:bg-primary/5 ${
                        watch("timeline") === t.value
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Q11: Additional comments */}
            {step === 11 && (
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Any additional comments? (optional)
                </Label>
                <Textarea
                  placeholder="Tell us anything else that might help us serve you better..."
                  rows={4}
                  {...register("additional_comments")}
                />
              </div>
            )}

            {/* Step 12: Legal Consents */}
            {step === 12 && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="consent_data"
                    checked={watch("consent_data_processing")}
                    onCheckedChange={(checked) =>
                      setValue("consent_data_processing", checked === true)
                    }
                  />
                  <Label htmlFor="consent_data" className="text-sm font-normal leading-relaxed">
                    I consent to the processing of my personal data as described
                    in the Privacy Policy.
                  </Label>
                </div>
                {errors.consent_data_processing && (
                  <p className="text-sm text-destructive">{errors.consent_data_processing.message}</p>
                )}

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="consent_images"
                    checked={watch("consent_image_usage")}
                    onCheckedChange={(checked) =>
                      setValue("consent_image_usage", checked === true)
                    }
                  />
                  <Label htmlFor="consent_images" className="text-sm font-normal leading-relaxed">
                    I authorize the use of property images for marketing
                    purposes.
                  </Label>
                </div>
                {errors.consent_image_usage && (
                  <p className="text-sm text-destructive">{errors.consent_image_usage.message}</p>
                )}

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="consent_mktg"
                    checked={watch("consent_marketing")}
                    onCheckedChange={(checked) =>
                      setValue("consent_marketing", checked === true)
                    }
                  />
                  <Label htmlFor="consent_mktg" className="text-sm font-normal leading-relaxed">
                    I agree to receive marketing communications.
                  </Label>
                </div>
                {errors.consent_marketing && (
                  <p className="text-sm text-destructive">{errors.consent_marketing.message}</p>
                )}

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="consent_third"
                    checked={watch("consent_third_party")}
                    onCheckedChange={(checked) =>
                      setValue("consent_third_party", checked === true)
                    }
                  />
                  <Label htmlFor="consent_third" className="text-sm font-normal leading-relaxed">
                    I consent to sharing data with authorized third-party
                    partners.
                  </Label>
                </div>
                {errors.consent_third_party && (
                  <p className="text-sm text-destructive">{errors.consent_third_party.message}</p>
                )}
              </div>
            )}

            {/* Step 13: Review & Submit */}
            {step === 13 && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-primary/5 p-4">
                  <p className="text-sm font-medium text-primary">
                    Your assigned tier:
                  </p>
                  <p className="mt-1 text-lg font-bold">{getPathLabel()}</p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong>Objective:</strong>{" "}
                    {OBJECTIVES.find((o) => o.value === watch("property_objective"))?.label}
                  </p>
                  <p>
                    <strong>Property type:</strong>{" "}
                    {PROPERTY_TYPES.find((t) => t.value === watch("property_type"))?.label}
                  </p>
                  <p>
                    <strong>Properties owned:</strong> {watch("property_count")}
                  </p>
                  {watch("monthly_rent") && (
                    <p>
                      <strong>Monthly rent:</strong> ${watch("monthly_rent")} CAD
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>

          {/* Navigation */}
          <div className="flex justify-between px-6 pb-6">
            {step > 1 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}
            {step === 13 ? (
              <Button type="submit" disabled={loading} className="gap-1">
                {loading ? "Submitting..." : "Submit Discovery Brief"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                className="gap-1"
              >
                {step === 1 && propertyObjective ? "Next" : step > 1 ? "Next" : "Select to continue"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
