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
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Crown,
  Zap,
  ArrowRight,
  Star,
  Building2,
  MapPin,
} from "lucide-react";
import { CheckoutButton } from "@/components/checkout/checkout-button";

// ─── Owner Service Tiers ─────────────────────────────
const OWNER_TIERS: Record<
  string,
  {
    name: string;
    tagline: string;
    features: string[];
    plans: {
      name: string;
      pricing: string;
      details: string[];
      cta: string;
    }[];
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  basic: {
    name: "Basic",
    tagline: "Marketing that maximizes your profitability — your property, your money",
    features: [
      "Marketing campaign per property until tenant found (~16 days avg.)",
      "Client-uploaded photos with validation",
      "Visual recommendations prior to listing",
      "Unit verification (on-site visit)",
      "Tenant credit screening",
      "RTB-1 (BC) contract drafting & signing",
    ],
    plans: [
      {
        name: "Low Price",
        pricing: "35% of first month's rent (one-time)",
        details: [
          "$200 system fee upfront (deducted from the 35%)",
          "Pay the balance only after tenant signs the lease",
          "No monthly commissions",
          "Optional: +$100 for priority listing placement (1 month)",
        ],
        cta: "Choose & Secure Your Income",
      },
      {
        name: "Founders Package — Visionary Owners",
        pricing: "30% of first month's rent (one-time, lifetime rate)",
        details: [
          "Exclusive rate for the first 20 owners — limited spots",
          "$200 system fee upfront (deducted from the 30%)",
          "Pay the balance only after tenant signs the lease",
          "No monthly commissions",
          "Ideal for short-term rentals (weekly, monthly, up to 6 months)",
        ],
        cta: "Trust & Earn",
      },
    ],
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  preferred_owners: {
    name: "Preferred Owners",
    tagline: "Enhanced services for growing property portfolios (2–3 properties)",
    features: [
      "Marketing campaign per property until tenant found (~15 days avg.)",
      "Client-uploaded photos",
      "Weekly interested-parties report",
      "Priority credit analysis of best applicants",
      "Full credit screening of tenants",
      "Unit handover with inventory checklist",
      "RTB-1 (BC) contract drafting & signing",
    ],
    plans: [
      {
        name: "Support Tier",
        pricing: "30% 1st property / 28% 2nd & 3rd (one-time each)",
        details: [
          "$200 system fee per property upfront (deducted from %)",
          "Pay the balance only after tenant signs the lease",
          "No monthly commissions",
        ],
        cta: "Get Support",
      },
      {
        name: "Premier Tier",
        pricing: "Same rates with flexible installment payments",
        details: [
          "For owners committing 1.5+ years",
          "1st property: 30% — $200 upfront, balance at month 2 after lease signing",
          "2nd & 3rd: 28% — $200 upfront, 50% at month 1, 30% at month 2, 20% at month 3",
        ],
        cta: "Go Premier",
      },
    ],
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  elite: {
    name: "Elite Assets & Legacy",
    tagline: "Full-service management for investment portfolios (4+ properties)",
    features: [
      "Targeted marketing campaign per property (~15 days avg.)",
      "Professional 3D photography & virtual tour",
      "Interior design recommendations",
      "360° tenant verification (credit + behavioral references)",
      "Priority search positioning",
      "On-site unit verification & showing",
      "Handover with detailed checklist",
      "RTB-1 (BC) contract drafting & signing",
      "Free rent price optimization",
      "Free event packages (concerts, sports, seasonal)",
      "KPI performance report per property",
      "Local vendor alliances for repairs & maintenance",
      "Premium portal listing + targeted campaigns",
      "Expansion & wealth growth analysis",
      "Premium tenant welcome program",
      "Satisfaction surveys to reduce turnover",
    ],
    plans: [
      {
        name: "Asset Management",
        pricing: "Portfolio-based pricing (Essentials / Signature / Lujo)",
        details: [
          "Single plan with 3 investment portfolios based on rent level",
          "Includes CFP (Cash Flow Preserved) calculation per property",
          "Includes Payback period calculation per property",
        ],
        cta: "Manage My Assets",
      },
    ],
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
};

// ─── Elite Sub-Tiers ────────────────────────────────
const ELITE_SUB_TIERS: Record<
  string,
  { name: string; description: string; extras: string[] }
> = {
  essentials: {
    name: "Essentials",
    description: "Avg. rent $2,500 – $3,999 CAD",
    extras: [
      "Quarterly portfolio review",
      "Basic revenue optimization",
    ],
  },
  signature: {
    name: "Signature",
    description: "Avg. rent $4,000 – $7,000 CAD",
    extras: [
      "Monthly portfolio review",
      "Advanced revenue optimization",
      "Premium market positioning",
    ],
  },
  lujo: {
    name: "Lujo",
    description: "Avg. rent $7,001+ CAD",
    extras: [
      "Weekly portfolio review",
      "White-glove concierge service",
      "Luxury market positioning",
      "International investor network",
    ],
  },
};

// ─── PYMES Plans ─────────────────────────────────────
const PYMES_PLANS: Record<
  string,
  {
    name: string;
    price: string;
    upfront: string;
    installment: string;
    duration: string;
    tagline: string;
    features: string[];
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  rescue: {
    name: "Rescue",
    price: "$1,500 CAD",
    upfront: "$750 CAD upfront",
    installment: "$375 CAD × 2 payments",
    duration: "Minimum 2.5 months",
    tagline: "Intensive intervention plan to exit critical mode and move to growth",
    features: [
      "Complete diagnosis",
      "Basic optimization (Google, Social Media, SEO)",
      "Lead capture structure",
      "Direct advisory",
    ],
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  growth: {
    name: "Growth",
    price: "$2,500 CAD",
    upfront: "$1,250 CAD upfront",
    installment: "$625 CAD × 2 payments",
    duration: "Minimum 4–5 months",
    tagline: "Plan to overcome stagnation, correct weaknesses and start growing",
    features: [
      "Complete diagnosis",
      "Marketing strategy",
      "Conversion optimization",
      "Campaign structure",
      "Lead tracking",
    ],
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  scale: {
    name: "Scale",
    price: "$3,800 CAD",
    upfront: "$1,520 CAD upfront",
    installment: "$570 CAD × 4 payments",
    duration: "Minimum 6 months",
    tagline: "Plan to scale and maximize revenue",
    features: [
      "Complete diagnosis",
      "Advanced optimization",
      "Channel expansion",
      "Growth strategy",
      "Opportunity analysis",
    ],
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
};

export default async function ServicesPage() {
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

  const isOwnerRole =
    profile.role === "propietario" ||
    profile.role === "propietario_preferido" ||
    profile.role === "inversionista";

  const isTenantRole =
    profile.role === "inquilino" || profile.role === "inquilino_premium";

  const isPymesRole = profile.role === "pymes";

  // ─── Owner data ────────────────────────────────
  let ownerTier: string | null = null;
  let propertyCount = 0;
  let totalCFP = 0;
  let ownerProperties: {
    id: string;
    property_type: string;
    address: string;
    city: string;
    monthly_rent: number | null;
    service_tier: string | null;
    elite_tier: string | null;
    cfp_monthly: number | null;
    payback_months: number | null;
  }[] = [];

  if (isOwnerRole) {
    const { data: properties } = await supabase
      .from("properties")
      .select("id, property_type, address, city, monthly_rent, service_tier, elite_tier, cfp_monthly, payback_months")
      .eq("owner_id", user.id);

    propertyCount = properties?.length ?? 0;

    if (properties && properties.length > 0) {
      ownerTier = properties[0].service_tier;
      ownerProperties = properties;
      totalCFP = properties.reduce(
        (sum, p) => sum + (Number(p.cfp_monthly) || 0),
        0
      );
    } else {
      // Fallback: derive from property count on profile
      if (profile.property_count >= 4) ownerTier = "elite";
      else if (profile.property_count >= 2) ownerTier = "preferred_owners";
      else if (profile.property_count >= 1) ownerTier = "basic";
    }
  }

  // ─── PYMES data ────────────────────────────────
  let pymesPlan: string | null = null;
  let pymesPlanRecord: { id: string; plan_type: string } | null = null;

  if (isPymesRole) {
    const { data: diagnosis } = await supabase
      .from("pymes_diagnosis")
      .select("recommended_plan")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    pymesPlan = diagnosis?.recommended_plan || null;

    if (pymesPlan) {
      const { data: planRecord } = await supabase
        .from("pymes_plans")
        .select("id, plan_type")
        .eq("plan_type", pymesPlan)
        .eq("is_active", true)
        .limit(1)
        .single();

      pymesPlanRecord = planRecord;
    }
  }

  // ─── Tenant data: matched properties ────────────
  let matchedProperties: {
    id: string;
    property_type: string;
    address: string;
    city: string;
    monthly_rent: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    amenities: string[] | null;
    is_available: boolean;
    matchScore: number;
  }[] = [];

  if (isTenantRole) {
    const { matchPropertiesForTenant } = await import("@/lib/profiling");
    matchedProperties = await matchPropertiesForTenant(user.id);
  }

  // ─── General services ──────────────────────────
  const { data: allServices } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("category");

  // Filter services relevant to user role
  const relevantServices = allServices?.filter((s) => {
    if (!s.target_roles || s.target_roles.length === 0) return true;
    return s.target_roles.includes(profile.role);
  });

  const otherServices = allServices?.filter((s) => {
    if (!s.target_roles || s.target_roles.length === 0) return false;
    return !s.target_roles.includes(profile.role);
  });

  // ─── Owner tier details ────────────────────────
  const tierDetails = ownerTier ? OWNER_TIERS[ownerTier] : null;

  // ─── PYMES plan details ────────────────────────
  const pymesPlanDetails = pymesPlan ? PYMES_PLANS[pymesPlan] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="text-muted-foreground">
          Services recommended for your profile
        </p>
      </div>

      {/* ═══ Owner: Service Tier Card ═══ */}
      {isOwnerRole && tierDetails && (
        <div className="space-y-4">
          <Card className={`${tierDetails.borderColor} ${tierDetails.bgColor}`}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className={`h-5 w-5 ${tierDetails.color}`} />
                <CardTitle className="text-lg">
                  Your Service: {tierDetails.name}
                </CardTitle>
              </div>
              <CardDescription>{tierDetails.tagline}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  className={`${tierDetails.bgColor} ${tierDetails.color} border ${tierDetails.borderColor} text-sm px-3 py-1`}
                >
                  {tierDetails.name}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Based on {propertyCount}{" "}
                  {propertyCount === 1 ? "property" : "properties"}
                </span>
                {totalCFP > 0 && (
                  <span className="text-sm text-muted-foreground">
                    &middot; Total CFP: ${totalCFP.toFixed(2)} CAD/mo
                  </span>
                )}
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Service includes:</p>
                <ul className="space-y-1.5">
                  {tierDetails.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2
                        className={`mt-0.5 h-4 w-4 shrink-0 ${tierDetails.color}`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Elite: Per-property Portfolio + CFP/Payback */}
              {ownerTier === "elite" && ownerProperties.length > 0 && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium">Property Portfolio Breakdown</p>
                  {ownerProperties.map((prop) => {
                    const rent = Number(prop.monthly_rent) || 0;
                    const cfpMonthly = Number(prop.cfp_monthly) || rent * 0.1;
                    const cfpAnnual = cfpMonthly * 12;
                    const cfp5yr = cfpAnnual * 5;
                    const payback = prop.payback_months ? Number(prop.payback_months) : null;
                    const portfolio = prop.elite_tier
                      ? ELITE_SUB_TIERS[prop.elite_tier]
                      : null;

                    return (
                      <div key={prop.id} className="rounded-lg border bg-card p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium">
                              {prop.property_type} — {prop.city}
                            </p>
                            <p className="text-xs text-muted-foreground">{prop.address}</p>
                          </div>
                          {portfolio && (
                            <Badge className="bg-amber-50 text-amber-600 border border-amber-200">
                              {portfolio.name}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Rent</p>
                            <p className="text-sm font-semibold">
                              ${rent.toLocaleString()} CAD/mo
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">CFP Monthly</p>
                            <p className="text-sm font-semibold text-emerald-600">
                              ${cfpMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">CFP Annual</p>
                            <p className="text-sm font-semibold text-emerald-600">
                              ${cfpAnnual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">CFP 5 Years</p>
                            <p className="text-sm font-semibold text-emerald-600">
                              ${cfp5yr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                        {payback != null && (
                          <div className="mt-2 flex items-center gap-2 rounded-md bg-primary/5 px-3 py-1.5">
                            <Zap className="h-4 w-4 text-primary" />
                            <p className="text-sm">
                              <span className="font-medium">Payback:</span>{" "}
                              {payback.toFixed(1)} months
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3">
                    <p className="text-sm font-medium text-emerald-700">
                      Total Portfolio CFP: ${totalCFP.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CAD/mo
                      &middot; ${(totalCFP * 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} CAD/yr
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ═══ Owner: Available Plans ═══ */}
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Available Plans
          </h2>
          <div className={`grid gap-4 ${tierDetails.plans.length > 1 ? "md:grid-cols-2" : ""}`}>
            {tierDetails.plans.map((plan, i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription className={`text-base font-semibold ${tierDetails.color}`}>
                    {plan.pricing}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <ul className="space-y-1.5">
                    {plan.details.map((detail, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <div className="p-6 pt-0">
                  <Link
                    href="/dashboard/services#contact"
                    className={cn(buttonVariants(), "w-full gap-2")}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Owner: No tier yet ═══ */}
      {isOwnerRole && !tierDetails && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-8 text-center">
            <Crown className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No service tier assigned yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete your Discovery Brief to get your service tier.
            </p>
            <Link
              href="/forms/propietario"
              className={buttonVariants({ className: "mt-4" })}
            >
              Complete Discovery Brief
            </Link>
          </CardContent>
        </Card>
      )}

      {/* ═══ PYMES: Recommended Plan ═══ */}
      {isPymesRole && pymesPlanDetails && (
        <Card
          className={`${pymesPlanDetails.borderColor} ${pymesPlanDetails.bgColor}`}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className={`h-5 w-5 ${pymesPlanDetails.color}`} />
              <CardTitle className="text-lg">
                Your Recommended Plan: {pymesPlanDetails.name}
              </CardTitle>
            </div>
            <CardDescription>{pymesPlanDetails.tagline}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <span
                className={`text-3xl font-bold ${pymesPlanDetails.color}`}
              >
                {pymesPlanDetails.price}
              </span>
              <p className="text-xs text-muted-foreground">
                {pymesPlanDetails.upfront} + {pymesPlanDetails.installment}
              </p>
              <p className="text-xs text-muted-foreground">
                {pymesPlanDetails.duration}
              </p>
            </div>
            <ul className="space-y-1.5">
              {pymesPlanDetails.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2
                    className={`mt-0.5 h-4 w-4 shrink-0 ${pymesPlanDetails.color}`}
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 sm:flex-row">
              {pymesPlanRecord ? (
                <CheckoutButton
                  type="pymes_upfront"
                  pymesPlanId={pymesPlanRecord.id}
                  label={`Pay ${pymesPlanDetails.upfront}`}
                  className="flex-1"
                />
              ) : (
                <Link
                  href="/dashboard/services#contact"
                  className={cn(buttonVariants(), "flex-1 gap-2")}
                >
                  Start Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              <Link
                href="/dashboard/services#contact"
                className={cn(buttonVariants({ variant: "outline" }), "flex-1 gap-2")}
              >
                Schedule a Consultation
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ PYMES: No plan ═══ */}
      {isPymesRole && !pymesPlanDetails && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-8 text-center">
            <Zap className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No plan assigned yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Take the Sales Leak Diagnosis to get your recommended plan.
            </p>
            <Link
              href="/forms/pymes"
              className={buttonVariants({ className: "mt-4" })}
            >
              Start Diagnosis
            </Link>
          </CardContent>
        </Card>
      )}

      {/* ═══ Tenant: Premium Status ═══ */}
      {isTenantRole && (
        <Card
          className={
            profile.is_premium_tenant
              ? "border-amber-200 bg-amber-50"
              : "border-blue-200 bg-blue-50"
          }
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown
                className={`h-5 w-5 ${
                  profile.is_premium_tenant
                    ? "text-amber-600"
                    : "text-blue-600"
                }`}
              />
              <CardTitle className="text-lg">
                {profile.is_premium_tenant
                  ? "Premium Tenant Services"
                  : "Standard Tenant Services"}
              </CardTitle>
            </div>
            <CardDescription>
              {profile.is_premium_tenant
                ? "You qualify for priority matching and premium property access"
                : "Update your preferences to unlock Premium Tenant benefits (3+ of 8 criteria required)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge
                className={
                  profile.is_premium_tenant
                    ? "bg-amber-50 text-amber-600 border border-amber-200"
                    : "bg-blue-50 text-blue-600 border border-blue-200"
                }
              >
                {profile.is_premium_tenant
                  ? "Premium Tenant"
                  : "Standard Tenant"}
              </Badge>
              {profile.premium_criteria_met != null && (
                <span className="text-sm text-muted-foreground">
                  {profile.premium_criteria_met} of 8 criteria met
                </span>
              )}
            </div>
            {profile.is_premium_tenant && (
              <ul className="mt-3 space-y-1.5">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  Premium property matching
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  Concierge service
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  Priority viewing schedules
                </li>
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* ═══ Tenant: Matched Properties ═══ */}
      {isTenantRole && matchedProperties.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Properties Matched to Your Preferences
          </h2>
          <p className="text-sm text-muted-foreground">
            Based on your profile, we found {matchedProperties.length}{" "}
            {matchedProperties.length === 1 ? "property" : "properties"} that
            match your preferences.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matchedProperties.map((prop) => (
              <Card key={prop.id} className="overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground">
                  <Building2 className="h-8 w-8" />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg capitalize">
                      {prop.property_type}
                    </CardTitle>
                    <Badge variant="default">Available</Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {prop.city}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {prop.monthly_rent && (
                    <p className="text-lg font-bold">
                      ${Number(prop.monthly_rent).toLocaleString()} CAD/mo
                    </p>
                  )}
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    {prop.bedrooms && <span>{prop.bedrooms} bed</span>}
                    {prop.bathrooms && <span>{prop.bathrooms} bath</span>}
                  </div>
                  {prop.amenities && prop.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {prop.amenities.slice(0, 4).map((a, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {a}
                        </Badge>
                      ))}
                      {prop.amenities.length > 4 && (
                        <Badge variant="secondary" className="text-xs">
                          +{prop.amenities.length - 4}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isTenantRole && matchedProperties.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-8 text-center">
            <Building2 className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-medium">No matching properties yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your preferences so we can find the best properties for you.
            </p>
            <Link
              href="/forms/inquilino"
              className={buttonVariants({ className: "mt-4" })}
            >
              Update Preferences
            </Link>
          </CardContent>
        </Card>
      )}

      {/* ═══ Recommended Services (filtered by role) ═══ */}
      {relevantServices && relevantServices.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Recommended for You
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {relevantServices.map((service) => (
              <Card key={service.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {service.category}
                    </Badge>
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  {service.features && service.features.length > 0 && (
                    <ul className="mb-3 space-y-1 text-sm text-muted-foreground">
                      {service.features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  <span className="text-lg font-bold">
                    ${service.price?.toLocaleString()}{" "}
                    {service.currency || "CAD"}
                  </span>
                </CardContent>
                {service.price > 0 && (
                  <div className="p-6 pt-0">
                    <CheckoutButton
                      type="service"
                      serviceId={service.id}
                      label={`Purchase — $${service.price?.toLocaleString()} ${service.currency || "CAD"}`}
                      className="w-full"
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Other Services ═══ */}
      {otherServices && otherServices.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Other Available Services</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {otherServices.map((service) => (
              <Card key={service.id} className="opacity-75">
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
                      {service.features
                        .slice(0, 3)
                        .map((feature: string, i: number) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="text-primary">&#8226;</span>{" "}
                            {feature}
                          </li>
                        ))}
                      {service.features.length > 3 && (
                        <li className="text-xs text-muted-foreground">
                          +{service.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  )}
                  <span className="text-lg font-bold">
                    ${service.price?.toLocaleString()}{" "}
                    {service.currency || "CAD"}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No services at all */}
      {(!allServices || allServices.length === 0) && !tierDetails && !pymesPlanDetails && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No services available at this time.
          </CardContent>
        </Card>
      )}

      {/* ═══ Contact / Schedule Section ═══ */}
      <div id="contact" id-scroll-margin-top="80" className="scroll-mt-20">
        <Card className="border-primary/20">
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            <h2 className="text-xl font-bold">Ready to Get Started?</h2>
            <p className="max-w-lg text-sm text-muted-foreground">
              Our team will contact you to review your profile, answer questions,
              and finalize the best plan for your needs. No obligation.
            </p>
            <Link
              href="/api/contact"
              className={cn(buttonVariants({ size: "lg" }), "gap-2")}
            >
              Schedule a Free Consultation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
