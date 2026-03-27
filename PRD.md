# Unit — Product Requirements Document

**Version:** 0.1  
**Date:** March 2026  
**Status:** Working Draft  
**Authors:** Ala Haddad, Zein  

---

## Executive Summary

Unit is a web-based family operating system for couples and small family units. It combines relationship check-ins, shared life planning, financial transparency, and document storage into a single, intentionally designed product. Priced at $5–10/month per unit (not per person), it targets couples who want to feel coordinated and intentional — without the friction of spreadsheets, sticky notes, and scattered apps.

A functional prototype exists. This PRD documents what is built and defines the path to MVP and v1.

---

## Problem Statement

Couples and families are running their lives across a fragmented stack: WhatsApp for coordination, Google Sheets for budgets, Notion for goals, Notes app for ideas, and memory for everything else. Nothing is shared by design. Nothing prompts the right conversations at the right time.

The result: life admin feels reactive, transactional, and often like one person's burden. Important things — financial alignment, relationship check-ins, shared goals — don't have a home. They slip.

There is no product that treats a couple as a unit and gives that unit the infrastructure it deserves.

---

## Product Vision

Unit is the operating system for your family. It holds your shared identity, keeps you aligned on what matters, surfaces the right things at the right time, and makes the unsexy parts of life feel intentional.

It's not a task manager. It's not a calendar. It's the layer underneath everything — the place you come back to weekly to check in on your relationship, your finances, your plans, and each other.

**Name:** Unit  
**Tagline:** Your family, beautifully organized.  
**Type:** Web app (mobile-responsive), subscription SaaS  

---

## User Personas

### Persona 1: The Founder Couple (Primary)

**Profile:**  
Zein (30, product/ops) and Ala (31, founder/builder). Dubai-based. Both working, both ambitious. One income is variable, one is salaried. They travel frequently, have a dog, and are planning for a baby. They're intentional about their relationship but life moves fast.

**Pain Points:**
- Financial conversations happen reactively (when something goes wrong, not by design)
- Check-ins exist in theory but don't happen consistently
- Plans live in Ala's head or a random Notion doc neither has opened in 3 months
- No shared view of investments, spending, or savings trajectory
- Passport renewals, lease dates, medical records — all scattered

**What they want from Unit:**
- Weekly check-in that actually happens, with structure they trust
- Shared financial picture without full exposure if one person prefers privacy
- One place for "our bucket list" and upcoming trips
- A dashboard that shows them what's coming up this week

---

### Persona 2: The Settled Couple (Secondary)

**Profile:**  
Layla (35, teacher) and Kareem (38, finance). Abu Dhabi. Two kids under 8. More routine, more structure needed. Layla handles most household admin. Kareem handles most finances. Neither has full visibility into the other's domain.

**Pain Points:**
- Kareem doesn't know when school events are. Layla doesn't know the investment portfolio.
- No shared family goals — everyone's just executing tasks
- "We never talk about anything other than logistics"
- Documents like insurance policies and kids' health records are in different places

**What they want from Unit:**
- A shared calendar that pulls from everywhere
- Financial overview they can both see without one person explaining everything
- Structured monthly check-in they can do in 30 minutes
- Safe storage for family documents with expiry alerts

---

## Core Pillars + Features

Unit is organized into 5 pillars plus a cross-cutting Schedule feature. All accessible via sidebar navigation.

---

### Onboarding (5-Step Flow)

The onboarding flow sets up the unit before landing on the dashboard. It is linear, friendly, and takes ~3 minutes.

| Step | Name | What happens |
|------|------|--------------|
| 1 | Who are you | Name, email, invite partner via link/email |
| 2 | Your unit | Select member types (Partner, Kids, Pets, Extended family), add names and count |
| 3 | What matters most | Select active pillars — Us, Connect, Life, Money, Vault (all on by default) |
| 4 | Your cadence | Check-in frequency (Weekly/Biweekly/Monthly), add up to 3 key dates with label |
| 5 | Make it yours | Choose visual theme: Minimal Light, Minimal Dark, Funky & Fun, Sophisticated |

---

### Dashboard

The central home screen. Loads first on every session.

**Components:**
- **Greeting + date** — personalized greeting with current date
- **Check-in banner** — shows next check-in date; CTAs: "Add to calendar", "Send reminder"
- **Coming Up** — horizontally scrollable upcoming events pulled from Schedule
- **Family Goals** — editable goals with draggable progress bars and deadlines
  - Goal reaches 100%: emoji celebration + sound → auto-archives
  - Archive flow available manually
