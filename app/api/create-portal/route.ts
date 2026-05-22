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

    // Retrieve the customer id from subscriptions
    const { data: subData } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!subData?.stripe_customer_id) {
      return NextResponse.json(
        { error: "Você nao possui nenhuma assinatura ativa no momento." },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin");

    // Create a customer portal session on Stripe
    const session = await stripe.billingPortal.sessions.create({
      customer: subData.stripe_customer_id,
      return_url: `${origin}/dashboard`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Erro ao criar portal Stripe:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
