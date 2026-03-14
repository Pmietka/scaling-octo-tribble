-- Community enhancements: add hair_type to posts + post_likes tracking

-- Add hair_type to community_posts
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS hair_type TEXT;

-- Index for filtering by hair type
CREATE INDEX IF NOT EXISTS community_posts_hair_type_idx
  ON public.community_posts(hair_type);

-- ============================================================
-- Post Likes table (track which users liked which posts)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS post_likes_post_id_idx ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS post_likes_user_id_idx ON public.post_likes(user_id);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own likes"
  ON public.post_likes FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Post likes are publicly readable"
  ON public.post_likes FOR SELECT
  USING (TRUE);

-- Allow authenticated users to update likes_count on community_posts
CREATE POLICY "Authenticated users can update post likes_count"
  ON public.community_posts FOR UPDATE
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Allow authenticated users to delete own posts
CREATE POLICY "Users can delete own posts"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- RPC functions for atomic like counts
-- ============================================================
CREATE OR REPLACE FUNCTION increment_likes(post_id UUID)
RETURNS VOID AS $$
  UPDATE public.community_posts
  SET likes_count = likes_count + 1
  WHERE id = post_id;
$$ LANGUAGE SQL SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_likes(post_id UUID)
RETURNS VOID AS $$
  UPDATE public.community_posts
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = post_id;
$$ LANGUAGE SQL SECURITY DEFINER;
