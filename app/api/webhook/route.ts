import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "dummy-key";
const stripeWebhookSecret =
  process.env.STRIPE_WEBHOOK_SECRET || "dummy-webhook-secret";

const isConfigured =
  stripeSecretKey !== "dummy-key" &&
  stripeWebhookSecret !== "dummy-webhook-secret";
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16" as any, // Standard stable version
});

export async function POST(req: NextRequest) {
  if (!isConfigured) {
    console.warn(
      "Stripe webhook received but credentials are not configured. Returning success mock."
    );
    return NextResponse.json({ received: true, mode: "demo-mode" });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      stripeWebhookSecret
    );
  } catch (err: any) {
    console.error(
      `Stripe Webhook Signature Verification Failed: ${err.message}`
    );
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the specific Stripe events
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Payment successful for Session ID: ${session.id}`);
        // Here you would unlock premium access for this user in Supabase
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(
          `Subscription state updated: ${subscription.status} (ID: ${subscription.id})`
        );
        // Here you would sync subscription status to Supabase
        break;
      }
      default:
        console.log(`Unhandled stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing Stripe event:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
