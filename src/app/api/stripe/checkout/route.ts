import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, APP_URL } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, serviceId, pymesPlanId } = await request.json();

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email, full_name")
      .eq("id", user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        name: profile?.full_name || undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    switch (type) {
      // ── One-time service purchase ──
      case "service": {
        if (!serviceId) {
          return NextResponse.json(
            { error: "serviceId required" },
            { status: 400 }
          );
        }

        const { data: service } = await supabase
          .from("services")
          .select("id, name, description, price, currency")
          .eq("id", serviceId)
          .single();

        if (!service) {
          return NextResponse.json(
            { error: "Service not found" },
            { status: 404 }
          );
        }

        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ["card"],
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: (service.currency || "cad").toLowerCase(),
                product_data: {
                  name: service.name,
                  description: service.description || undefined,
                },
                unit_amount: Math.round(service.price * 100),
              },
              quantity: 1,
            },
          ],
          success_url: `${APP_URL}/dashboard/payments/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${APP_URL}/dashboard/services?cancelled=true`,
          metadata: {
            user_id: user.id,
            service_id: serviceId,
            payment_type: "one_time",
          },
        });

        return NextResponse.json({ url: session.url });
      }

      // ── PYMES plan upfront payment ──
      case "pymes_upfront": {
        if (!pymesPlanId) {
          return NextResponse.json(
            { error: "pymesPlanId required" },
            { status: 400 }
          );
        }

        const { data: plan } = await supabase
          .from("pymes_plans")
          .select("*")
          .eq("id", pymesPlanId)
          .single();

        if (!plan) {
          return NextResponse.json(
            { error: "Plan not found" },
            { status: 404 }
          );
        }

        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ["card"],
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: "cad",
                product_data: {
                  name: `${plan.name} — Initial Payment`,
                  description: `Upfront payment for ${plan.name} plan`,
                },
                unit_amount: Math.round(
                  (plan.upfront_amount || plan.price * 0.5) * 100
                ),
              },
              quantity: 1,
            },
          ],
          success_url: `${APP_URL}/dashboard/payments/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan.plan_type}`,
          cancel_url: `${APP_URL}/dashboard/services?cancelled=true`,
          metadata: {
            user_id: user.id,
            pymes_plan_id: pymesPlanId,
            payment_type: "upfront",
            plan_type: plan.plan_type,
            installment_amount: String(plan.installment_amount || 0),
            installment_months: String(plan.installment_months || 0),
          },
        });

        return NextResponse.json({ url: session.url });
      }

      default:
        return NextResponse.json(
          { error: "Invalid type. Use: service or pymes_upfront" },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
