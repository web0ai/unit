import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { units } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;
      const status = subscription.status === "active" ? "active" : subscription.status;

      await db
        .update(units)
        .set({
          subscriptionStatus: status,
          stripeSubscriptionId: subscription.id,
        })
        .where(eq(units.stripeCustomerId, customerId));
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;

      await db
        .update(units)
        .set({
          subscriptionStatus: "free",
          stripeSubscriptionId: null,
        })
        .where(eq(units.stripeCustomerId, customerId));
      break;
    }
  }

  return NextResponse.json({ received: true });
}
