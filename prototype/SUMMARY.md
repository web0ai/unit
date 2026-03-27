# Unit — Build Summary
**Date:** March 24, 2026  
**Built by:** Jello + Zein  
**For:** Ala to review and pick up for engineering

---

## What We Built

A fully interactive, multi-page prototype for **Unit** — a couple/family operating system. Built in one day, deployed at **https://unit-app.netlify.app**

Everything is pure HTML/CSS/JS — no framework, no backend, no database. Static files on Netlify. Ready to hand off to Claude Code for the real build.

---

## Pages Built (7 pages + onboarding)

| Page | URL | Status |
|------|-----|--------|
| Onboarding | /onboarding.html | ✅ Full 8-step flow |
| Dashboard | /dashboard.html | ✅ Complete |
| Us | /us.html | ✅ Complete |
| Connect | /connect.html | ✅ Complete |
| Life | /life.html | ✅ Complete |
| Money | /money.html | ✅ Complete |
| Vault | /vault.html | ✅ Complete |
| Schedule | /schedule.html | ✅ Complete |

---

## Onboarding Flow (8 steps)

1. **Intro splash** — Logo, taglines, product description, "Get started →"
2. **Who are you** — Name, email, invite partner
3. **Your unit** — Members (Partner, Kids, Pets, Extended family) + names
4. **What matters most** — Pick pillars (all on by default)
5. **Why are you here** — Multi-select motivations (6 options)
6. **First goals** — Shared goal + dream destination/bucket list item
7. **Family theme** — Fruits / Flowers / Plants / Stars (avatars change)
8. **Your cadence** — Check-in frequency + key dates
9. **Final setup** — Money privacy + visual theme (Minimal Light/Dark, Funky, Sophisticated)
10. **Completion screen** — Personalized summary with name, theme, goal, destination

**Completion → dashboard.html**

---

## Dashboard

- Personalized greeting + date
- Couple check-in banner (next date, Add to calendar, Send reminder)
- Coming Up — scrollable upcoming events
- Family Goals — draggable progress bars, deadlines (red if urgent), edit inline, archive
  - 100% = 🎉 emoji + Web Audio celebration → auto-archive
- Pillars overview — 5 cards with status, click-through nav

---

## Pillar 1: Us

- **My Profile** — name, role, birthday (editable), illustrated SVG avatar, north star, "working on this week" chips, "habits & skills" chips
- **Our Unit** — unit name, member cards (click → slide-in profile modal with full details)
- **Family theme** — Fruits/Flowers/Plants/Stars: avatars swap to illustrated characters per theme, saved to localStorage
- **This Season** — shared intention, optional, editable
- **Add member** — opens form with name + role
- **Edit profile** — all fields editable inline

---

## Pillar 2: Connect

- **Check-in settings** — cadence (Weekly/Biweekly/Monthly) + depth (Short/Less Short/Not Short)
- **This week's check-in** — status, start CTA
- **Questions form** — side-by-side for Zein + Ala, dynamic per depth, wording adapts to cadence
- **Edit questions** — "Edit questions" button → edit modal per depth, saves as template (localStorage), toast "Saved as your Short template ✓"
- **Check-in history** — click any row → read-only session notes modal
- **Export** — Export as PDF/CSV (toast "coming soon")
- **Analyze trends** — SVG line chart + 3 insight cards

**Question framework (Gottman + cofounder sync research):**
- Short (15 min): feeling 1-10, appreciation, need, looking forward to
- Less Short (30 min): + what went well, what was hard, team alignment 1-10, tension, shared goal
- Not Short (60 min): + shared goals, health 1-10, what I wish you understood, what I'm holding in, start/stop/change, 3-month vision

---

## Pillar 3: Life

**Travel tab:**
- Upcoming trips with status badges (Planning/Confirmed)
- Click trip → slide-in panel with flights, hotel, cost, day-by-day itinerary, to-do checklist
- "Sync to Schedule" + "Add to Calendar" buttons
- Wishlist — expandable destination cards (why go, who added, what to do, best time)
- Add destination form

**Bucket List tab:**
- 3 sub-tabs: Our list / Zein's list / Ala's list
- Click any item → expand panel (what's needed, by when, what's blocking, notes)
- Add item → choose Our list or My list

