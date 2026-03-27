import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  numeric,
  date,
} from "drizzle-orm/pg-core";

// ─── Core ─────────────────────────────────────────

export const units = pgTable("units", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().default("Our Unit"),
  theme: text("theme").notNull().default("fruits"),
  visualTheme: text("visual_theme").notNull().default("minimal-light"),
  checkInCadence: text("check_in_cadence").notNull().default("weekly"),
  checkInDepth: text("check_in_depth").notNull().default("short"),
  subscriptionStatus: text("subscription_status").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // = auth.uid()
  email: text("email").notNull(),
  name: text("name"),
  role: text("role").default("partner"),
  unitId: uuid("unit_id").references(() => units.id),
  avatarUrl: text("avatar_url"),
  birthday: date("birthday"),
  northStar: text("north_star"),
  workingOn: jsonb("working_on").$type<string[]>().default([]),
  habits: jsonb("habits").$type<string[]>().default([]),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const members = pgTable("members", {
  id: uuid("id").defaultRandom().primaryKey(),
  unitId: uuid("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(), // kid, pet, extended
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invites = pgTable("invites", {
  id: uuid("id").defaultRandom().primaryKey(),
  unitId: uuid("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending, accepted, expired
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goals = pgTable("goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  unitId: uuid("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  progress: integer("progress").notNull().default(0),
  deadline: date("deadline"),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Connect ──────────────────────────────────────

export const checkIns = pgTable("check_ins", {
  id: uuid("id").defaultRandom().primaryKey(),
  unitId: uuid("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),
  cadence: text("cadence").notNull(),
  depth: text("depth").notNull(),
  status: text("status").notNull().default("pending"), // pending, in_progress, completed
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const checkInResponses = pgTable("check_in_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  checkInId: uuid("check_in_id")
    .references(() => checkIns.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => profiles.id)
    .notNull(),
  responses: jsonb("responses").$type<Record<string, string>>().notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const checkInTemplates = pgTable("check_in_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  unitId: uuid("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),
  depth: text("depth").notNull(),
  questions: jsonb("questions").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Life ─────────────────────────────────────────

export const trips = pgTable("trips", {
  id: uuid("id").defaultRandom().primaryKey(),
  unitId: uuid("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  destination: text("destination"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  status: text("status").notNull().default("planning"), // planning, confirmed
  notes: text("notes"),
  budget: numeric("budget", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bucketListItems = pgTable("bucket_list_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  unitId: uuid("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  owner: text("owner").notNull().default("shared"), // shared, or user name
  isCompleted: boolean("is_completed").default(false),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dateIdeas = pgTable("date_ideas", {
  id: uuid("id").defaultRandom().primaryKey(),
  unitId: uuid("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  category: text("category"),
  location: text("location"),
  costLevel: text("cost_level"), // free, $, $$, $$$
  isFavorite: boolean("is_favorite").default(false),
  lastDoneAt: timestamp("last_done_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Money ────────────────────────────────────────

export const incomeExpenses = pgTable("income_expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  unitId: uuid("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").references(() => profiles.id),
  title: text("title").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  type: text("type").notNull(), // income, expense
  category: text("category"),
  isRecurring: boolean("is_recurring").default(false),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const financialGoals = pgTable("financial_goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  unitId: uuid("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  targetAmount: numeric("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: numeric("current_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  deadline: date("deadline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const debts = pgTable("debts", {
  id: uuid("id").defaultRandom().primaryKey(),
  unitId: uuid("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").references(() => profiles.id),
  title: text("title").notNull(),
  principal: numeric("principal", { precision: 12, scale: 2 }).notNull(),
  interestRate: numeric("interest_rate", { precision: 5, scale: 2 }),
  minimumPayment: numeric("minimum_payment", { precision: 10, scale: 2 }),
  balance: numeric("balance", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Schedule ─────────────────────────────────────

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  unitId: uuid("unit_id")
    .references(() => units.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  category: text("category"),
  recurrence: text("recurrence"), // none, daily, weekly, monthly, yearly
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
