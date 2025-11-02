import { NextResponse } from "next/server";
import { createClient } from "@/utils/server";
import { withAdminAuth } from "@/lib/admin-auth";
import { adaptHelpContentToBlogPost } from "@/lib/blog-adapter";
import { BlogPostInput, BlogPost } from "@/lib/blog-types";
import { isValidSlug } from "@/lib/blog-adapter";

/**
 * Admin API route to get a single blog post by ID
 * GET /api/admin/blog/[id]
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth<{ post: BlogPost } | { error: string }>(async (admin) => {
    try {
      const { id } = await params;

      if (!id) {
        return NextResponse.json(
          { error: "Post ID is required" },
          { status: 400 }
        );
      }

      const supabase = await createClient();

      const { data, error } = await supabase
        .from("help_content")
        .select(`
          *,
          author_profile:profiles!help_content_created_by_fkey(
            id,
            full_name
          )
        `)
        .eq("id", id)
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

      const blogPost = adaptHelpContentToBlogPost(data);

      return NextResponse.json({ post: blogPost });
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
 * Admin API route to update a blog post
 * PUT /api/admin/blog/[id]
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth<{ post: BlogPost } | { error: string }>(async (admin) => {
    try {
      const { id } = await params;
      const body: Partial<BlogPostInput> = await request.json();

      if (!id) {
        return NextResponse.json(
          { error: "Post ID is required" },
          { status: 400 }
        );
      }

      const supabase = await createClient();

      // Check if post exists and get current sort_order
      const { data: existing, error: fetchError } = await supabase
        .from("help_content")
        .select("id, slug, sort_order")
        .eq("id", id)
        .single();

      if (fetchError || !existing) {
        return NextResponse.json(
          { error: "Post not found" },
          { status: 404 }
        );
      }

      // If slug is being updated, validate it and check for duplicates
      if (body.slug && body.slug !== existing.slug) {
        if (!isValidSlug(body.slug)) {
          return NextResponse.json(
            { error: "Invalid slug format. Use lowercase letters, numbers, and hyphens only." },
            { status: 400 }
          );
        }

        const { data: slugExists } = await supabase
          .from("help_content")
          .select("id")
          .eq("slug", body.slug)
          .neq("id", id)
          .single();

        if (slugExists) {
          return NextResponse.json(
            { error: "A post with this slug already exists" },
            { status: 409 }
          );
        }
      }

      // Validate sort_order if it's being updated
      if (body.sort_order !== undefined) {
        const newSortOrder = body.sort_order;
        
        // Validate sort_order (must be -1 or between 0-9)
        if (newSortOrder !== -1 && (newSortOrder < 0 || newSortOrder > 9)) {
          return NextResponse.json(
            { error: "Sort order must be -1 (non-numbered) or a number between 0 and 9." },
            { status: 400 }
          );
        }
        // Reordering is handled by PostgreSQL trigger automatically
      }

      // Build update object (only include fields that are provided)
      const updateData: any = {};
      if (body.topic !== undefined) updateData.topic = body.topic;
      if (body.slug !== undefined) updateData.slug = body.slug;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.content !== undefined) updateData.content = body.content;
      if (body.keywords !== undefined) updateData.keywords = body.keywords;
      if (body.category !== undefined) updateData.category = body.category;
      if (body.image_url !== undefined) updateData.image_url = body.image_url;
      if (body.is_active !== undefined) updateData.is_active = body.is_active;
      if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;
      if (body.published_at !== undefined) updateData.published_at = body.published_at;
      if (body.faq !== undefined) updateData.faq = body.faq;

      // Always update the updated_at timestamp (handled by trigger, but we can set it explicitly)
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("help_content")
        .update(updateData)
        .eq("id", id)
        .select(`
          *,
          author_profile:profiles!help_content_created_by_fkey(
            id,
            full_name
          )
        `)
        .single();

      if (error) {
        console.error("Error updating blog post:", error);
        return NextResponse.json(
          { error: "Failed to update blog post" },
          { status: 500 }
        );
      }

      const blogPost = adaptHelpContentToBlogPost(data);

      return NextResponse.json({ post: blogPost });
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
 * Admin API route to delete a blog post
 * DELETE /api/admin/blog/[id]
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminAuth<{ message: string } | { error: string }>(async (admin) => {
    try {
      const { id } = await params;

      if (!id) {
        return NextResponse.json(
          { error: "Post ID is required" },
          { status: 400 }
        );
      }

      const supabase = await createClient();

      // Soft delete by setting is_active to false, or hard delete
      // Using soft delete for safety
      const { error } = await supabase
        .from("help_content")
        .update({ is_active: false })
        .eq("id", id);

      if (error) {
        console.error("Error deleting blog post:", error);
        return NextResponse.json(
          { error: "Failed to delete blog post" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: "Post deleted successfully" },
        { status: 200 }
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

