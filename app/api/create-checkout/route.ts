import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
  {
    apiVersion: "2023-10-16" as any,
  }
);

export async function POST(req: Request) {
  try {
    const { priceId, planTier } = await req.json();

    if (!priceId || !planTier) {
      return NextResponse.json(
        { error: "priceId e planTier sao obrigatorios" },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Nao autorizado. Faca login primeiro." },
        { status: 401 }
      );
    }

    // Check if user already has a customer ID in DB
    const { data: subData } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const customerId = subData?.stripe_customer_id;

    // If customer doesn't exist in Stripe, Stripe will create it automatically via checkout email
    const origin = req.headers.get("origin");

    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/pricing?payment=cancelled`,
      metadata: {
        userId: user.id,
        planTier: planTier,
      },
    };

    if (customerId) {
      checkoutParams.customer = customerId;
    } else {
      checkoutParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(checkoutParams);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Erro ao criar checkout Stripe:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
