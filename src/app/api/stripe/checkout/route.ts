import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { units, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get the user's unit
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id));

  if (!profile?.unitId) {
    return NextResponse.json({ error: "No unit found" }, { status: 404 });
  }

  const [unit] = await db
    .select()
    .from(units)
    .where(eq(units.id, profile.unitId));

  if (!unit) {
    return NextResponse.json({ error: "Unit not found" }, { status: 404 });
  }

  // Create or reuse Stripe customer
  let customerId = unit.stripeCustomerId;
  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: user.email ?? undefined,
      metadata: { unit_id: unit.id },
    });
    customerId = customer.id;
    await db
      .update(units)
      .set({ stripeCustomerId: customerId })
      .where(eq(units.id, unit.id));
  }

  // Create checkout session
  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Unit — All Pillars",
            description: "Full access to all 5 pillars for your family unit",
          },
          unit_amount: 1200, // $12/month
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  return NextResponse.json({ url: session.url });
}
