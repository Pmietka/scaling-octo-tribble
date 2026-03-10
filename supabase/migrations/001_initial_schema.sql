-- StyleSense Initial Schema
-- Run this in your Supabase SQL editor

-- ============================================================
-- Enable necessary extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Profiles table (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  hair_profile_json JSONB,
  location_city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Analyses table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  photos TEXT[] NOT NULL DEFAULT '{}',
  text_input TEXT NOT NULL DEFAULT '',
  ai_response_json JSONB NOT NULL,
  onboarding_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS analyses_user_id_idx ON public.analyses(user_id);
CREATE INDEX IF NOT EXISTS analyses_created_at_idx ON public.analyses(created_at DESC);

-- Enable RLS
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own analyses"
  ON public.analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON public.analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Service role can do everything on analyses"
  ON public.analyses FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- Products table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('shampoo', 'conditioner', 'styling', 'treatment', 'tool')),
  subcategory TEXT,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  affiliate_url TEXT NOT NULL DEFAULT '',
  affiliate_network TEXT NOT NULL DEFAULT '',
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  rating DECIMAL(3, 1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  hair_types TEXT[] NOT NULL DEFAULT '{}',
  concerns TEXT[] NOT NULL DEFAULT '{}',
  key_ingredients TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products(category);
CREATE INDEX IF NOT EXISTS products_is_active_idx ON public.products(is_active);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policies - products are publicly readable
CREATE POLICY "Products are publicly readable"
  ON public.products FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admins can modify products"
  ON public.products FOR ALL
  USING (auth.role() = 'service_role');

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Click Events table (affiliate tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.click_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS click_events_product_id_idx ON public.click_events(product_id);
CREATE INDEX IF NOT EXISTS click_events_timestamp_idx ON public.click_events(timestamp DESC);

-- Enable RLS
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert click events (for tracking)
CREATE POLICY "Anyone can insert click events"
  ON public.click_events FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Service role can view all click events"
  ON public.click_events FOR SELECT
  USING (auth.role() = 'service_role');

-- ============================================================
-- Journal Entries table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS journal_entries_user_id_idx ON public.journal_entries(user_id);
CREATE INDEX IF NOT EXISTS journal_entries_date_idx ON public.journal_entries(date DESC);

-- Enable RLS
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own journal entries"
  ON public.journal_entries FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- Community Posts table (scaffold - future feature)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  before_photo TEXT NOT NULL,
  after_photo TEXT NOT NULL,
  style_name TEXT NOT NULL,
  caption TEXT,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX IF NOT EXISTS community_posts_user_id_idx ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS community_posts_created_at_idx ON public.community_posts(created_at DESC);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community posts are publicly readable"
  ON public.community_posts FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can manage own community posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Storage buckets
-- ============================================================
-- Run these in the Supabase Dashboard -> Storage, or via the CLI
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

-- ============================================================
-- Admin user helper (set admin role manually in profiles or use service role)
-- ============================================================
-- To make a user admin, you can check their email in API routes
-- and compare to ADMIN_EMAILS env variable
