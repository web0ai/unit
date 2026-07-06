# Unit — Product Requirements Document

**Version:** 0.2
**Date:** July 2026
**Status:** Active — supersedes [prototype/PRD.md](../prototype/PRD.md) (v0.1, March 2026)
**Authors:** Ala Haddad, Zein

---

## What changed since v0.1

1. **Stack corrected.** v0.1 said Vite + Express + Privy. The actual app (built March 27–30) is **Next.js 16 + Supabase (auth + Postgres + RLS) + Drizzle + Stripe on Vercel**. That build is right; this PRD matches reality.
2. **Scope narrowed hard.** v0.1 specced 5 pillars to equal depth. v0.2 bets everything on one habit — the check-in — and demotes the rest to supporting cast or deferred.
3. **Delivery model added.** The biggest open question in v0.1 (reminders, async completion, "will they open the app?") is now the core thesis: the check-in comes to the couple over WhatsApp; the web app is the shared record.
4. **Dogfood gate added.** No beta, no marketing, no monetization until the ritual has survived 6–8 weeks in our own family.

---

## Core Thesis

**Unit is a check-in ritual with an operating system attached — not five apps in a sidebar.**

Couples apps die because both partners must remember to open them. Storage features (docs, budgets, lists) create no habit; rituals do. So:

- **The product is the recurring check-in.** Everything else feeds it: goals show up *in* the check-in agenda, upcoming events show up *in* it, a money conversation is *scheduled by* it.
- **The check-in comes to you.** At the chosen slot, both partners get pinged where they already live (WhatsApp; email fallback). Each answers async from their phone in minutes — different time zones, one partner traveling, baby asleep on the other: all fine.
- **The web app is the record.** When both have answered, Unit composes the session: answers side by side plus an auto-prepared agenda. History, trends, and the "state of the unit" live on the web (mobile-first PWA, 375px).

Competitive shape: Paired/Agapé own connection *questions*, Honeydue owns couple *finance*. Nobody owns the *recurring couple check-in ritual*. That is the wedge; "full life OS" is the expansion story, not the launch.

---

## Scope

### MVP surface (what stays on)

| Area | Depth |
|------|-------|
| **Connect** | Full product. Cadence + depth settings, async two-sided check-in, auto-prepared agenda, history. The thing we polish. |
| **Us** | Thin. Profiles, unit setup, invite partner, themes. Mostly onboarding. |
| **Dashboard** | Thin. Next check-in, family goals, coming up. "How is our unit doing," not an app launcher. |
| **Schedule** | Agenda view only. Feeds the check-in agenda. |

### Deferred (feature-flagged "coming soon" in nav)

- **Money** — later as *Money-lite*: shared financial goals + a monthly "money date" agenda item inside the check-in. We are not building a budgeting app; we will not out-build Copilot/YNAB and don't need to.
- **Vault** — last. Highest security burden (encryption, 2FA, expiry alerts) for zero habit value. Build it as the paid-tier retention anchor once trust exists. (Currently a UI shell — no documents table, no storage wiring.)
- Check-in trend charts (needs 4+ sessions of real data first), ICS export.

### Killed for now

Bank integrations, PDF/CSV import parsing, Google Calendar OAuth, AI insights, native apps, template marketplace.

---

## The Ritual (how users actually do it)

1. **Onboarding:** couple picks cadence (weekly/biweekly/monthly), depth (Short 15m / Less Short 30m / Not Short 60m), and a slot (e.g. Sunday 8pm).
2. **The ping:** at the slot, both partners get a WhatsApp message (email fallback) with their questions. Each answers async, in chat or via a link, in ~3 minutes.
3. **The session:** when both have answered, Unit composes it — answers side by side + auto-prepared agenda (goals that moved, events this week, key dates near, money date if due). That's the 10-minute conversation they actually have.
4. **The record:** session saved to history. Streak counts up ("12 check-ins together") — warm, not gamified nagging.

**Unfair advantage:** we already run a WhatsApp agent fleet (Hermes). Phase 2 prototypes the facilitator as a Hermes skill for our own unit only, writing into the same DB. Productizing (WhatsApp Business API / Twilio) happens only after the ritual proves itself. If WhatsApp delivery is ever infeasible at scale, email + PWA push is the fallback — the ritual model is the bet, the channel is an implementation detail.

---

## Build State (audited 2026-07-06)

- **Prototype** (`prototype/`, unit-app.netlify.app) — full interaction spec, still the design reference.
- **App** — Next.js 16, all routes compile clean. 15-table schema, RLS policies in the migration, auth + invite flow, all pillar pages scaffolded (~3.4k LOC), Stripe checkout/webhook wired.
- **Gaps:** no notification layer (existential — Phase 1), Vault is a shell, Money is plain CRUD, original Supabase project deleted after free-tier inactivity (no data lost; see `docs/REVIVAL.md`).

---

## Phases

**Phase 0 — Revive.** Fresh Supabase project, env vars local + Vercel, apply migration, redeploy, founders' unit seeded. *Done when: both of us are signed up in one unit on the production URL.* Runbook: `docs/REVIVAL.md`.

**Phase 1 — Harden the spine.** Small sessions over 2–3 weeks:
- Invite loop e2e with two real accounts (invite flows always break — fix what does).
- Check-in loop boring-solid: start async → partner completes later → both-submitted → completed → history.
- **Reminders v1:** Resend email + Vercel cron computing "who's due." Without this it's a diary nobody opens.
- Feature-flag Money + Vault to "coming soon". PWA manifest + 375px pass on every screen.
- *Done when: a full check-in cycle completes with no manual nudging outside the product.*

**Phase 2 — Habit engine (dogfood).** Hermes WhatsApp facilitator for our unit only. Auto-prepared agenda injected into sessions. Streaks. *Done when: 6–8 consecutive weeks of real check-ins for our family.*

**Phase 3 — Closed beta.** 10–20 couples from close network (founder couples, new parents — Dubai/Amman). Free, manually onboarded, WhatsApp group for feedback. *Gate: Phase 2 passed.*

**Phase 4 — Expand + monetize.** Trends view, Money-lite, ICS export, Vault (Supabase Storage + encryption + 2FA) as paid anchor. Flip Stripe on: **$10–12/month per unit** (one price, per unit not per person — the pricing is brand). Free tier = Connect. *Gate: beta retention proof (below).*

**Kill criterion:** if the ritual doesn't stick for our own family in Phase 2, stop before beta. No amount of building fixes a ritual that fails its best-case users.

---

## Success Metrics (unchanged north star)

**Weekly Active Units** — pairs completing ≥1 action/week.

| Metric | Beta target |
|--------|------------|
| Check-in completion rate | >60% |
| Weekly unit retention | >50% |
| Qualitative | "We actually do our check-ins now" |

---

## Open decisions

- [ ] Product identity: stays in `web0ai` as Web0 R&D. Domain + name check before beta (Phase 3).
- [ ] WhatsApp productization path (Business API vs Twilio) — decide only after Phase 2 passes.
- [ ] Custom check-in questions: move from localStorage to `check_in_templates` table during Phase 1 (table already exists).
- [ ] >2 adults per unit (co-parenting): explicitly out of scope until after beta.

---

*Internal. Do not distribute. v0.1 remains in `prototype/PRD.md` for the full pillar specs — still the reference for anything we later un-defer.*
