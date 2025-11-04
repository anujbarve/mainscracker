// Admin authentication utilities for API routes
import { createClient } from "@/utils/server";
import { NextResponse } from "next/server";

/**
 * Verifies if the current user is an admin
 * Returns the user and profile if admin, or null if not
 */
export async function verifyAdmin() {
  try {
    const supabase = await createClient();
    
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, full_name")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    // Check if user is admin
    if (profile.role !== "admin") {
      return null;
    }

    return { user, profile };
  } catch (error) {
    console.error("Error verifying admin:", error);
    return null;
  }
}

/**
 * Wrapper for admin API routes - checks admin access before proceeding
 * Returns 401 if not admin, or calls the handler function if admin
 */
export async function withAdminAuth<T>(
  handler: (admin: { user: any; profile: any }) => Promise<NextResponse<T>>
): Promise<NextResponse<T | { error: string }>> {
  const admin = await verifyAdmin();
  
  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized - Admin access required" },
      { status: 401 }
    );
  }

  return handler(admin);
}

