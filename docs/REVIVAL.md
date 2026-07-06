# Phase 0 Revival Runbook

The original Supabase project (`mdbduzcmthnsfqrzurty`) was deleted after free-tier inactivity (confirmed 2026-07-06 — DNS gone). No data existed beyond March test rows. Everything else is intact: the code builds clean, the Vercel project `unit` exists (unit-sable.vercel.app), and this repo is linked to it.

Total time: ~10 minutes supervised.

## 1. Create the Supabase project (~2 min, dashboard)

- [supabase.com/dashboard](https://supabase.com/dashboard) → New project, name `unit`, region `eu-central` (closest to Dubai with full features), generate a strong DB password (goes in a password manager, not in the repo).
- From **Project Settings → API**, note: `Project URL`, `anon` key, `service_role` key.

## 2. Apply the schema (~2 min)

Dashboard → SQL Editor → paste the entire contents of
`supabase/migrations/20260327000000_create_schema.sql` → Run.

(This includes all tables **and RLS policies** — do not skip it or apply tables without the policies. Don't use `drizzle-kit push`; the SQL migration is canonical.)

## 3. Set env vars

**Local** — edit `.env.local` (already present, has stale values from the old project):

```
NEXT_PUBLIC_SUPABASE_URL=<Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Vercel** — replace the three stale Production values:

```
vercel env rm NEXT_PUBLIC_SUPABASE_URL production -y
vercel env rm NEXT_PUBLIC_SUPABASE_ANON_KEY production -y
vercel env rm SUPABASE_SERVICE_ROLE_KEY production -y
printf '%s' '<url>'  | vercel env add NEXT_PUBLIC_SUPABASE_URL production
printf '%s' '<anon>' | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
printf '%s' '<key>'  | vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

Also set `NEXT_PUBLIC_APP_URL` to the production URL once known.

## 4. Auth redirect URLs (~1 min, dashboard)

Supabase → Authentication → URL Configuration:
- Site URL: production URL (e.g. `https://unit-sable.vercel.app`)
- Redirect URLs: add `http://localhost:3000/callback` and `https://<prod>/callback`

## 5. Deploy + smoke test

```
vercel --prod
```

Then: sign up → complete onboarding → invite partner (second email) → partner accepts → both see the same unit. That signup **is** the Phase 0 deliverable (founders' unit seeded).

## Notes

- Stripe env vars are intentionally unset — payments are Phase 4. The checkout/webhook routes exist but nothing links to them.
- `DATABASE_URL` (drizzle-kit) is only needed when generating *new* migrations; use the Supabase connection pooler string when that day comes.
