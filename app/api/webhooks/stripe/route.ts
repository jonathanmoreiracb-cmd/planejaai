import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
  {
    apiVersion: "2023-10-16" as any,
  }
);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const isConfigured =
  supabaseUrl &&
  supabaseUrl.startsWith("http") &&
  supabaseUrl !== "xxx" &&
  supabaseUrl !== "undefined" &&
  supabaseUrl !== "null" &&
  supabaseServiceRoleKey &&
  supabaseServiceRoleKey !== "xxx" &&
  supabaseServiceRoleKey !== "undefined" &&
  supabaseServiceRoleKey !== "null";

const supabaseAdmin = createClient(
  isConfigured ? supabaseUrl : "https://placeholder-url.supabase.co",
  isConfigured
    ? supabaseServiceRoleKey
    : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder"
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    console.error(`Falha na assinatura do webhook Stripe: ${err.message}`);
    return NextResponse.json(
      { error: `Erro na assinatura: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;

        if (!metadata?.userId || !metadata?.planTier) {
          console.warn("Checkout concluido sem metadados necessarios.");
          break;
        }

        const subscriptionId = session.subscription as string;
        const subscription = (await stripe.subscriptions.retrieve(
          subscriptionId
        )) as any;

        const { error: upsertErr } = await supabaseAdmin
          .from("subscriptions")
          .upsert({
            user_id: metadata.userId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscriptionId,
            status: subscription.status,
            price_id: subscription.items.data[0].price.id,
            plan_tier: metadata.planTier,
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (upsertErr) throw upsertErr;
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;

        // Fetch sub record to match user_id
        const { data: subRecord, error: fetchErr } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id, plan_tier")
          .eq("stripe_subscription_id", subscription.id)
          .maybeSingle();

        if (fetchErr || !subRecord) {
          console.warn(
            `Assinatura atualizada nao encontrada no banco: ${subscription.id}`
          );
          break;
        }

        // Determine plan tier based on Stripe Price ID or keep current one if not mapped
        // (price_id mapping can also be done via metadata or explicit checks)
        const priceId = subscription.items.data[0].price.id;

        // Update database status
        const { error: updateErr } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: subscription.status,
            price_id: priceId,
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (updateErr) throw updateErr;
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;

        const { error: cancelErr } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "canceled",
            plan_tier: "free",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (cancelErr) throw cancelErr;
        break;
      }

      default:
        console.log(`Evento Stripe nao tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Erro ao tratar webhook Stripe:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor no webhook" },
      { status: 500 }
    );
  }
}
