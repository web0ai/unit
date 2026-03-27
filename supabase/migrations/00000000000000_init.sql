-- Unit — Initial schema + RLS
-- Run this in Supabase SQL Editor or via migrations

-- ═══════════════════════════════════════════════
-- TABLES
-- ═══════════════════════════════════════════════

CREATE TABLE units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Our Unit',
  theme text NOT NULL DEFAULT 'fruits',
  visual_theme text NOT NULL DEFAULT 'minimal-light',
  check_in_cadence text NOT NULL DEFAULT 'weekly',
  check_in_depth text NOT NULL DEFAULT 'short',
  subscription_status text NOT NULL DEFAULT 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  name text,
  role text DEFAULT 'partner',
  unit_id uuid REFERENCES units(id),
  avatar_url text,
  birthday date,
  north_star text,
  working_on jsonb DEFAULT '[]'::jsonb,
  habits jsonb DEFAULT '[]'::jsonb,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  title text NOT NULL,
  progress integer NOT NULL DEFAULT 0,
  deadline date,
  is_archived boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  cadence text NOT NULL,
  depth text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE check_in_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_id uuid NOT NULL REFERENCES check_ins(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  responses jsonb NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE check_in_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  depth text NOT NULL,
  questions jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  title text NOT NULL,
  destination text,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'planning',
  notes text,
  budget numeric(10,2),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE bucket_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  title text NOT NULL,
  owner text NOT NULL DEFAULT 'shared',
  is_completed boolean DEFAULT false,
  category text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE date_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text,
  location text,
  cost_level text,
  is_favorite boolean DEFAULT false,
  last_done_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE income_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  title text NOT NULL,
  amount numeric(12,2) NOT NULL,
  type text NOT NULL,
  category text,
  is_recurring boolean DEFAULT false,
  date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE financial_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  title text NOT NULL,
  target_amount numeric(12,2) NOT NULL,
  current_amount numeric(12,2) NOT NULL DEFAULT 0,
  deadline date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  title text NOT NULL,
  principal numeric(12,2) NOT NULL,
  interest_rate numeric(5,2),
  minimum_payment numeric(10,2),
  balance numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  title text NOT NULL,
  date timestamptz NOT NULL,
  end_date timestamptz,
  category text,
  recurrence text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- HELPER FUNCTION — get current user's unit_id
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_user_unit_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT unit_id FROM profiles WHERE id = auth.uid()
$$;

-- ═══════════════════════════════════════════════
-- AUTO-CREATE PROFILE ON SIGNUP
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_in_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_in_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bucket_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- ── Profiles ──
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can read unit members' profiles"
  ON profiles FOR SELECT USING (unit_id = get_user_unit_id());
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (id = auth.uid());

-- ── Units ──
CREATE POLICY "Users can read own unit"
  ON units FOR SELECT USING (id = get_user_unit_id());
CREATE POLICY "Users can update own unit"
  ON units FOR UPDATE USING (id = get_user_unit_id());
CREATE POLICY "Authenticated users can create units"
  ON units FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ── Members (non-login family members) ──
CREATE POLICY "Unit members can read"
  ON members FOR SELECT USING (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can insert"
  ON members FOR INSERT WITH CHECK (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can update"
  ON members FOR UPDATE USING (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can delete"
  ON members FOR DELETE USING (unit_id = get_user_unit_id());

-- ── Invites ──
CREATE POLICY "Unit members can read invites"
  ON invites FOR SELECT USING (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can create invites"
  ON invites FOR INSERT WITH CHECK (unit_id = get_user_unit_id());
-- Accept flow handled server-side (service role)

-- ── Goals ──
CREATE POLICY "Unit members can read goals"
  ON goals FOR SELECT USING (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can insert goals"
  ON goals FOR INSERT WITH CHECK (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can update goals"
  ON goals FOR UPDATE USING (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can delete goals"
  ON goals FOR DELETE USING (unit_id = get_user_unit_id());

-- ── Check-ins ──
CREATE POLICY "Unit members can read check-ins"
  ON check_ins FOR SELECT USING (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can insert check-ins"
  ON check_ins FOR INSERT WITH CHECK (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can update check-ins"
  ON check_ins FOR UPDATE USING (unit_id = get_user_unit_id());

-- ── Check-in Responses ──
-- Users can always read their own responses
CREATE POLICY "Users can read own responses"
  ON check_in_responses FOR SELECT USING (user_id = auth.uid());
-- Users can read partner's responses only when check-in is completed (both submitted)
CREATE POLICY "Users can read partner responses when check-in completed"
  ON check_in_responses FOR SELECT
  USING (
    check_in_id IN (
      SELECT id FROM check_ins
      WHERE unit_id = get_user_unit_id()
      AND status = 'completed'
    )
  );
CREATE POLICY "Users can submit own responses"
  ON check_in_responses FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ── Check-in Templates ──
CREATE POLICY "Unit members can read templates"
  ON check_in_templates FOR SELECT USING (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can insert templates"
  ON check_in_templates FOR INSERT WITH CHECK (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can update templates"
  ON check_in_templates FOR UPDATE USING (unit_id = get_user_unit_id());

-- ── Trips ──
CREATE POLICY "Unit members can read trips"
  ON trips FOR SELECT USING (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can insert trips"
  ON trips FOR INSERT WITH CHECK (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can update trips"
  ON trips FOR UPDATE USING (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can delete trips"
  ON trips FOR DELETE USING (unit_id = get_user_unit_id());

-- ── Bucket List ──
CREATE POLICY "Unit members can read bucket list"
  ON bucket_list_items FOR SELECT USING (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can insert bucket list"
  ON bucket_list_items FOR INSERT WITH CHECK (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can update bucket list"
  ON bucket_list_items FOR UPDATE USING (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can delete bucket list"
  ON bucket_list_items FOR DELETE USING (unit_id = get_user_unit_id());

-- ── Date Ideas ──
CREATE POLICY "Unit members can read date ideas"
  ON date_ideas FOR SELECT USING (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can insert date ideas"
  ON date_ideas FOR INSERT WITH CHECK (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can update date ideas"
  ON date_ideas FOR UPDATE USING (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can delete date ideas"
  ON date_ideas FOR DELETE USING (unit_id = get_user_unit_id());

-- ── Income & Expenses ──
CREATE POLICY "Unit members can read income/expenses"
  ON income_expenses FOR SELECT USING (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can insert income/expenses"
  ON income_expenses FOR INSERT WITH CHECK (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can update income/expenses"
  ON income_expenses FOR UPDATE USING (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can delete income/expenses"
  ON income_expenses FOR DELETE USING (unit_id = get_user_unit_id());

-- ── Financial Goals ──
CREATE POLICY "Unit members can read financial goals"
  ON financial_goals FOR SELECT USING (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can insert financial goals"
  ON financial_goals FOR INSERT WITH CHECK (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can update financial goals"
  ON financial_goals FOR UPDATE USING (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can delete financial goals"
  ON financial_goals FOR DELETE USING (unit_id = get_user_unit_id());

-- ── Debts ──
CREATE POLICY "Unit members can read debts"
  ON debts FOR SELECT USING (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can insert debts"
  ON debts FOR INSERT WITH CHECK (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can update debts"
  ON debts FOR UPDATE USING (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can delete debts"
  ON debts FOR DELETE USING (unit_id = get_user_unit_id());

-- ── Events ──
CREATE POLICY "Unit members can read events"
  ON events FOR SELECT USING (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can insert events"
  ON events FOR INSERT WITH CHECK (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can update events"
  ON events FOR UPDATE USING (unit_id = get_user_unit_id());
CREATE POLICY "Unit members can delete events"
  ON events FOR DELETE USING (unit_id = get_user_unit_id());
