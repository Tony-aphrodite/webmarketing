"use client";

import { useState } from "react";
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
import { BarChart3 } from "lucide-react";

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

export default function PymesCalculatorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
                    onValueChange={(val) =>
                      setValue(
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

            {/* Step 9: Review */}
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
                  return (
                    <>
                      <div
                        className={`rounded-lg border p-4 ${
                          results.urgencyLevel === "critical"
                            ? "border-red-200 bg-red-50"
                            : results.urgencyLevel === "high"
                              ? "border-orange-200 bg-orange-50"
                              : "border-green-200 bg-green-50"
                        }`}
                      >
                        <p className="text-sm font-medium uppercase tracking-wide">
                          Urgency Level
                        </p>
                        <p
                          className={`text-2xl font-bold capitalize ${
                            results.urgencyLevel === "critical"
                              ? "text-red-600"
                              : results.urgencyLevel === "high"
                                ? "text-orange-600"
                                : "text-green-600"
                          }`}
                        >
                          {results.urgencyLevel}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Score: {results.totalScore} / 35
                        </p>
                      </div>

                      <div className="rounded-lg border bg-primary/5 p-4">
                        <p className="text-sm font-medium">
                          Estimated Annual Loss
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          ${results.estimatedLoss.toLocaleString()} CAD
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Based on: ${formValues.monthly_revenue?.toLocaleString()}/mo
                          x 30% x 12 months
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
              <div />
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
