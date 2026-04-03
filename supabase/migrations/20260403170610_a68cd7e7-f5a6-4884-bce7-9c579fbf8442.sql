
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  content TEXT NOT NULL,
  topic TEXT NOT NULL,
  read_time INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read blog posts"
  ON public.blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can insert blog posts"
  ON public.blog_posts
  FOR INSERT
  TO service_role
  WITH CHECK (true);
