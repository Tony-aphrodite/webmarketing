"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { pymesFormSchema, type PymesFormData } from "@/types/forms";
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

const SECTORS = [
  { value: "retail", label: "Retail / Comercio" },
  { value: "servicios", label: "Servicios" },
  { value: "tecnologia", label: "Tecnología" },
  { value: "gastronomia", label: "Gastronomía" },
  { value: "salud", label: "Salud" },
  { value: "educacion", label: "Educación" },
  { value: "construccion", label: "Construcción" },
  { value: "otro", label: "Otro" },
];

const EMPLOYEE_COUNTS = [
  { value: "1-5", label: "1 - 5 empleados" },
  { value: "6-20", label: "6 - 20 empleados" },
  { value: "21-50", label: "21 - 50 empleados" },
  { value: "51+", label: "Más de 50 empleados" },
];

const REVENUE_RANGES = [
  { value: "menos_5k", label: "Menos de $5,000" },
  { value: "5k_20k", label: "$5,000 - $20,000" },
  { value: "20k_50k", label: "$20,000 - $50,000" },
  { value: "50k_100k", label: "$50,000 - $100,000" },
  { value: "mas_100k", label: "Más de $100,000" },
];

const MARKETING_BUDGETS = [
  { value: "ninguno", label: "Sin presupuesto" },
  { value: "menos_500", label: "Menos de $500" },
  { value: "500_2000", label: "$500 - $2,000" },
  { value: "2000_5000", label: "$2,000 - $5,000" },
  { value: "mas_5000", label: "Más de $5,000" },
];

const SOCIAL_PLATFORMS = [
  "Facebook",
  "Instagram",
  "TikTok",
  "LinkedIn",
  "YouTube",
  "Twitter/X",
];

const MARKETING_CHANNELS = [
  { value: "ninguno", label: "Ninguno" },
  { value: "redes_sociales", label: "Redes Sociales" },
  { value: "email", label: "Email Marketing" },
  { value: "google_ads", label: "Google Ads" },
  { value: "seo", label: "SEO" },
  { value: "contenido", label: "Marketing de Contenido" },
  { value: "referidos", label: "Referidos" },
  { value: "publicidad_tradicional", label: "Publicidad Tradicional" },
];

const CHALLENGES = [
  { value: "atraer_clientes", label: "Atraer nuevos clientes" },
  { value: "retener_clientes", label: "Retener clientes existentes" },
  { value: "presencia_digital", label: "Mejorar presencia digital" },
  { value: "automatizar_procesos", label: "Automatizar procesos" },
  { value: "aumentar_ventas", label: "Aumentar ventas" },
  { value: "branding", label: "Fortalecer la marca (branding)" },
];

const BUSINESS_GOALS = [
  "Aumentar ventas online",
  "Generar más leads",
  "Mejorar posicionamiento en Google",
  "Crear presencia en redes sociales",
  "Automatizar marketing",
  "Lanzar campañas publicitarias",
  "Mejorar imagen de marca",
  "Expandir a nuevos mercados",
];

