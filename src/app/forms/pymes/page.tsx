"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { pymesCalculatorSchema, type PymesCalculatorData } from "@/types/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { BarChart3, TrendingDown, Users, ArrowRight } from "lucide-react";

const SECTORS = [
  { value: "retail", label: "Retail / Commerce" },
  { value: "services", label: "Services" },
  { value: "technology", label: "Technology" },
  { value: "food_beverage", label: "Food & Beverage" },
  { value: "health", label: "Health & Wellness" },
  { value: "education", label: "Education" },
  { value: "construction", label: "Construction" },
  { value: "other", label: "Other" },
];

const LIKERT_OPTIONS = [
  { value: 1, label: "1 - No / Very poor" },
  { value: 2, label: "2 - Weak" },
  { value: 3, label: "3 - Average" },
  { value: 4, label: "4 - Good" },
  { value: 5, label: "5 - Excellent / Yes" },
];

interface QuestionDef {
  field: keyof PymesCalculatorData;
  block: string;
  question: string;
  helpText: string;
}

const QUESTIONS: QuestionDef[] = [
  {
    field: "q1_online_presence",
    block: "SALES",
    question: "Is your flow of new clients constant and predictable month to month?",
    helpText: "1 = No, very irregular / 5 = Yes, constant and predictable",
  },
  {
    field: "q2_seo_positioning",
    block: "SALES",
    question: "Do you have an automated system to follow up with prospects?",
    helpText: "1 = No system at all / 5 = Yes, fully automated follow-up",
  },
  {
    field: "q3_lead_generation",
    block: "BRAND",
    question: "Is your value proposition so clear that a child would understand it in 10 seconds?",
    helpText: "1 = Not clear at all / 5 = Absolutely clear and compelling",
  },
  {
    field: "q4_lead_conversion",
    block: "BRAND",
    question: "Does your visual identity look more professional than your direct competition?",
    helpText: "1 = No, it looks amateur / 5 = Yes, clearly more professional",
  },
  {
    field: "q5_client_retention",
    block: "SYSTEMS",
    question: "Can your business operate for a week without you intervening operationally?",
    helpText: "1 = No, it depends on me entirely / 5 = Yes, it runs on its own",
  },
  {
    field: "q6_repeat_purchases",
    block: "SYSTEMS",
    question: "Do you measure the exact cost of acquiring each new client?",
    helpText: "1 = No idea what it costs / 5 = Yes, I know the exact CAC",
  },
  {
    field: "q7_marketing_strategy",
    block: "FUTURE",
    question: "Cost of inaction: How serious would it be to continue the same way for 12 months?",
    helpText: "1 = Not critical at all / 5 = Extremely critical, could threaten the business",
  },
];

function calculateResults(data: PymesCalculatorData) {
  const totalScore =
    data.q1_online_presence +
    data.q2_seo_positioning +
    data.q3_lead_generation +
    data.q4_lead_conversion +
    data.q5_client_retention +
    data.q6_repeat_purchases +
    data.q7_marketing_strategy;

  const estimatedLoss = data.monthly_revenue * 0.3 * 12;

  let urgencyLevel: "critical" | "high" | "moderate";
  let recommendedPlan: "rescue" | "growth" | "scale";

  if (totalScore <= 14) {
    urgencyLevel = "critical";
    recommendedPlan = "rescue";
  } else if (totalScore <= 24) {
    urgencyLevel = "high";
    recommendedPlan = "growth";
  } else {
    urgencyLevel = "moderate";
    recommendedPlan = "scale";
  }

  return { totalScore, estimatedLoss, urgencyLevel, recommendedPlan };
}

// ─── Urgency messages per PDF 5.1.1.1 ────────────────
const URGENCY_MESSAGES: Record<string, { emoji: string; title: string; body: string }> = {
  critical: {
    emoji: "🟡",
    title: "Riesgo de estancamiento peligroso,",
    body: "Estás trabajando para el negocio y no al revés. Tienes fugas de dinero, necesitas mejorar tu marketing urgente,",
  },
  high: {
    emoji: "🟠",
    title: "Crecimiento frenado,",
    body: "Tu negocio tiene potencial pero estás dejando oportunidades sobre la mesa. Con ajustes estratégicos puedes acelerar tu crecimiento,",
  },
  moderate: {
    emoji: "🟢",
    title: "Buen camino, optimiza para escalar,",
    body: "Tu negocio tiene bases sólidas. Es momento de escalar con estrategias avanzadas de marketing digital,",
  },
};