**Date Ideas tab:**
- Saved ideas — click to expand details (location, cost, logistics, who, notes)
- "Done ✓" marks as complete
- Add your own — proper form (name, category, location, cost, logistics, who, notes)
- Browse templates — 3 categories (Question Games / Date Formats / Adventure Ideas)
  - Question Games show real questions (36 Questions, Future Vision, The And Deck)
  - Save any template → adds to saved list + toast

---

## Pillar 4: Money

- **Privacy** — accessed via ⚙️ settings (not a banner), 3 options: 🤝 Full / 🫧 Shared / 🔐 Private
- **Bulk import** — drag & drop PDF/CSV/XLS → fake parse → review & confirm → updates budget/investments/debt automatically
- **Overview** — net worth, monthly spend/income, savings rate, goals count
- **Budget** — donut chart (SVG, inline), income per person (editable), expenses list (drag to reorder, edit)
- **Financial goals** — progress bars, deadlines, edit, archive
- **Investments** — per person, editable line items
- **Debt tracker** — progress bars, monthly payments, "📎 from import" badges
- **Google Sheets sync** — paste link, connect (toast "coming soon")

---

## Pillar 5: Vault

- **Missing doc nudges** — dismissable banner with 10 suggested docs (passport, residency, insurance etc.)
- **Category tabs** — All / Identity / Property / Finance / Health / Other
- **Document grid** — cards with expiry color coding (red < 3mo, amber < 12mo, green > 12mo)
- **"View" button** — opens 2FA modal with 6-digit input (auto-advance boxes)
- **Upload form** — name, category, owner (shared/personal), expiry, 2FA toggle
- **Expiry alerts** section — with "Set reminder" CTA
- **⋯ menu** on each card — Rename / Move / Delete

---

## Schedule (utility feature, below pillars in sidebar)

- **Agenda view** (default) — chronological events grouped by month
- Auto-pulled events from other pillars (🔒 badge = can't delete)
- Manually add events (name, date, category, notes, invite members)
- Attendee avatar circles on event rows
- **Month view** — calendar grid with colored dots, click day → events
- **Week view** — 7-column layout with event chips
- **Custom categories** — manage categories (⚙️ button), edit name/emoji/color, add new
- **Export** — iCal subscribe link + Google Calendar OAuth modal

---

## Design System

**Palette (Olive Garden Feast — chosen by Zein):**
- Background: #FEFAE0 (cream)
- Text: #283618 (dark green)
- Accent: #606C38 (olive)
- Warm: #DDA15E (amber)
- Deep warm: #BC6C25 (terracotta)

**Typography:** Sora (headings) + Inter (body) — Google Fonts

**Patterns:** Slide-in panels from right, modal overlays, toast notifications, chip/pill inputs, draggable progress bars

---

## Branding

- **Name:** Unit
- **Main tagline:** Your unit, organized your way.
- **Secondary tagline:** The operating system for your unit.
- **Pricing:** Free (Connect only) + $12/month (all pillars)
- **Competitors:** Honeydue (finance only), Paired/Between/Couple (connection only) — Unit is the only full life OS

---

## Prototype URL

**https://unit-app.netlify.app**

Start: https://unit-app.netlify.app/onboarding.html  
Dashboard: https://unit-app.netlify.app/dashboard.html

---

## PRD

Full PRD is at `/Users/hub71/jello-workspace/familyos-preview/PRD.md`

Covers: problem, vision, personas, all pillars, MVP scope, tech stack, pricing, GTM, success metrics, open questions.

---

## Next Step for Ala

Build the real product. MVP scope (from PRD):
1. Auth — sign up + invite partner (Privy)
2. Database — PostgreSQL, tables for users/units/members/goals/check-ins
3. Connect pillar — check-ins, both partners, real data
4. Us pillar — profiles, unit setup
5. Dashboard — goals + coming up (manual)
6. Schedule — basic agenda

Stack: React + Vite + Tailwind + Express + PostgreSQL + Drizzle + Privy + Stripe

The prototype is the spec. Every interaction, layout, and flow is documented here and in the PRD.