export default function PymesFormPage() {
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
  } = useForm<PymesFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(pymesFormSchema) as any,
    defaultValues: {
      has_website: false,
      has_social_media: false,
      social_media_platforms: [],
      current_marketing_channels: [],
      business_goals: [],
    },
  });

  const hasSocialMedia = watch("has_social_media");
  const socialPlatforms = watch("social_media_platforms");
  const marketingChannels = watch("current_marketing_channels");
  const businessGoals = watch("business_goals");

  async function nextStep() {
    let fieldsToValidate: (keyof PymesFormData)[] = [];
    if (step === 1) fieldsToValidate = ["company_name", "sector", "employee_count", "monthly_revenue"];
    if (step === 2) fieldsToValidate = [];
    if (step === 3) fieldsToValidate = ["marketing_budget"];

    const valid = fieldsToValidate.length === 0 || (await trigger(fieldsToValidate));
    if (valid) setStep(step + 1);
  }

  async function onSubmit(data: PymesFormData) {
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

      const { error: insertError } = await supabase
        .from("pymes_diagnosis")
        .insert({
          user_id: user.id,
          company_name: data.company_name,
          sector: data.sector,
          employee_count: data.employee_count,
          monthly_revenue: data.monthly_revenue,
          has_website: data.has_website,
          has_social_media: data.has_social_media,
          social_media_platforms: data.social_media_platforms,
          current_marketing_channels: data.current_marketing_channels,
          marketing_budget: data.marketing_budget,
          main_challenge: data.main_challenge,
          business_goals: data.business_goals,
        });

      if (insertError) throw insertError;

      // Create lead
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "formulario_pymes" }),
      });

      router.push("/dashboard");
    } catch (err) {
      setError("Error al guardar el diagnóstico. Intente nuevamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico Empresarial</CardTitle>
          <CardDescription>
            Complete el diagnóstico para recibir recomendaciones personalizadas.
            Paso {step} de 4.
          </CardDescription>
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

            {/* Step 1: Company Info */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nombre de la empresa</Label>
                  <Input
                    id="company_name"
                    placeholder="Mi Empresa S.A.S."
                    {...register("company_name")}
                  />
                  {errors.company_name && (
                    <p className="text-sm text-destructive">
                      {errors.company_name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Sector</Label>
                  <Select
                    onValueChange={(val) =>
                      setValue("sector", val as PymesFormData["sector"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {SECTORS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.sector && (
                    <p className="text-sm text-destructive">{errors.sector.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Número de empleados</Label>
                  <Select
                    onValueChange={(val) =>
                      setValue("employee_count", val as PymesFormData["employee_count"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_COUNTS.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {e.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.employee_count && (
                    <p className="text-sm text-destructive">
                      {errors.employee_count.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Ingresos mensuales aproximados</Label>
                  <Select
                    onValueChange={(val) =>
                      setValue("monthly_revenue", val as PymesFormData["monthly_revenue"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el rango" />
                    </SelectTrigger>
                    <SelectContent>
                      {REVENUE_RANGES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.monthly_revenue && (
                    <p className="text-sm text-destructive">
                      {errors.monthly_revenue.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Step 2: Digital Presence */}
            {step === 2 && (
              <>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="has_website"
                    checked={watch("has_website")}
                    onCheckedChange={(checked) =>
                      setValue("has_website", checked === true)
                    }
                  />
                  <Label htmlFor="has_website" className="font-normal">
                    ¿Su empresa tiene sitio web?
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="has_social_media"
                    checked={hasSocialMedia}
                    onCheckedChange={(checked) => {
                      setValue("has_social_media", checked === true);
                      if (!checked) setValue("social_media_platforms", []);
                    }}
                  />
                  <Label htmlFor="has_social_media" className="font-normal">
                    ¿Su empresa tiene presencia en redes sociales?
                  </Label>
                </div>

                {hasSocialMedia && (
                  <div className="space-y-3 rounded-md border p-4">
                    <Label>¿En qué plataformas?</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {SOCIAL_PLATFORMS.map((platform) => (
                        <div key={platform} className="flex items-center gap-2">
                          <Checkbox
                            id={`platform-${platform}`}
                            checked={socialPlatforms.includes(platform)}
                            onCheckedChange={(checked) => {
                              setValue(
                                "social_media_platforms",
                                checked
                                  ? [...socialPlatforms, platform]
                                  : socialPlatforms.filter((p) => p !== platform)
                              );
                            }}
                          />
                          <Label
                            htmlFor={`platform-${platform}`}
                            className="text-sm font-normal"
                          >
                            {platform}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Step 3: Marketing */}
            {step === 3 && (
              <>
                <div className="space-y-3">
                  <Label>Canales de marketing actuales</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {MARKETING_CHANNELS.map((channel) => (
                      <div key={channel.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`channel-${channel.value}`}
                          checked={marketingChannels.includes(channel.value)}
                          onCheckedChange={(checked) => {
                            setValue(
                              "current_marketing_channels",
                              checked
                                ? [...marketingChannels, channel.value]
                                : marketingChannels.filter((c) => c !== channel.value)
                            );
                          }}
                        />
                        <Label
                          htmlFor={`channel-${channel.value}`}
                          className="text-sm font-normal"
                        >
                          {channel.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Presupuesto actual de marketing</Label>
                  <Select
                    onValueChange={(val) =>
                      setValue("marketing_budget", val as PymesFormData["marketing_budget"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      {MARKETING_BUDGETS.map((b) => (
                        <SelectItem key={b.value} value={b.value}>
                          {b.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.marketing_budget && (
                    <p className="text-sm text-destructive">
                      {errors.marketing_budget.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Step 4: Goals */}
            {step === 4 && (
              <>
                <div className="space-y-2">
                  <Label>Principal desafío de su negocio</Label>
                  <Select
                    onValueChange={(val) =>
                      setValue("main_challenge", val as PymesFormData["main_challenge"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el desafío" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHALLENGES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.main_challenge && (
                    <p className="text-sm text-destructive">
                      {errors.main_challenge.message}
                    </p>
                  )}
                </div>
                <div className="space-y-3">
                  <Label>Objetivos de negocio (seleccione al menos uno)</Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {BUSINESS_GOALS.map((goal) => (
                      <div key={goal} className="flex items-center gap-2">
                        <Checkbox
                          id={`goal-${goal}`}
                          checked={businessGoals.includes(goal)}
                          onCheckedChange={(checked) => {
                            setValue(
                              "business_goals",
                              checked
                                ? [...businessGoals, goal]
                                : businessGoals.filter((g) => g !== goal)
                            );
                          }}
                        />
                        <Label
                          htmlFor={`goal-${goal}`}
                          className="text-sm font-normal"
                        >
                          {goal}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.business_goals && (
                    <p className="text-sm text-destructive">
                      {errors.business_goals.message}
                    </p>
                  )}
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
                {loading ? "Enviando..." : "Enviar Diagnóstico"}
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
