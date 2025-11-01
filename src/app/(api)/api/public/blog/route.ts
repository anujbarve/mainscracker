import { NextResponse } from "next/server";
import { createPublicClient } from "@/utils/public-client";
import { adaptHelpContentArrayToBlogPosts } from "@/lib/blog-adapter";

/**
 * Public API route to fetch blog posts
 * GET /api/public/blog
 * 
 * Query parameters:
 * - category: Filter by category
 * - search: Search in title, description, content, keywords
 * - limit: Limit number of results (default: 100)
 * - offset: Pagination offset
 * - featured: Return only featured post (first by sort_order)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const featured = searchParams.get("featured") === "true";

    const supabase = createPublicClient();

    // Build query - fetch only active, published posts
    let query = supabase
      .from("help_content")
      .select(`
        *,
        author_profile:profiles!help_content_created_by_fkey(
          id,
          full_name
        )
      `)
      .eq("is_active", true)
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString()) // Only show posts published in the past or now
      .order("sort_order", { ascending: true })
      .order("published_at", { ascending: false });

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

    // Apply pagination
    if (!featured) {
      query = query.range(offset, offset + limit - 1);
    } else {
      query = query.limit(1);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching blog posts:", error);
      return NextResponse.json(
        { error: "Failed to fetch blog posts" },
        { status: 500 }
      );
    }

    // Transform database records to blog posts
    const blogPosts = adaptHelpContentArrayToBlogPosts(data || []);

    return NextResponse.json({
      posts: blogPosts,
      total: blogPosts.length,
    });
  } catch (error: any) {
    console.error("Error in blog API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

