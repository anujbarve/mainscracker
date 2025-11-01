# Blog Migration - Database Schema Changes

## Required Schema Changes to `help_content` Table

Add the following columns to the existing `help_content` table:

```sql
-- Add imageUrl column for blog post cover images
ALTER TABLE public.help_content 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add description column for blog post descriptions/excerpts
ALTER TABLE public.help_content 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add created_by column to track the author (references profiles.id)
ALTER TABLE public.help_content 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Create index on created_by for faster joins
CREATE INDEX IF NOT EXISTS idx_help_content_created_by 
ON public.help_content(created_by) 
WHERE created_by IS NOT NULL;

-- Create index on image_url for queries (optional but good practice)
CREATE INDEX IF NOT EXISTS idx_help_content_image_url 
ON public.help_content(image_url) 
WHERE image_url IS NOT NULL;
```

## Field Mapping

### Existing Fields (No Changes Needed)
- `id` → Post ID
- `topic` → Post `title`
- `slug` → Post `slug`
- `content` → Post `content` (HTML)
- `keywords` → Post `tags` (array)
- `category` → Post `category`
- `published_at` → Post `date`
- `is_active` → Used for filtering published posts
- `sort_order` → Used for ordering posts
- `created_at` → Used for sorting
- `updated_at` → Used for tracking updates

### New Fields (To Be Added)
- `image_url` → Post `imageUrl`
- `description` → Post `description`
- `created_by` → Used to fetch author info from `profiles` table

### Author Information
- Author `name` → Fetched from `profiles.full_name` via `created_by`
- Author `avatarUrl` → Will use a default avatar or can be extended to profiles later

## Notes

1. All existing `help_content` rows will have `NULL` values for new columns initially
2. The migration script will populate these fields from `data.ts` during initial migration
3. `created_by` will be set to an admin user during migration
4. The `faq` column can remain but won't be used by blog (help articles may still use it)

