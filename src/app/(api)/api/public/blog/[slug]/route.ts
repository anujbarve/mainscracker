import { NextResponse } from "next/server";
import { createPublicClient } from "@/utils/public-client";
import { adaptHelpContentToBlogPost, adaptHelpContentArrayToBlogPosts } from "@/lib/blog-adapter";

/**
 * Public API route to fetch a single blog post by slug
 * GET /api/public/blog/[slug]
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    const supabase = createPublicClient();

    // Fetch the post with author info
    const { data, error } = await supabase
      .from("help_content")
      .select(`
        *,
        author_profile:profiles!help_content_created_by_fkey(
          id,
          full_name
        )
      `)
      .eq("slug", slug)
      .eq("is_active", true)
      .not("published_at", "is", null)
      .lte("published_at", new Date().toISOString()) // Only show posts published in the past or now
      .single();

    if (error || !data) {
      if (error?.code === "PGRST116") {
        return NextResponse.json(
          { error: "Post not found" },
          { status: 404 }
        );
      }
      console.error("Error fetching blog post:", error);
      return NextResponse.json(
        { error: "Failed to fetch blog post" },
        { status: 500 }
      );
    }

    // Transform to blog post format
    const blogPost = adaptHelpContentToBlogPost(data);

    // Fetch related posts (same category, excluding current)
    const { data: relatedData } = await supabase
      .from("help_content")
      .select(`
        *,
        author_profile:profiles!help_content_created_by_fkey(
          id,
          full_name
        )
      `)
      .eq("category", data.category)
      .eq("is_active", true)
      .not("published_at", "is", null)
      .neq("id", data.id)
      .order("sort_order", { ascending: true })
      .order("published_at", { ascending: false })
      .limit(3);

    const relatedPosts = relatedData
      ? adaptHelpContentArrayToBlogPosts(relatedData)
      : [];

    return NextResponse.json({
      post: blogPost,
      relatedPosts,
    });
  } catch (error: any) {
    console.error("Error in blog API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

