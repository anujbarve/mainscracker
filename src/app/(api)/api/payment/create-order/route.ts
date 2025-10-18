import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // Import cookies
import Razorpay from "razorpay";
import { createServerClient } from "@supabase/ssr"; // Import createServerClient

// Initialize Razorpay (Make sure your .env variables are correct)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SC!, // <-- Check this variable name
});

export async function POST(req: Request) {
  try {
    // 1. Create the server client (CORRECTED)
    const cookieStore = await cookies(); // This is synchronous, no 'await' needed

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, // <-- Use ANON_KEY
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    // 2. Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await req.json(); // Supabase plan UUID

    // 3. Fetch plan details
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("price, name")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // 4. Create Razorpay order (Added Number() for safety)
    const options = {
      amount: Number(plan.price) * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_${user.id}_${planId}`,
      notes: {
        supabase_plan_id: planId, // Vital for the webhook
        user_id: user.id,          // Vital for the webhook
        type: "one_time",
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ ...order, planName: plan.name });
  } catch (error: any) {
    // Log the error on the server for debugging
    console.error("Error in create-order:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}