- **Pillars overview** — 5 cards, each with status summary; click-through to each pillar

---

### Pillar 1: Us

**Purpose:** Identity layer — who you are individually and together.

**Sections:**

**My Profile**
- Editable: name, role, birthday
- Illustrated SVG avatar (personalized)
- North star (text field)
- "What I'm working on this week" — tag chips, editable
- "Habits & skills I'm learning" — tag chips, editable

**Our Unit**
- Unit name (editable)
- Member cards (each clickable → profile modal)
- Family theme picker: Fruits / Flowers / Plants / Stars — avatar illustrations change per theme
- Add member button

**This Season**
- Shared intention field — optional, free text, editable by both partners

---

### Pillar 2: Connect

**Purpose:** Structured, intentional communication between partners.

**Sections:**

**Check-in Settings**
- Cadence: Weekly / Biweekly / Monthly
- Depth: Short (15 min) / Less Short (30 min) / Not Short (60 min)

**This Week's Check-in**
- Shows current status (pending / in progress / completed)
- CTA: "Start check-in"
- Both partners fill in responses side by side (async or simultaneous)

**Question Framework**

Questions are dynamically generated based on depth. Wording adapts to cadence (e.g., "this week" vs "this month").

| Depth | Duration | Questions |
|-------|----------|-----------|
| Short | 15 min | Feeling (1–10), appreciation, need, looking forward to |
| Less Short | 30 min | Above + what went well, what was hard, team alignment (1–10), tension, shared goal |
| Not Short | 60 min | All above + shared goals review, physical/mental health, what I wish you understood, what I'm holding in, start/stop/change, 3-month vision |

Framework is research-backed (Gottman methodology + cofounder sync framework).

Custom questions: users can add/edit questions per depth level. Templates save to localStorage.

**Check-in History**
- All past sessions listed (date, depth, cadence)
- Click any row → view session notes (read-only)
- Export session as PDF/text
- Analyze trends: SVG chart + AI-generated insights (trends in alignment scores, emotional patterns)

---

### Pillar 3: Life

**Purpose:** Experiences, adventures, and shared plans.

**Tabs:**

**Travel**
- Upcoming trips with status badges: Planning / Confirmed
- Wishlist destinations as chips (add/remove)

**Bucket List**
- Two sections: Our list + Personal list
- Checkbox items — cross off, archive completed
- Add new items inline

**Date Ideas**
- Saved ideas with Done / Remove actions
- Add your own ideas
- Browse templates library:
  - Question Games
  - Date Formats
  - Adventure Ideas
- Save any template idea to your list

---

### Pillar 4: Money

**Purpose:** Financial life managed together, on your terms.

**Privacy Settings** (accessed via ⚙️ icon, requires confirmation to change)
- 🤝 Full transparency — both partners see everything
- 🫧 Shared overview — high-level view only, no line items
- 🔐 Fully private — each person manages their own, no sharing

**Data Import**
- Drag & drop: PDF, CSV, XLS
- Simulated parsing → review & confirm screen → auto-populates relevant sections (budget, investments, debt)

**Sections:**

| Section | What's shown |
|---------|-------------|
| Overview | Net worth, monthly spend vs income, savings rate, goals count |
| Budget | Donut chart, income per person, expense line items (editable, drag to reorder) |
| Financial Goals | Progress bars, deadlines, edit + archive actions |
| Investments | Per-person line items, editable |
| Debt Tracker | Progress bars, monthly payment tracking |

**Integrations:**
- Google Sheets sync: paste link → live read (no write-back)
- "Connect bank" — placeholder, coming in full version

---

### Pillar 5: Vault

**Purpose:** Secure shared document storage for the family unit.

> ⚠️ Not built in prototype. This is the spec for v1 implementation.

**Features:**
- Upload documents (PDF, images)
- Categories: Identity, Property, Finance, Health, Other
- Per-person or shared ownership per document
- Expiry date field with alerts (e.g., "Passport expiring in 3 months")
- 2FA gate required to view sensitive documents

**Storage model:** Documents stored securely, access scoped to unit members only.

---

### Feature: Schedule

**Purpose:** Shared family calendar with auto-population from all pillars.

**Views:** Agenda (default) | Month | Week

**Auto-populated events from pillars:**
- Goal deadlines → tagged with Goals badge
- Trips → tagged with Life badge
- Check-ins → tagged with Connect badge

