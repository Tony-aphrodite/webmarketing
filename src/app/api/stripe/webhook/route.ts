import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      // ── Checkout completed (one-time or upfront) ──
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata || {};
        const userId = metadata.user_id;
        const paymentType = metadata.payment_type || "one_time";

        if (!userId) break;

        // Record payment
        await supabaseAdmin.from("payments").insert({
          user_id: userId,
          service_id: metadata.service_id || null,
          pymes_plan_id: metadata.pymes_plan_id || null,
          stripe_session_id: session.id,
          stripe_payment_intent_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : null,
          amount: (session.amount_total || 0) / 100,
          currency: "CAD",
          payment_type: paymentType,
          status: "completed",
        });

        // If upfront PYMES payment, create installment subscription
        if (
          paymentType === "upfront" &&
          metadata.pymes_plan_id &&
          Number(metadata.installment_months) > 0
        ) {
          const installmentAmount = Number(metadata.installment_amount) || 0;
          const installmentMonths = Number(metadata.installment_months) || 0;

          if (installmentAmount > 0 && installmentMonths > 0) {
            const price = await stripe.prices.create({
              currency: "cad",
              unit_amount: Math.round(installmentAmount * 100),
              recurring: { interval: "month", interval_count: 1 },
              product_data: {
                name: `${metadata.plan_type} Plan — Monthly Installment`,
              },
            });

            const customerId =
              typeof session.customer === "string"
                ? session.customer
                : session.customer?.id;

            if (customerId) {
              await stripe.subscriptions.create({
                customer: customerId,
                items: [{ price: price.id }],
                metadata: {
                  user_id: userId,
                  pymes_plan_id: metadata.pymes_plan_id,
                  total_installments: String(installmentMonths),
                },
              });
            }
          }
        }

        // Update lead status
        await supabaseAdmin
          .from("leads")
          .update({ status: "en_proceso" })
          .eq("user_id", userId)
          .in("status", ["nuevo", "contactado"]);

        break;
      }

      // ── Recurring installment payment ──
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subDetails = invoice.parent?.subscription_details;
        if (!subDetails?.subscription) break;

        const subscriptionId =
          typeof subDetails.subscription === "string"
            ? subDetails.subscription
            : subDetails.subscription.id;

        const subscription =
          await stripe.subscriptions.retrieve(subscriptionId);
        const metadata = subscription.metadata || {};
        const userId = metadata.user_id;
        const pymesPlanId = metadata.pymes_plan_id;
        const totalInstallments = parseInt(
          metadata.total_installments || "0"
        );

        if (!userId || !pymesPlanId) break;

        // Count existing installment payments
        const { count } = await supabaseAdmin
          .from("payments")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("pymes_plan_id", pymesPlanId)
          .eq("payment_type", "installment");

        const installmentNumber = (count || 0) + 1;

        // Record installment payment
        await supabaseAdmin.from("payments").insert({
          user_id: userId,
          pymes_plan_id: pymesPlanId,
          stripe_session_id: invoice.id,
          stripe_subscription_id: subscriptionId,
          amount: (invoice.amount_paid || 0) / 100,
          currency: "CAD",
          payment_type: "installment",
          installment_number: installmentNumber,
          total_installments: totalInstallments,
          status: "completed",
        });

        // Cancel subscription after all installments paid
        if (totalInstallments > 0 && installmentNumber >= totalInstallments) {
          await stripe.subscriptions.cancel(subscriptionId);
        }

        break;
      }

      // ── Failed payment ──
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        await supabaseAdmin
          .from("payments")
          .update({ status: "failed" })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        break;
      }
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    // Still return 200 to prevent Stripe retries for handler errors
  }

  return NextResponse.json({ received: true });
}
