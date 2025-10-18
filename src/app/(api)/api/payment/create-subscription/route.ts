import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Razorpay from "razorpay";
import { createServerClient } from "@supabase/ssr"; // <-- New import

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SC!,
});

export async function POST(req: Request) {
  try {
    // 1. Create the server client
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          async get(name: string) {
            return (await cookieStore).get(name)?.value;
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

    // 3. Fetch the Razorpay-synced plan ID
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("payment_gateway_plan_id, name")
      .eq("id", planId)
      .single();

    if (planError || !plan || !plan.payment_gateway_plan_id) {
      return NextResponse.json({ error: "Plan not found or not synced" }, { status: 404 });
    }

    // 4. Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: plan.payment_gateway_plan_id,
      customer_notify: 1,
      total_count: 12, // e.g., 12 billing cycles
      notes: {
        supabase_plan_id: planId, // Vital for the webhook
        user_id: user.id,          // Vital for the webhook
        type: "subscription",
      },
    });

    return NextResponse.json({ ...subscription, planName: plan.name });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}