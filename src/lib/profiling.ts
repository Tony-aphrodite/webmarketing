import type {
  UserRole,
  PropertyServiceTier,
  EliteTier,
} from "@/types/database";
import { createClient } from "@/lib/supabase/server";

// ═══════════════════════════════════════════════════════
// Owner / Investor Classification
// ═══════════════════════════════════════════════════════

export function classifyOwner(propertyCount: number): {
  role: UserRole;
  serviceTier: PropertyServiceTier;
} {
  if (propertyCount >= 4) {
    return { role: "inversionista", serviceTier: "elite" };
  } else if (propertyCount >= 2) {
    return { role: "propietario_preferido", serviceTier: "preferred_owners" };
  }
  return { role: "propietario", serviceTier: "basic" };
}

export function classifyEliteTier(avgMonthlyRent: number): EliteTier {
  if (avgMonthlyRent >= 7001) return "lujo";
  if (avgMonthlyRent >= 4000) return "signature";
  return "essentials"; // $2,500 – $3,999
}

// CFP = Monthly Rent × 10%
export function calculateCFP(monthlyRent: number): number {
  return monthlyRent * 0.1;
}

// Payback = Plan Fee / CFP per month
export function calculatePayback(
  planFee: number,
  cfpMonthly: number
): number {
  if (cfpMonthly <= 0) return Infinity;
  return planFee / cfpMonthly;
}

// ═══════════════════════════════════════════════════════
// Tenant Premium Classification (8 criteria)
// ═══════════════════════════════════════════════════════

export interface TenantCriteriaInput {
  employment_type: string | null;
  employment_verifiable: boolean;
  max_budget: number | null;
  preferred_amenities: string[];
  prefers_urban_zone: boolean;
  bedrooms_needed: number | null;
  smart_home_interest: boolean;
  style_preference: string | null;
  furnished: boolean;
  contract_duration: string | null;
}

export function countPremiumCriteria(data: TenantCriteriaInput): number {
  let count = 0;

  // 1. Stable employment (verifiable)
  if (
    (data.employment_type === "full_time" ||
      data.employment_type === "self_employed") &&
    data.employment_verifiable
  ) {
    count++;
  }

  // 2. Budget >= $2,500 CAD/month
  if (data.max_budget != null && data.max_budget >= 2500) count++;

  // 3. Seeks premium amenities
  const premiumAmenities = [
    "Gym",
    "Pool",
    "Rooftop",
    "Coworking",
    "Jacuzzi",
    "Private parking",
    "Sauna",
  ];
  if (data.preferred_amenities.some((a) => premiumAmenities.includes(a))) {
    count++;
  }

  // 4. Preferred urban zones
  if (data.prefers_urban_zone) count++;

  // 5. Needs 2-4 bedrooms
  if (
    data.bedrooms_needed != null &&
    data.bedrooms_needed >= 2 &&
    data.bedrooms_needed <= 4
  ) {
    count++;
  }

  // 6. Interested in smart home features
  if (data.smart_home_interest) count++;

  // 7. Modern/contemporary style preference
  if (
    data.style_preference === "modern" ||
    data.style_preference === "elegant"
  ) {
    count++;
  }

  // 8. Contract duration 12-24 months
  if (
    data.contract_duration === "12_months" ||
    data.contract_duration === "12_24_months" ||
    data.contract_duration === "24_months"
  ) {
    count++;
  }

  return count;
}

export function isPremiumTenant(criteriaCount: number): boolean {
  return criteriaCount >= 3;
}

// ═══════════════════════════════════════════════════════
// Full Profiling Runners (server-side)
// ═══════════════════════════════════════════════════════

/**
 * Run owner profiling: classify role, tier, elite sub-tier, CFP, payback.
 * Updates profiles + all properties for the given user.
 */
export async function profileOwner(userId: string) {
  const supabase = await createClient();

  // 1. Count properties
  const { data: properties } = await supabase
    .from("properties")
    .select("id, monthly_rent")
    .eq("owner_id", userId);

  const propertyCount = properties?.length ?? 0;
  if (propertyCount === 0) return null;

  // 2. Classify role + tier
  const { role, serviceTier } = classifyOwner(propertyCount);

  // 3. Elite sub-tier (if 4+ properties)
  let eliteTier: EliteTier | null = null;
  let avgRent = 0;
  if (serviceTier === "elite" && properties) {
    const rents = properties
      .map((p) => Number(p.monthly_rent) || 0)
      .filter((r) => r > 0);
    avgRent = rents.length > 0 ? rents.reduce((a, b) => a + b, 0) / rents.length : 0;
    eliteTier = classifyEliteTier(avgRent);
  }

  // 4. Update each property: service_tier, elite_tier, cfp_monthly
  if (properties) {
    for (const prop of properties) {
      const rent = Number(prop.monthly_rent) || 0;
      const cfp = calculateCFP(rent);
      await supabase
        .from("properties")
        .update({
          service_tier: serviceTier,
          elite_tier: serviceTier === "elite" ? eliteTier : null,
          cfp_monthly: cfp,
        })
        .eq("id", prop.id);
    }
  }

  // 5. Update profile: role, property_count
  await supabase
    .from("profiles")
    .update({
      role,
      property_count: propertyCount,
    })
    .eq("id", userId);

  return {
    role,
    serviceTier,
    eliteTier,
    propertyCount,
    avgRent,
  };
}

/**
 * Run tenant profiling: count premium criteria, update preferences + profile.
 */
export async function profileTenant(userId: string) {
  const supabase = await createClient();

  // 1. Get latest tenant preferences
  const { data: prefs } = await supabase
    .from("tenant_preferences")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!prefs) return null;

  // 2. Count premium criteria
  const criteriaCount = countPremiumCriteria({
    employment_type: prefs.employment_type,
    employment_verifiable: prefs.employment_verifiable,
    max_budget: prefs.max_budget ? Number(prefs.max_budget) : null,
    preferred_amenities: prefs.preferred_amenities || [],
    prefers_urban_zone: prefs.prefers_urban_zone,
    bedrooms_needed: prefs.bedrooms_needed ? Number(prefs.bedrooms_needed) : null,
    smart_home_interest: prefs.smart_home_interest,
    style_preference: prefs.style_preference,
    furnished: prefs.furnished ?? false,
    contract_duration: prefs.contract_duration,
  });

  const premium = isPremiumTenant(criteriaCount);

  // 3. Update tenant_preferences
  await supabase
    .from("tenant_preferences")
    .update({
      premium_criteria_count: criteriaCount,
      is_premium: premium,
    })
    .eq("id", prefs.id);

  // 4. Sync to profiles
  const role: UserRole = premium ? "inquilino_premium" : "inquilino";
  await supabase
    .from("profiles")
    .update({
      role,
      is_premium_tenant: premium,
      premium_criteria_met: criteriaCount,
    })
    .eq("id", userId);

  return { criteriaCount, premium, role };
}
