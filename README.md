# Unit

**The operating system for your family** — a check-in ritual with an OS attached.

- **Spec:** [docs/PRD.md](docs/PRD.md) (v0.2, active) · full pillar reference in [prototype/PRD.md](prototype/PRD.md) (v0.1)
- **Design reference:** `prototype/` — interactive HTML prototype, live at [unit-app.netlify.app](https://unit-app.netlify.app)
- **Revive it:** [docs/REVIVAL.md](docs/REVIVAL.md) — Phase 0 runbook (Supabase project + env + deploy)

## Stack

Next.js 16 · Supabase (auth + Postgres + RLS) · Drizzle · Tailwind 4 · Stripe · Vercel (project: `unit`)

## Dev

```
npm ci
npm run dev        # needs .env.local — see .env.example + docs/REVIVAL.md
npm run build
```

DB changes: edit `src/lib/db/schema.ts` → `npm run db:generate` → apply SQL via Supabase (never `drizzle-kit push`).

## Status (2026-07-06)

Phase 0 (revive). All routes build clean; all five pillars scaffolded; check-in (Connect) is the product focus per PRD v0.2. Original Supabase project deleted by free-tier inactivity — recreate via the runbook.
