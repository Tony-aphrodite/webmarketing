import { z } from "zod";

export const ownerFormSchema = z.object({
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  description: z.string().min(20, "La descripción debe tener al menos 20 caracteres"),
  property_type: z.enum(
    ["apartamento", "casa", "oficina", "local", "terreno", "bodega"],
    { message: "Seleccione un tipo de propiedad" }
  ),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  city: z.string().min(2, "La ciudad es requerida"),
  state: z.string().optional(),
  price: z.coerce.number().positive("El precio debe ser mayor a 0"),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  area_sqm: z.coerce.number().positive("El área debe ser mayor a 0").optional(),
  amenities: z.array(z.string()).default([]),
});

export type OwnerFormData = z.infer<typeof ownerFormSchema>;

export const tenantFormSchema = z.object({
  preferred_city: z.string().min(2, "La ciudad es requerida"),
  preferred_zone: z.string().optional(),
  min_budget: z.coerce.number().positive("El presupuesto mínimo debe ser mayor a 0"),
  max_budget: z.coerce.number().positive("El presupuesto máximo debe ser mayor a 0"),
  bedrooms_needed: z.coerce.number().int().min(1, "Debe ser al menos 1 habitación"),
  move_in_date: z.string().min(1, "La fecha de mudanza es requerida"),
  pet_friendly: z.boolean().default(false),
  parking_needed: z.boolean().default(false),
  additional_requirements: z.string().optional(),
});

export type TenantFormData = z.infer<typeof tenantFormSchema>;

export const pymesFormSchema = z.object({
  company_name: z.string().min(2, "El nombre de la empresa es requerido"),
  sector: z.enum(
    ["retail", "servicios", "tecnologia", "gastronomia", "salud", "educacion", "construccion", "otro"],
    { message: "Seleccione un sector" }
  ),
  employee_count: z.enum(["1-5", "6-20", "21-50", "51+"], {
    message: "Seleccione el número de empleados",
  }),
  monthly_revenue: z.enum(
    ["menos_5k", "5k_20k", "20k_50k", "50k_100k", "mas_100k"],
    { message: "Seleccione el rango de ingresos" }
  ),
  has_website: z.boolean().default(false),
  has_social_media: z.boolean().default(false),
  social_media_platforms: z.array(z.string()).default([]),
  current_marketing_channels: z.array(z.string()).default([]),
  marketing_budget: z.enum(
    ["ninguno", "menos_500", "500_2000", "2000_5000", "mas_5000"],
    { message: "Seleccione el presupuesto de marketing" }
  ),
  main_challenge: z.enum(
    ["atraer_clientes", "retener_clientes", "presencia_digital", "automatizar_procesos", "aumentar_ventas", "branding"],
    { message: "Seleccione el desafío principal" }
  ),
  business_goals: z
    .array(z.string())
    .min(1, "Seleccione al menos un objetivo"),
});

export type PymesFormData = z.infer<typeof pymesFormSchema>;
