import { NextResponse } from "next/server";
import { createClient } from "@/utils/server";
import { withAdminAuth } from "@/lib/admin-auth";
import { adaptHelpContentArrayToBlogPosts } from "@/lib/blog-adapter";
import { BlogPostInput, BlogPost } from "@/lib/blog-types";
import { generateSlug, isValidSlug } from "@/lib/blog-adapter";

/**
 * Admin API route to fetch all blog posts
 * GET /api/admin/blog
 * 
 * Query parameters:
 * - category: Filter by category
 * - search: Search in title, description, content
 * - includeInactive: Include inactive posts (default: false)
 */
export async function GET(request: Request) {
  return withAdminAuth<{ posts: BlogPost[]; total: number } | { error: string }>(async (admin) => {
    try {
      const { searchParams } = new URL(request.url);
      const category = searchParams.get("category");
      const search = searchParams.get("search");
      const includeInactive = searchParams.get("includeInactive") === "true";

      const supabase = await createClient();

      let query = supabase
        .from("help_content")
        .select(`
          *,
          author_profile:profiles!help_content_created_by_fkey(
            id,
            full_name
          )
        `)
        .order("sort_order", { ascending: true, nullsFirst: true })
        .order("updated_at", { ascending: false }); // For non-numbered posts (sort_order = -1)

      // Filter by active status
      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      // Apply category filter
      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        query = query.or(
          `topic.ilike.%${searchLower}%,description.ilike.%${searchLower}%,content.ilike.%${searchLower}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching blog posts:", error);
        return NextResponse.json(
          { error: "Failed to fetch blog posts" },
          { status: 500 }
        );
      }

      const blogPosts = adaptHelpContentArrayToBlogPosts(data || []);

      return NextResponse.json({
        posts: blogPosts,
        total: blogPosts.length,
      });
    } catch (error: any) {
      console.error("Error in admin blog API:", error);
      return NextResponse.json(
        { error: error.message || "Internal server error" },
        { status: 500 }
      );
    }
  });
}

/**
 * Admin API route to create a new blog post
 * POST /api/admin/blog
 */
export async function POST(request: Request) {
  return withAdminAuth<{ post: BlogPost } | { error: string }>(async (admin) => {
    try {
      const body: BlogPostInput = await request.json();

      // Validate required fields
      if (!body.topic || !body.content || !body.slug) {
        return NextResponse.json(
          { error: "Missing required fields: topic, content, slug" },
          { status: 400 }
        );
      }

      // Validate slug format
      if (!isValidSlug(body.slug)) {
        return NextResponse.json(
          { error: "Invalid slug format. Use lowercase letters, numbers, and hyphens only." },
          { status: 400 }
        );
      }

      // Check if slug already exists
      const supabase = await createClient();
      const { data: existing } = await supabase
        .from("help_content")
        .select("id")
        .eq("slug", body.slug)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: "A post with this slug already exists" },
          { status: 409 }
        );
      }

      // Validate sort_order (must be -1 or between 0-9)
      const sortOrder = body.sort_order ?? -1;
      if (sortOrder !== -1 && (sortOrder < 0 || sortOrder > 9)) {
        return NextResponse.json(
          { error: "Sort order must be -1 (non-numbered) or a number between 0 and 9." },
          { status: 400 }
        );
      }

      // Create the post
      const { data, error } = await supabase
        .from("help_content")
        .insert({
          topic: body.topic,
          slug: body.slug,
          description: body.description || null,
          content: body.content,
          keywords: body.keywords || [],
          category: body.category || "General",
          image_url: body.image_url || null,
          is_active: body.is_active ?? true,
          sort_order: sortOrder,
          published_at: body.published_at || new Date().toISOString(),
          faq: body.faq || false,
          created_by: admin.user.id,
        })
        .select(`
          *,
          author_profile:profiles!help_content_created_by_fkey(
            id,
            full_name
          )
        `)
        .single();

      if (error) {
        console.error("Error creating blog post:", error);
        return NextResponse.json(
          { error: "Failed to create blog post" },
          { status: 500 }
        );
      }

      const blogPost = adaptHelpContentArrayToBlogPosts([data])[0];

      return NextResponse.json(
        { post: blogPost },
        { status: 201 }
      );
    } catch (error: any) {
      console.error("Error in admin blog API:", error);
      return NextResponse.json(
        { error: error.message || "Internal server error" },
        { status: 500 }
      );
    }
  });
}

