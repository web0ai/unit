import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { invites, profiles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Find the invite (using Drizzle to bypass RLS)
  const [invite] = await db
    .select()
    .from(invites)
    .where(and(eq(invites.token, token), eq(invites.status, "pending")));

  if (!invite) {
    return NextResponse.json({ error: "Invalid or expired invite" }, { status: 404 });
  }

  if (new Date(invite.expiresAt) < new Date()) {
    await db
      .update(invites)
      .set({ status: "expired" })
      .where(eq(invites.id, invite.id));
    return NextResponse.json({ error: "Invite has expired" }, { status: 410 });
  }

  // Link the user to the unit
  await db
    .update(profiles)
    .set({ unitId: invite.unitId })
    .where(eq(profiles.id, user.id));

  // Mark invite as accepted
  await db
    .update(invites)
    .set({ status: "accepted" })
    .where(eq(invites.id, invite.id));

  return NextResponse.json({ unitId: invite.unitId });
}
