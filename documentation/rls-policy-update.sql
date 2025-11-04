-- RLS Policy Update for Public Blog Access
-- This allows unauthenticated users to read blog posts that are active and published

-- First, drop the existing restrictive policy (if you want to keep it for help articles, skip this)
-- DROP POLICY IF EXISTS help_content_read_all ON public.help_content;

-- Create a new policy that allows public read access for blog posts
-- This policy allows anyone (including unauthenticated users) to read posts that are:
-- 1. Active (is_active = true)
-- 2. Published (published_at IS NOT NULL)
-- 3. Published date is in the past or now (published_at <= now())

CREATE POLICY help_content_public_read ON public.help_content
  FOR SELECT
  TO public
  USING (
    is_active = true 
    AND published_at IS NOT NULL 
    AND published_at <= now()
  );

-- Optional: Keep the authenticated policy for help articles that might need auth
-- Or modify the existing policy to allow both authenticated users and public for blog posts
CREATE POLICY help_content_authenticated_read ON public.help_content
  FOR SELECT
  TO authenticated
  USING (
    is_active = true 
    AND (
      published_at IS NOT NULL 
      OR published_at IS NULL
    )
  );

-- Notes:
-- - The public policy only allows reading active, published blog posts
-- - The authenticated policy allows reading any active content (for help articles)
-- - Admin policy (help_content_admin_manage) remains unchanged for full admin access
-- - If you want to combine them, you can use: USING (is_active = true)

