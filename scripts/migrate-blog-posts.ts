/**
 * Migration script to migrate blog posts from data.ts to database
 * 
 * Usage:
 * 1. Make sure you have an admin user ID (will be used as created_by)
 * 2. Run: npx ts-node scripts/migrate-blog-posts.ts
 * 
 * Or import and run from a Next.js API route or admin page
 */

import { createClient } from '@supabase/supabase-js';
import { posts } from '../src/app/(public)/blog/data';

// Initialize Supabase Admin Client
// You'll need to set these environment variables or pass them directly
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Migrates blog posts from data.ts to help_content table
 * @param adminUserId - UUID of an admin user to set as created_by
 */
export async function migrateBlogPosts(adminUserId: string) {
  console.log(`Starting migration of ${posts.length} blog posts...`);

  const results = {
    success: 0,
    skipped: 0,
    errors: 0,
    errorsList: [] as Array<{ slug: string; error: string }>,
  };

  for (const post of posts) {
    try {
      // Check if post already exists by slug
      const { data: existing } = await supabaseAdmin
        .from('help_content')
        .select('id')
        .eq('slug', post.slug)
        .single();

      if (existing) {
        console.log(`⏭️  Skipping "${post.title}" - already exists`);
        results.skipped++;
        continue;
      }

      // Prepare data for insertion
      const insertData = {
        topic: post.title,
        slug: post.slug,
        description: post.description,
        content: post.content,
        keywords: post.tags || [],
        category: post.category,
        image_url: post.imageUrl,
        is_active: true,
        sort_order: 0, // Default, can be updated later
        published_at: parseDate(post.date),
        faq: false,
        created_by: adminUserId,
      };

      // Insert into database
      const { data, error } = await supabaseAdmin
        .from('help_content')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(`✅ Migrated "${post.title}"`);
      results.success++;
    } catch (error: any) {
      console.error(`❌ Error migrating "${post.title}":`, error.message);
      results.errors++;
      results.errorsList.push({
        slug: post.slug,
        error: error.message,
      });
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Success: ${results.success}`);
  console.log(`   ⏭️  Skipped: ${results.skipped}`);
  console.log(`   ❌ Errors: ${results.errors}`);
  
  if (results.errorsList.length > 0) {
    console.log('\n❌ Errors:');
    results.errorsList.forEach(({ slug, error }) => {
      console.log(`   - ${slug}: ${error}`);
    });
  }

  return results;
}

/**
 * Parses date string to ISO format
 * Handles formats like "September 27, 2025"
 */
function parseDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Fallback: use current date
      return new Date().toISOString();
    }
    return date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Standalone execution (if run directly)
 */
if (require.main === module) {
  const adminUserId = process.argv[2];
  
  if (!adminUserId) {
    console.error('❌ Error: Admin user ID is required');
    console.log('Usage: npx ts-node scripts/migrate-blog-posts.ts <admin-user-id>');
    console.log('\nTo find an admin user ID:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Open the auth.users or profiles table');
    console.log('3. Find a user with role="admin"');
    console.log('4. Copy their UUID');
    process.exit(1);
  }

  migrateBlogPosts(adminUserId)
    .then(() => {
      console.log('\n✨ Migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration failed:', error);
      process.exit(1);
    });
}

