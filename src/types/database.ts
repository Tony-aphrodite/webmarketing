export type UserRole = "propietario" | "inquilino" | "pymes" | "admin";
export type LeadStatus = "nuevo" | "contactado" | "en_proceso" | "cerrado";
export type UrgencyLevel = "bajo" | "medio" | "alto" | "critico";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  company_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  property_type: string;
  address: string;
  city: string;
  state: string | null;
  country: string;
  price: number | null;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  amenities: string[];
  images: string[];
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface TenantPreferences {
  id: string;
  user_id: string;
  preferred_city: string | null;
  preferred_zone: string | null;
  min_budget: number | null;
  max_budget: number | null;
  bedrooms_needed: number | null;
  move_in_date: string | null;
  pet_friendly: boolean;
  parking_needed: boolean;
  additional_requirements: string | null;
  created_at: string;
  updated_at: string;
}

export interface PymesDiagnosis {
  id: string;
  user_id: string;
  company_name: string;
  sector: string;
  employee_count: string;
  monthly_revenue: string;
  has_website: boolean;
  has_social_media: boolean;
  social_media_platforms: string[];
  current_marketing_channels: string[];
  marketing_budget: string | null;
  main_challenge: string;
  business_goals: string[];
  urgency_level: UrgencyLevel | null;
  urgency_score: number | null;
  recommendation_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  price: number;
  currency: string;
  is_active: boolean;
  target_roles: UserRole[];
  target_urgency: UrgencyLevel[];
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole | null;
  source: string | null;
  status: LeadStatus;
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  service_id: string | null;
  stripe_session_id: string;
  stripe_payment_intent_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}