**Manual event creation:**
- Fields: name, date, category, notes, invite members
- Custom categories with emoji + color picker
- Attendee avatars shown on event row

**Export options:**
- iCal subscribe link
- Download .ics
- Google Calendar sync (OAuth — coming in full version)

---

## MVP Scope (User Testing)

The MVP is scoped for initial testing with close network (couples around Ala + Zein).

**In MVP:**
- Auth: sign up + invite partner
- Pillar: **Connect** — check-ins fully functional, both partners fill in separately
- Pillar: **Us** — profiles + unit setup
- Dashboard: goals + coming up (manual entry only)
- Schedule: basic agenda view

**Not in MVP (deferred to v1):**
- Pillar: Life
- Pillar: Money
- Pillar: Vault
- Check-in trend analysis
- Google Sheets sync
- Calendar export (iCal / Google OAuth)
- File uploads

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Express.js + PostgreSQL + Drizzle ORM |
| Auth | Privy (email, social, wallet) |
| Payments | Stripe (subscription, $5–10/month) |
| Deploy | Replit (primary), Netlify (static assets if needed) |

**Notes:**
- Mobile-responsive web first. No native app in v1.
- Privy handles partner invite + multi-user auth without complex custom flows.
- Drizzle ORM provides type-safe DB layer with minimal overhead.

---

## Business Model

**Pricing:** Per unit (not per person). One subscription covers both partners.

| Tier | Price | What's included |
|------|-------|-----------------|
| Free | $0 | 1 pillar (Connect), basic features |
| Paid | $5–10/month | All 5 pillars, full feature access |

**Future revenue streams (not in v1):**
- Premium templates (date ideas, check-in formats)
- AI insights add-on (trend analysis, recommendations)
- Bank integrations (direct sync vs manual import)

**GTM Sequence:**
1. Close network testing — couples around Ala + Zein
2. Influencer seeding (lifestyle, relationship, productivity content)
3. Paid ads (Meta / TikTok targeting couples, newlyweds, family planning)

---

## Success Metrics

**North star metric:** Weekly Active Units (WAUs) — pairs completing at least one action per week.

| Metric | Target (month 1) | Target (month 3) |
|--------|-----------------|-----------------|
| Beta users (units) | 20 | 100 |
| Check-in completion rate | >60% | >70% |
| Weekly retention (unit level) | >50% | >60% |
| Paid conversion (free → paid) | — | >20% |
| Churn (monthly) | — | <10% |

**Qualitative signals:**
- "We actually do our check-ins now"
- "This replaced 3 different tools"
- "My partner uses it without me having to remind them"

---

## Open Questions

**Product:**
- [ ] Should Vault be gated behind paid tier only, given the security complexity?
- [ ] How does check-in work when partners are in different time zones — does one person start and the other completes async?
- [ ] Is there a notification layer (push/email) for check-in reminders, or is that out of scope for MVP?
- [ ] What happens when a unit has more than 2 adults (e.g., co-parenting arrangements)?

**Technical:**
- [ ] Document storage for Vault — S3 vs Supabase Storage? Encryption at rest required.
- [ ] LocalStorage for custom question templates won't survive device switches. Should this move to DB in v1?
- [ ] Partner invite flow: email link? One-time code? How does onboarding complete for invited partner?

**Business:**
- [ ] Free tier: is Connect the right single pillar to expose? Or is Dashboard + Us more compelling for conversion?
- [ ] Pricing: $5 vs $10 — is there a reason to differentiate tiers, or keep it simple at one price point?
- [ ] Category: this lives adjacent to relationship apps (Lasting, Paired), productivity (Notion, Coda), and finance (Copilot, YNAB). Where do we anchor the positioning?

---

## Future Considerations (Post-v1)

- **AI layer:** Pattern recognition across check-in history, financial trends, and goal progress. Proactive nudges ("You haven't added a date idea in 6 weeks").
- **Bank integrations:** Direct Plaid/TrueLayer sync to replace manual CSV upload.
- **Mobile app:** Native iOS/Android once web retention is proven.
- **Shared notes / async messaging:** Low-fi async layer for thoughts between check-ins.
- **Milestone tracking:** Relationship milestones, anniversaries, custom "seasons" with archiving.
- **Template marketplace:** Community-sourced check-in formats, bucket list packs, date idea collections.
- **Family expansion:** Better support for kids profiles, school events, health tracking.

---

*This document is internal. Do not distribute.*
