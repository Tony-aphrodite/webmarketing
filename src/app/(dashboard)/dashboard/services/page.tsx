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
} from "lucide-react";

// ─── Owner Service Tiers ─────────────────────────────
const OWNER_TIERS: Record<
  string,
  {
    name: string;
    tagline: string;
    features: string[];
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  basic: {
    name: "Basic",
    tagline: "Essential property management for single-property owners",
    features: [
      "Professional property listing",
      "Tenant screening & matching",
      "Basic photography guidance",
      "Standard listing optimization",
      "Email support",
    ],
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  preferred_owners: {
    name: "Preferred Owners",
    tagline: "Enhanced services for growing property portfolios",
    features: [
      "Everything in Basic, plus:",
      "Professional photography session",
      "Priority tenant matching",
      "Multi-property dashboard",
      "Market analysis reports",
      "Priority email & chat support",
    ],
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  elite: {
    name: "Elite Assets & Legacy",
    tagline: "Full-service management for investment portfolios",
    features: [
      "Everything in Preferred, plus:",
      "Dedicated account manager",
      "Premium photography & virtual tours",
      "Revenue optimization strategy",
      "Legal compliance review",
      "Quarterly portfolio analysis",
      "Concierge-level support",
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
    installment: "$250 CAD/mo × 3 months",
    duration: "Minimum 30 days",
    tagline: "Emergency digital rescue for critical gaps",
    features: [
      "Emergency digital audit",
      "Google Business Profile optimization",
      "Basic SEO correction",
      "Social media rescue (2 platforms)",
      "30-day action plan",
    ],
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  growth: {
    name: "Growth",
    price: "$2,500 CAD",
    upfront: "$1,000 CAD upfront",
    installment: "$375 CAD/mo × 4 months",
    duration: "Minimum 90 days",
    tagline: "Comprehensive growth strategy for scaling businesses",
    features: [
      "Complete digital audit",
      "Website optimization or landing page",
      "SEO strategy (on-page + local)",
      "Social media management (3 platforms)",
      "Google Ads basic campaign",
      "Monthly performance reports",
      "90-day growth roadmap",
    ],
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  scale: {
    name: "Scale",
    price: "$3,800 CAD",
    upfront: "$1,500 CAD upfront",
    installment: "$460 CAD/mo × 5 months",
    duration: "Minimum 6 months",
    tagline: "Full digital transformation for market leaders",
    features: [
      "Full digital transformation audit",
      "Website redesign or new build",
      "Advanced SEO (on-page + off-page + technical)",
      "Social media management (all platforms)",
      "Google Ads + Meta Ads campaigns",
      "Email marketing automation",
      "CRM integration",
      "Conversion rate optimization",
      "Monthly strategy sessions",
      "6-month scaling roadmap",
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
  let eliteTier: string | null = null;
  let propertyCount = 0;
  let totalCFP = 0;

  if (isOwnerRole) {
    const { data: properties } = await supabase
      .from("properties")
      .select("service_tier, elite_tier, cfp_monthly, monthly_rent")
      .eq("owner_id", user.id);

    propertyCount = properties?.length ?? 0;

    if (properties && properties.length > 0) {
      ownerTier = properties[0].service_tier;
      eliteTier = properties[0].elite_tier;
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

  if (isPymesRole) {
    const { data: diagnosis } = await supabase
      .from("pymes_diagnosis")
      .select("recommended_plan")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    pymesPlan = diagnosis?.recommended_plan || null;
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
  const eliteDetails = eliteTier
    ? ELITE_SUB_TIERS[eliteTier]
    : null;

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
        <Card className={`${tierDetails.borderColor} ${tierDetails.bgColor}`}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className={`h-5 w-5 ${tierDetails.color}`} />
              <CardTitle className="text-lg">
                Your Service Tier: {tierDetails.name}
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

            {/* Elite sub-tier details */}
            {eliteDetails && (
              <div className="mt-4 rounded-lg border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  <p className="text-sm font-medium">
                    Elite Sub-Tier: {eliteDetails.name}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {eliteDetails.description}
                </p>
                <ul className="space-y-1">
                  {eliteDetails.extras.map((extra, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                      {extra}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
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
            <Link
              href="/dashboard/services"
              className={cn(buttonVariants(), "w-full gap-2")}
            >
              Acquire Plan
              <ArrowRight className="h-4 w-4" />
            </Link>
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

      {/* ═══ Recommended Services (filtered by role) ═══ */}
      {relevantServices && relevantServices.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Recommended for You
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {relevantServices.map((service) => (
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
    </div>
  );
}
