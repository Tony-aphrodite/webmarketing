import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "WebMarketing <notifications@nexuma.ca>";

// Steve 4/21 #6: PYMES result email template (exact wording from MVP)
function buildEmailHtml(params: {
  userName: string;
  annualLoss: number;
  monthlyLoss: number;
  score: number;
  urgencyLevel: string;
  recommendedPlan: string;
  planPrice: string;
  dashboardUrl: string;
  scheduleUrl: string;
}): string {
  const { userName, annualLoss, monthlyLoss, score, recommendedPlan, planPrice, dashboardUrl, scheduleUrl } = params;

  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;line-height:1.6">
  <div style="background:linear-gradient(135deg,#0B38D9 0%,#0FA37F 100%);padding:32px 24px;text-align:center;border-radius:12px 12px 0 0">
    <h1 style="color:#fff;margin:0;font-size:26px">Your Sales Leak Diagnosis</h1>
    <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px">Personalized results for ${userName}</p>
  </div>

  <div style="background:#fff;padding:32px 24px;border:1px solid #e5e5e5;border-top:none">
    <p style="font-size:20px;font-weight:700;color:#0B38D9;margin:0 0 16px">
      What would you do with those $${annualLoss.toLocaleString()} extra per year?
    </p>

    <p style="font-size:15px;margin:0 0 16px">
      The data doesn't lie: maintaining your current structure is not "free" — it's costing you
      <strong style="color:#dc2626">$${monthlyLoss.toLocaleString()} every month</strong> in lost opportunities.
    </p>

    <p style="font-size:15px;margin:0 0 16px">
      The good news is that this score is not definitive — it's a roadmap.
    </p>

    <p style="font-size:15px;margin:0 0 24px">
      We have helped businesses with scores of <strong>${score} points</strong> rise to Total Optimization level,
      recovering their revenue and — most importantly — becoming profitable.
    </p>

    <div style="background:#f8f9fa;border-left:4px solid #0FA37F;padding:16px;margin:24px 0;border-radius:4px">
      <p style="margin:0;font-size:14px;color:#666">Your recommended plan</p>
      <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#0B38D9;text-transform:capitalize">
        Plan ${recommendedPlan} — ${planPrice}
      </p>
    </div>

    <!-- BOTÓN 1: Empezar ahora -->
    <div style="text-align:center;margin:24px 0 16px">
      <a href="${dashboardUrl}" style="display:inline-block;background:#0B38D9;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px">
        Start Now → Get the ${recommendedPlan} Plan
      </a>
    </div>

    <p style="text-align:center;font-size:13px;color:#666;margin:16px 0 24px">
      Click here to activate your recommended plan immediately.
    </p>

    <div style="border-top:1px solid #e5e5e5;padding-top:24px;margin-top:24px">
      <p style="font-size:16px;font-weight:600;margin:0 0 12px">Your next step:</p>
      <p style="font-size:15px;margin:0 0 20px">
        Don't let the loss figure keep growing. Book a personalized
        <strong>15-minute session at no cost</strong> where we break down these numbers
        and give you the action plan to stop the leak.
      </p>

      <!-- BOTÓN 2: AGENDAR MI SESIÓN DE RESCATE -->
      <div style="text-align:center;margin:16px 0">
        <a href="${scheduleUrl}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px">
          SCHEDULE MY RESCUE SESSION
        </a>
      </div>
    </div>

    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e5e5;font-size:12px;color:#888;text-align:center">
      <p style="margin:0">Nexuma marketing ltd</p>
      <p style="margin:4px 0 0">This email was sent because you completed the Sales Leak Diagnosis.</p>
    </div>
  </div>
</div>
  `.trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { diagnosis_id, monthly_revenue } = body;

    if (!diagnosis_id) {
      return NextResponse.json({ error: "diagnosis_id required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get diagnosis data
    const { data: diagnosis } = await supabase
      .from("pymes_diagnosis")
      .select("total_score, urgency_level, estimated_loss, recommended_plan")
      .eq("id", diagnosis_id)
      .eq("user_id", user.id)
      .single();

    if (!diagnosis) {
      return NextResponse.json({ error: "Diagnosis not found" }, { status: 404 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    const recipientEmail = profile?.email || user.email;
    if (!recipientEmail) {
      return NextResponse.json({ error: "No email to send to" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not set — skipping email");
      return NextResponse.json({ success: true, skipped: true });
    }

    const planPrices: Record<string, string> = {
      rescue: "$1,500 CAD",
      growth: "$2,500 CAD",
      scale: "$3,800 CAD",
    };

    // Steve's formula: monthly_loss = monthly_revenue * 0.3
    const monthlyLoss = Math.round((Number(monthly_revenue) || 0) * 0.3);
    const annualLoss = Number(diagnosis.estimated_loss) || monthlyLoss * 12;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://webmarketing-lyart.vercel.app";

    const html = buildEmailHtml({
      userName: profile?.full_name || "Business Owner",
      annualLoss,
      monthlyLoss,
      score: Number(diagnosis.total_score) || 0,
      urgencyLevel: diagnosis.urgency_level || "moderate",
      recommendedPlan: diagnosis.recommended_plan || "growth",
      planPrice: planPrices[diagnosis.recommended_plan] || "$2,500 CAD",
      dashboardUrl: `${baseUrl}/dashboard/services`,
      scheduleUrl: `${baseUrl}/dashboard/services#contact`,
    });

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send to user
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [recipientEmail],
      subject: `Your Sales Leak Diagnosis Results — Save $${annualLoss.toLocaleString()}/year`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PYMES result email error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