export default function PymesCalculatorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formType, setFormType] = useState<"selector" | "diagnosis" | "captacion">("selector");
  const [step, setStep] = useState(1); // 1: company info, 2-8: questions, 9: submit
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useForm<PymesCalculatorData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(pymesCalculatorSchema) as any,
    defaultValues: {
      q1_online_presence: 0,
      q2_seo_positioning: 0,
      q3_lead_generation: 0,
      q4_lead_conversion: 0,
      q5_client_retention: 0,
      q6_repeat_purchases: 0,
      q7_marketing_strategy: 0,
    },
  });

  const totalSteps = 9; // 1 company + 7 questions + 1 review
  const progress = Math.round((step / totalSteps) * 100);

  // Browser back button navigates to previous step (#30)
  const handlePopState = useCallback(() => {
    if (formType !== "selector") {
      setStep((prev) => {
        if (prev > 1) return prev - 1;
        setFormType("selector");
        return 1;
      });
    }
  }, [formType]);

  useEffect(() => {
    if (formType !== "selector") {
      window.history.pushState({ step }, "", `#step-${step}`);
    }
  }, [step, formType]);

  useEffect(() => {
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [handlePopState]);

  async function nextStep() {
    if (step === 1) {
      const valid = await trigger(["company_name", "sector", "monthly_revenue"]);
      if (!valid) return;
    }
    setStep(step + 1);
  }

  async function onSubmit(data: PymesCalculatorData) {
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

      const results = calculateResults(data);

      const { data: diagnosis, error: insertError } = await supabase
        .from("pymes_diagnosis")
        .insert({
          user_id: user.id,
          company_name: data.company_name,
          sector: data.sector,
          monthly_revenue: data.monthly_revenue,
          q1_online_presence: data.q1_online_presence,
          q2_seo_positioning: data.q2_seo_positioning,
          q3_lead_generation: data.q3_lead_generation,
          q4_lead_conversion: data.q4_lead_conversion,
          q5_client_retention: data.q5_client_retention,
          q6_repeat_purchases: data.q6_repeat_purchases,
          q7_marketing_strategy: data.q7_marketing_strategy,
          total_score: results.totalScore,
          urgency_level: results.urgencyLevel,
          estimated_loss: results.estimatedLoss,
          recommended_plan: results.recommendedPlan,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Create lead
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "pymes_calculator" }),
      });

      router.push(`/results/pymes/${diagnosis?.id}`);
    } catch (err) {
      setError("Failed to save diagnosis. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const currentQuestion = step >= 2 && step <= 8 ? QUESTIONS[step - 2] : null;

  // ─── Form Selector (#24) ─────────────────────────────
  if (formType === "selector") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4 py-8">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
              <BarChart3 className="h-4 w-4" />
              Marketing Empresarial
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Choose Your Assessment</h1>
            <p className="mt-2 text-muted-foreground">
              Select the type of assessment that best fits your business needs.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Diagnosis form */}
            <button
              type="button"
              onClick={() => { setFormType("diagnosis"); setStep(1); }}
              className="group rounded-2xl border border-accent/20 bg-card p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10 hover:border-accent/40"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <TrendingDown className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Sales Leak Diagnosis</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Discover how much revenue your business is leaking due to marketing inefficiencies.
                Get a personalized plan based on your score.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>- 7 diagnostic questions</li>
                <li>- Estimated annual loss calculation</li>
                <li>- Recommended plan (Rescue / Growth / Scale)</li>
              </ul>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-accent">
                Start diagnosis <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </button>

            {/* Captacion form */}
            <button
              type="button"
              onClick={() => { setFormType("captacion"); setStep(1); }}
              className="group rounded-2xl border border-primary/20 bg-card p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/40"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Client Acquisition</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tell us about your business and ideal customer so we can design a targeted
                client acquisition strategy.
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>- Business profile & goals</li>
                <li>- Target audience definition</li>
                <li>- Custom acquisition strategy</li>
              </ul>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                Start acquisition form <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Captacion form (placeholder) ───────────────────
  if (formType === "captacion") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4 py-8">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Client Acquisition Form</CardTitle>
            <CardDescription>
              This form will help us design a targeted client acquisition strategy for your business.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The client acquisition form is being developed. For now, please use the
              Sales Leak Diagnosis to get your personalized marketing plan.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setFormType("selector")}>
                Back to selection
              </Button>
              <Button onClick={() => { setFormType("diagnosis"); setStep(1); }}>
                Take Sales Leak Diagnosis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 px-4 py-8">
      {/* Progress */}
      <div className="mb-8 w-full max-w-xl">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BarChart3 className="h-3.5 w-3.5" />
            Sales Leak Calculator
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card className="w-full max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="text-xl">
              {step === 1
                ? "Company Information"
                : step <= 8
                  ? `${currentQuestion?.block}`
                  : "Your Results Preview"}
            </CardTitle>
            <CardDescription>
              {step === 1
                ? "Tell us about your business to start the diagnosis."
                : step <= 8
                  ? `Question ${step - 1} of 7`
                  : "Review and submit to see your full diagnosis."}
            </CardDescription>
          </CardHeader>

          <CardContent className="min-h-[200px]">
            {error && (
              <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Step 1: Company Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company name</Label>
                  <Input
                    id="company_name"
                    placeholder="Your Business Inc."
                    {...register("company_name")}
                  />
                  {errors.company_name && (
                    <p className="text-sm text-destructive">
                      {errors.company_name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Industry sector</Label>
                  <Select
                    onValueChange={(val: string | null) =>
                      val && setValue(
                        "sector",
                        val as PymesCalculatorData["sector"]
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sector" />
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
                    <p className="text-sm text-destructive">
                      {errors.sector.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthly_revenue">
                    Monthly revenue (CAD)
                  </Label>
                  <Input
                    id="monthly_revenue"
                    type="number"
                    placeholder="e.g. 25000"
                    {...register("monthly_revenue")}
                  />
                  {errors.monthly_revenue && (
                    <p className="text-sm text-destructive">
                      {errors.monthly_revenue.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    This is used to calculate your estimated annual loss.
                  </p>
                </div>
              </div>
            )}

            {/* Steps 2-8: Diagnostic Questions */}
            {currentQuestion && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-base font-medium">
                    {currentQuestion.question}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {currentQuestion.helpText}
                  </p>
                </div>
                <div className="grid gap-2">
                  {LIKERT_OPTIONS.map((opt) => {
                    const fieldValue = watch(currentQuestion.field as keyof PymesCalculatorData);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setValue(
                            currentQuestion.field as keyof PymesCalculatorData,
                            opt.value as never
                          );
                          if (step < 8) {
                            setStep(step + 1);
                          }
                        }}
                        className={`rounded-lg border p-3 text-left text-sm transition-all hover:border-accent hover:bg-accent/5 ${
                          fieldValue === opt.value
                            ? "border-accent bg-accent/5 font-medium"
                            : "border-border"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 9: Review - PDF 5.1.1.1 format (#26) */}
            {step === 9 && (
              <div className="space-y-4">
                {(() => {
                  const formValues = watch();
                  if (
                    !formValues.q1_online_presence ||
                    !formValues.monthly_revenue
                  )
                    return null;
                  const results = calculateResults(formValues as PymesCalculatorData);
                  const msg = URGENCY_MESSAGES[results.urgencyLevel];
                  return (
                    <>
                      {/* PDF 5.1.1.1 style urgency message */}
                      <div
                        className={`rounded-lg border p-5 ${
                          results.urgencyLevel === "critical"
                            ? "border-red-200 bg-red-50"
                            : results.urgencyLevel === "high"
                              ? "border-orange-200 bg-orange-50"
                              : "border-green-200 bg-green-50"
                        }`}
                      >
                        <p className="text-lg leading-relaxed">
                          <span className="text-2xl">{msg.emoji}</span>{" "}
                          <strong>{msg.title}</strong> {msg.body}{" "}
                          <strong>
                            estas dejando de percibir ${results.estimatedLoss.toLocaleString()} CAD anuales
                          </strong>{" "}
                          por ineficiencia en marketing y procesos
                        </p>
                        <p className="mt-3 text-sm text-muted-foreground">
                          Score: {results.totalScore} / 35
                        </p>
                      </div>

                      <div className="rounded-lg border p-4">
                        <p className="text-sm font-medium">Recommended Plan</p>
                        <p className="text-lg font-bold capitalize text-accent">
                          Plan {results.recommendedPlan}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {results.recommendedPlan === "rescue" &&
                            "$1,500 CAD - Emergency digital rescue"}
                          {results.recommendedPlan === "growth" &&
                            "$2,500 CAD - Comprehensive growth strategy"}
                          {results.recommendedPlan === "scale" &&
                            "$3,800 CAD - Full digital transformation"}
                        </p>
                      </div>
                    </>
                  );
                })()}
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
              >
                Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setFormType("selector")}
              >
                Back to selection
              </Button>
            )}
            {step === 9 ? (
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Get Full Results"}
              </Button>
            ) : step === 8 ? (
              <Button type="button" onClick={() => setStep(9)}>
                See Results
              </Button>
            ) : (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
