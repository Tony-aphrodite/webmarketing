import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  TrendingDown,
  Target,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  DollarSign,
  Zap,
  X,
} from "lucide-react";
import { PymesRadarChart } from "@/components/charts/pymes-radar-chart";

// ─── Plan Details ────────────────────────────────────
const PLAN_DETAILS: Record<
  string,
  {
    name: string;
    price: string;
    priceNum: number;
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
    priceNum: 1500,
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
    priceNum: 2500,
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
    priceNum: 3800,
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

// ─── All features across plans (for comparison table) ──
const ALL_FEATURES = [
  "Emergency digital audit",
  "Complete digital audit",
  "Full digital transformation audit",
  "Google Business Profile optimization",
  "Basic SEO correction",
  "SEO strategy (on-page + local)",
  "Advanced SEO (on-page + off-page + technical)",
  "Social media rescue (2 platforms)",
  "Social media management (3 platforms)",
  "Social media management (all platforms)",
  "Website optimization or landing page",
  "Website redesign or new build",
  "Google Ads basic campaign",
  "Google Ads + Meta Ads campaigns",
  "Email marketing automation",
  "CRM integration",
  "Conversion rate optimization",
  "Monthly performance reports",
  "Monthly strategy sessions",
  "30-day action plan",
  "90-day growth roadmap",
  "6-month scaling roadmap",
];

const QUESTION_LABELS = [
  { key: "q1_online_presence", label: "Online Presence" },
  { key: "q2_seo_positioning", label: "SEO Positioning" },
  { key: "q3_lead_generation", label: "Lead Generation" },
  { key: "q4_lead_conversion", label: "Lead Conversion" },
  { key: "q5_client_retention", label: "Client Retention" },
  { key: "q6_repeat_purchases", label: "Repeat Purchases" },
  { key: "q7_marketing_strategy", label: "Marketing Strategy" },
];

// ─── Block Scores (4 blocks) ─────────────────────────
const BLOCKS = [
  { name: "Digital Visibility", keys: ["q1_online_presence", "q2_seo_positioning"], max: 10 },
  { name: "Lead Generation", keys: ["q3_lead_generation", "q4_lead_conversion"], max: 10 },
  { name: "Retention & Loyalty", keys: ["q5_client_retention", "q6_repeat_purchases"], max: 10 },
  { name: "Marketing Strategy", keys: ["q7_marketing_strategy"], max: 5 },
];

export default async function PymesResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: diagnosis } = await supabase
    .from("pymes_diagnosis")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!diagnosis) redirect("/forms/pymes");

  const recommendedKey = diagnosis.recommended_plan ?? "growth";
  const plan = PLAN_DETAILS[recommendedKey];
  const urgency = diagnosis.urgency_level ?? "high";

  const urgencyConfig = {
    critical: {
      label: "Critical",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
      description:
        "Your business has significant marketing gaps that are actively costing you revenue. Immediate action is strongly recommended.",
    },
    high: {
      label: "High",
      icon: TrendingDown,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
      description:
        "There are notable weaknesses in your marketing strategy. Addressing these soon will prevent further revenue loss.",
    },
    moderate: {
      label: "Moderate",
      icon: Target,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      description:
        "Your marketing foundation is solid, but there's room to optimize and scale for maximum growth.",
    },
  };

  const urg = urgencyConfig[urgency as keyof typeof urgencyConfig];
  const UrgIcon = urg.icon;

  // Prepare radar chart data
  const radarScores = QUESTION_LABELS.map(({ key, label }) => ({
    label,
    score: diagnosis[key as keyof typeof diagnosis] as number,
  }));

  // Block scores for breakdown
  const blockScores = BLOCKS.map((block) => {
    const total = block.keys.reduce(
      (sum, key) => sum + (diagnosis[key as keyof typeof diagnosis] as number),
      0
    );
    return { ...block, score: total };
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <BarChart3 className="h-4 w-4" />
            Sales Leak Diagnosis
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Results for {diagnosis.company_name}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sector: {diagnosis.sector} &middot; Monthly revenue: $
            {Number(diagnosis.monthly_revenue).toLocaleString()} CAD
          </p>
        </div>

        {/* Urgency Level */}
        <Card className={`${urg.border} ${urg.bg}`}>
          <CardContent className="flex items-start gap-4 pt-6">
            <div className={`rounded-full ${urg.bg} p-3`}>
              <UrgIcon className={`h-6 w-6 ${urg.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Urgency Level
              </p>
              <p className={`text-2xl font-bold ${urg.color}`}>{urg.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {urg.description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-3xl font-bold">
                {diagnosis.total_score}
                <span className="text-base font-normal text-muted-foreground">
                  /35
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Estimated Loss */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-full bg-primary/10 p-3">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Estimated Annual Revenue Loss
              </p>
              <p className="text-3xl font-bold text-primary">
                ${Number(diagnosis.estimated_loss).toLocaleString()} CAD
              </p>
              <p className="text-xs text-muted-foreground">
                Based on your monthly revenue of $
                {Number(diagnosis.monthly_revenue).toLocaleString()}/mo &times;
                30% &times; 12 months
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart + Block Breakdown */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5" />
                Performance Overview
              </CardTitle>
              <CardDescription>
                Visual breakdown across 7 marketing dimensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PymesRadarChart scores={radarScores} />
            </CardContent>
          </Card>

          {/* Block-by-Block Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5" />
                Block Scores
              </CardTitle>
              <CardDescription>
                Scores by marketing dimension block
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {blockScores.map((block) => {
                const pct = (block.score / block.max) * 100;
                return (
                  <div key={block.name}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium">{block.name}</span>
                      <span>
                        {block.score}/{block.max}
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-muted">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          pct <= 40
                            ? "bg-red-400"
                            : pct <= 60
                              ? "bg-orange-400"
                              : "bg-green-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Individual question scores */}
              <div className="mt-4 border-t pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Individual Scores
                </p>
                <div className="space-y-2">
                  {QUESTION_LABELS.map(({ key, label }) => {
                    const score = diagnosis[key as keyof typeof diagnosis] as number;
                    return (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span>{label}</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <div
                              key={n}
                              className={`h-2 w-4 rounded-sm ${
                                n <= score
                                  ? score <= 2
                                    ? "bg-red-400"
                                    : score <= 3
                                      ? "bg-orange-400"
                                      : "bg-green-400"
                                  : "bg-muted"
                              }`}
                            />
                          ))}
                          <span className="ml-1 w-6 text-right text-xs font-medium">{score}/5</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommended Plan (highlighted) */}
        <Card className={`${plan.borderColor} ${plan.bgColor}`}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className={`h-5 w-5 ${plan.color}`} />
              <CardTitle className="text-lg">Recommended Plan</CardTitle>
              <Badge className={`${plan.bgColor} ${plan.color} border ${plan.borderColor}`}>
                Best Match
              </Badge>
            </div>
            <CardDescription>{plan.tagline}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <span className={`text-4xl font-bold ${plan.color}`}>
                {plan.price}
              </span>
              <p className="text-sm text-muted-foreground">
                {plan.upfront} + {plan.installment}
              </p>
              <p className="text-sm text-muted-foreground">{plan.duration}</p>
            </div>
            <ul className="space-y-2">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2
                    className={`mt-0.5 h-4 w-4 shrink-0 ${plan.color}`}
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/dashboard/services"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-4 w-full gap-2"
              )}
            >
              Get Started with {plan.name}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        {/* ═══ 3-Plan Comparison Table ═══ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compare All Plans</CardTitle>
            <CardDescription>
              Feature comparison across Rescue, Growth, and Scale plans
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 pr-4 text-left font-medium">Feature</th>
                  {(["rescue", "growth", "scale"] as const).map((key) => {
                    const p = PLAN_DETAILS[key];
                    const isRecommended = key === recommendedKey;
                    return (
                      <th
                        key={key}
                        className={`px-3 py-3 text-center font-medium ${
                          isRecommended ? "bg-primary/5 rounded-t-lg" : ""
                        }`}
                      >
                        <div className={p.color}>{p.name}</div>
                        <div className="text-xs font-normal text-muted-foreground">
                          {p.price}
                        </div>
                        {isRecommended && (
                          <Badge variant="default" className="mt-1 text-xs">
                            Recommended
                          </Badge>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {ALL_FEATURES.map((feature) => (
                  <tr key={feature} className="border-b last:border-0">
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {feature}
                    </td>
                    {(["rescue", "growth", "scale"] as const).map((key) => {
                      const has = PLAN_DETAILS[key].features.includes(feature);
                      const isRecommended = key === recommendedKey;
                      return (
                        <td
                          key={key}
                          className={`px-3 py-2.5 text-center ${
                            isRecommended ? "bg-primary/5" : ""
                          }`}
                        >
                          {has ? (
                            <CheckCircle2 className="mx-auto h-4 w-4 text-green-500" />
                          ) : (
                            <X className="mx-auto h-4 w-4 text-muted-foreground/30" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Pricing row */}
                <tr className="border-t-2 font-medium">
                  <td className="py-3 pr-4">Total Price</td>
                  {(["rescue", "growth", "scale"] as const).map((key) => {
                    const p = PLAN_DETAILS[key];
                    const isRecommended = key === recommendedKey;
                    return (
                      <td
                        key={key}
                        className={`px-3 py-3 text-center ${p.color} ${
                          isRecommended ? "bg-primary/5" : ""
                        }`}
                      >
                        {p.price}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="py-1 pr-4 text-xs text-muted-foreground">
                    Payment
                  </td>
                  {(["rescue", "growth", "scale"] as const).map((key) => {
                    const p = PLAN_DETAILS[key];
                    const isRecommended = key === recommendedKey;
                    return (
                      <td
                        key={key}
                        className={`px-3 py-1 text-center text-xs text-muted-foreground ${
                          isRecommended ? "bg-primary/5" : ""
                        }`}
                      >
                        {p.upfront}
                        <br />
                        {p.installment}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="py-1 pr-4 text-xs text-muted-foreground">
                    Duration
                  </td>
                  {(["rescue", "growth", "scale"] as const).map((key) => {
                    const p = PLAN_DETAILS[key];
                    const isRecommended = key === recommendedKey;
                    return (
                      <td
                        key={key}
                        className={`px-3 py-1 text-center text-xs text-muted-foreground ${
                          isRecommended ? "bg-primary/5 rounded-b-lg" : ""
                        }`}
                      >
                        {p.duration}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-8 text-center">
          <h2 className="text-xl font-bold">Ready to stop the leak?</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Our team will review your diagnosis and prepare a customized action
            plan. Schedule a free consultation to get started.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard/services"
              className={cn(buttonVariants({ size: "lg" }), "gap-2")}
            >
              Get Started with {plan.name}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/forms/pymes"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Retake Assessment
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground">
          This diagnosis was generated on{" "}
          {new Date(diagnosis.created_at).toLocaleDateString("en-CA", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          . Results are based on self-reported data and should be used as a
          guide.
        </p>
      </div>
    </div>
  );
}
