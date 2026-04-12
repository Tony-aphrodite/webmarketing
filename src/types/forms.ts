import { z } from "zod";

// ===========================================
// Discovery Brief (Owner / Investor form)
// Typeform-style: 11 questions + consents
// ===========================================
export const discoveryBriefSchema = z.object({
  // Q1: Property objective
  property_objective: z.enum(["rent", "sell", "both", "not_sure"], {
    message: "Please select a property objective",
  }),
  // Q2: Property type
  property_type: z.enum(
    ["apartment", "condo", "house", "townhouse", "duplex", "commercial"],
    { message: "Please select a property type" }
  ),
  // Q3: Current state
  current_state: z.enum(
    ["occupied", "vacant", "under_renovation", "new_construction"],
    { message: "Please select the current state" }
  ),
  // Q4: Monthly rent (conditional, if rental)
  monthly_rent: z.coerce.number().positive("Must be greater than 0").optional(),
  // Q5: Main challenge
  main_challenge: z.enum(
    [
      "find_tenants",
      "improve_visibility",
      "increase_value",
      "manage_portfolio",
      "other",
    ],
    { message: "Please select your main challenge" }
  ),
  // Q6: How many properties?
  property_count: z.coerce
    .number()
    .int()
    .min(1, "Must own at least 1 property"),
  // Q7: Has professional photos?
  has_professional_photos: z.boolean().default(false),
  // Q8: Currently listed where?
  current_listings: z.array(z.string()).default([]),
  // Q9: Monthly marketing budget
  marketing_budget: z
    .enum(["under_500", "500_1000", "1000_2500", "2500_5000", "over_5000"])
    .optional(),
  // Q10: Timeline
  timeline: z
    .enum(["immediate", "1_3_months", "3_6_months", "no_rush"])
    .optional(),
  // Q11: Additional comments
  additional_comments: z.string().optional(),

  // Legal consents (all 4 required)
  consent_data_processing: z.boolean().refine((v) => v === true, {
    message: "You must consent to data processing",
  }),
  consent_image_usage: z.boolean().refine((v) => v === true, {
    message: "You must consent to image usage",
  }),
  consent_marketing: z.boolean().refine((v) => v === true, {
    message: "You must consent to marketing communications",
  }),
  consent_third_party: z.boolean().refine((v) => v === true, {
    message: "You must consent to third-party data sharing",
  }),
});

export type DiscoveryBriefData = z.infer<typeof discoveryBriefSchema>;

// ===========================================
// Tenant Form (with 8 premium criteria)
// ===========================================
export const tenantFormSchema = z.object({
  // Basic preferences
  preferred_city: z.string().default("Montreal"),
  preferred_zones: z.array(z.string()).default([]),
  min_budget: z.coerce.number().positive("Minimum budget must be greater than 0"),
  max_budget: z.coerce.number().positive("Maximum budget must be greater than 0"),
  bedrooms_needed: z.coerce.number().int().min(1, "At least 1 bedroom required"),
  bathrooms_needed: z.coerce.number().int().min(1).optional(),
  move_in_date: z.string().min(1, "Move-in date is required"),

  // Premium classification criteria (8 fields)
  employment_type: z.enum(
    ["employed_stable", "self_employed", "student", "retired", "other"],
    { message: "Please select employment type" }
  ),
  employment_verifiable: z.boolean().default(false),
  seeks_premium_amenities: z.boolean().default(false),
  preferred_amenities: z.array(z.string()).default([]),
  prefers_urban_zone: z.boolean().default(false),
  smart_home_interest: z.boolean().default(false),
  style_preference: z
    .enum(["modern", "classic", "minimalist", "industrial", "other"])
    .optional(),
  contract_duration: z.enum(
    ["6_months", "12_months", "18_months", "24_months"],
    { message: "Please select contract duration" }
  ),

  // Other
  pet_friendly: z.boolean().default(false),
  parking_needed: z.boolean().default(false),
  additional_requirements: z.string().optional(),

  // Consents (2-level)
  consent_data_processing: z.boolean().refine((v) => v === true, {
    message: "You must consent to data processing",
  }),
  consent_marketing: z.boolean().default(false), // Optional second level
});

export type TenantFormData = z.infer<typeof tenantFormSchema>;

// ===========================================
// PYMES Sales Leak Calculator
// 7 questions on 1-5 Likert scale
// ===========================================
export const pymesCalculatorSchema = z.object({
  // Company info
  company_name: z.string().min(2, "Company name is required"),
  sector: z.enum(
    [
      "retail",
      "services",
      "technology",
      "food_beverage",
      "health",
      "education",
      "construction",
      "other",
    ],
    { message: "Please select a sector" }
  ),
  monthly_revenue: z.coerce
    .number()
    .positive("Monthly revenue must be greater than 0"),

  // 7 diagnostic questions (1-5 scale each)
  // Block 1: Digital Visibility
  q1_online_presence: z.coerce.number().min(1).max(5),
  q2_seo_positioning: z.coerce.number().min(1).max(5),
  // Block 2: Lead Generation
  q3_lead_generation: z.coerce.number().min(1).max(5),
  q4_lead_conversion: z.coerce.number().min(1).max(5),
  // Block 3: Retention & Loyalty
  q5_client_retention: z.coerce.number().min(1).max(5),
  q6_repeat_purchases: z.coerce.number().min(1).max(5),
  // Block 4: Marketing Strategy
  q7_marketing_strategy: z.coerce.number().min(1).max(5),
});

export type PymesCalculatorData = z.infer<typeof pymesCalculatorSchema>;
