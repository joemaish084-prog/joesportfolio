
CREATE POLICY "Service role can delete blog posts"
  ON public.blog_posts
  FOR DELETE
  TO service_role
  USING (true);
