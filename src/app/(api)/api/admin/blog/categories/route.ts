import { NextResponse } from "next/server";
import { createClient } from "@/utils/server";
import { withAdminAuth } from "@/lib/admin-auth";

/**
 * Admin API route to fetch all blog categories
 * GET /api/admin/blog/categories
 * 
 * Fetches distinct categories from help_content table (works with enum type)
 */
export async function GET() {
  return withAdminAuth<{ categories: string[] } | { error: string }>(async () => {
    try {
      const supabase = await createClient();

      // Query distinct categories from existing posts
      // This works with enum types since they're stored as text values
      const { data, error } = await supabase
        .from('help_content')
        .select('category')
        .order('category');

      if (error) {
        throw error;
      }

      // Get unique categories and sort them
      const uniqueCategories = Array.from(
        new Set((data || []).map(item => item.category as string))
      ).sort();

      // If no categories found, return default list
      if (uniqueCategories.length === 0) {
        return NextResponse.json({
          categories: [
            'Getting Started',
            'Platform Guide',
            'Answer Writing',
            'UPSC Strategy',
            'Mentorship',
            'Ethics',
            'General'
          ]
        });
      }

      return NextResponse.json({ categories: uniqueCategories });
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      
      // Fallback: return hardcoded categories
      return NextResponse.json({
        categories: [
          'Getting Started',
          'Platform Guide',
          'Answer Writing',
          'UPSC Strategy',
          'Mentorship',
          'Ethics',
          'General'
        ]
      });
    }
  });
}

/**
 * Admin API route to add a new category to the enum
 * POST /api/admin/blog/categories
 * Body: { category: string }
 * 
 * Note: Adding to enum requires ALTER TYPE which needs database function.
 * This endpoint validates and returns the category, but actual enum update
 * needs to be done via SQL function or manual SQL execution.
 */
export async function POST(request: Request) {
  return withAdminAuth<{ success: boolean; category: string; message: string } | { error: string }>(async () => {
    try {
      const body = await request.json();
      const { category } = body;

      if (!category || typeof category !== 'string' || category.trim() === '') {
        return NextResponse.json(
          { error: "Category name is required" },
          { status: 400 }
        );
      }

      const categoryName = category.trim();

      // Validate category name
      if (categoryName.length > 50) {
        return NextResponse.json(
          { error: "Category name must be 50 characters or less" },
          { status: 400 }
        );
      }

      // Check if category already exists
      const supabase = await createClient();
      const { data: existing } = await supabase
        .from('help_content')
        .select('category')
        .eq('category', categoryName)
        .limit(1);

      if (existing && existing.length > 0) {
        return NextResponse.json({
          success: true,
          category: categoryName,
          message: "Category already exists"
        });
      }

      // Try to add category using RPC function if it exists
      // Otherwise, we'll need to create a database function
      try {
        const { error: rpcError } = await supabase.rpc('add_blog_category', {
          category_name: categoryName
        });

        if (!rpcError) {
          return NextResponse.json({
            success: true,
            category: categoryName,
            message: "Category added successfully"
          });
        }
      } catch (rpcErr) {
        // RPC function might not exist, that's okay
        console.log("RPC function not available, will need manual SQL");
      }

      // If RPC doesn't work, return success but note that manual SQL is needed
      // The category will be added when first used in a post, but enum needs to be updated first
      return NextResponse.json({
        success: true,
        category: categoryName,
        message: "Category validated. Note: To use this category, you need to add it to the enum type using SQL: ALTER TYPE blog_category_enum ADD VALUE '" + categoryName + "';"
      });
    } catch (error: any) {
      console.error("Error adding category:", error);
      return NextResponse.json(
        { error: error.message || "Failed to add category" },
        { status: 500 }
      );
    }
  });
}

/**
 * Admin API route to delete a category
 * DELETE /api/admin/blog/categories
 * Body: { category: string }
 * 
 * Note: PostgreSQL enums don't support removing values directly.
 * This endpoint checks if category is in use and provides appropriate feedback.
 */
export async function DELETE(request: Request) {
  return withAdminAuth<{ success: boolean; category: string; message: string } | { error: string; inUse?: boolean; count?: number }>(async () => {
    try {
      const body = await request.json();
      const { category } = body;

      if (!category || typeof category !== 'string' || category.trim() === '') {
        return NextResponse.json(
          { error: "Category name is required" },
          { status: 400 }
        );
      }

      const categoryName = category.trim();
      const supabase = await createClient();

      // Check if category is being used in any blog posts
      const { data: postsUsingCategory, error: checkError } = await supabase
        .from('help_content')
        .select('id, topic')
        .eq('category', categoryName)
        .limit(1);

      if (checkError) {
        throw checkError;
      }

      if (postsUsingCategory && postsUsingCategory.length > 0) {
        return NextResponse.json(
          { 
            error: `Cannot delete category "${categoryName}" because it is currently used in ${postsUsingCategory.length} blog post(s). Please update or delete those posts first.`,
            inUse: true,
            count: postsUsingCategory.length
          },
          { status: 400 }
        );
      }

      // Category is not in use
      // Note: We can't actually remove it from the enum type in PostgreSQL
      // But we can return success and the frontend can remove it from the list
      return NextResponse.json({
        success: true,
        category: categoryName,
        message: "Category is not in use. Note: The category value remains in the database enum type but can be hidden from the list."
      });
    } catch (error: any) {
      console.error("Error deleting category:", error);
      return NextResponse.json(
        { error: error.message || "Failed to delete category" },
        { status: 500 }
      );
    }
  });
}

