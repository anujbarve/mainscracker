import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Razorpay from "razorpay";
import { createClient } from "@/utils/server";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SC!,
});

export async function POST(req: Request) {
  try {
    // 1. Create the server client
    const cookieStore = await cookies();

    const supabase = await createClient();

    // 2. Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("Unauthorized: No user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Creating subscription for user:", user.id);

    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json({ error: "Missing planId" }, { status: 400 });
    }

    // 3. Fetch the Razorpay-synced plan ID
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id, payment_gateway_plan_id, name, type, price, currency")
      .eq("id", planId)
      .eq("is_active", true)
      .eq("type", "recurring")
      .single();

    if (planError || !plan || !plan.payment_gateway_plan_id) {
      console.error("Plan not found or not synced:", planError);
      return NextResponse.json(
        { error: "Plan not found or not configured for subscriptions" },
        { status: 404 }
      );
    }

    console.log("Plan details:", {
      id: plan.id,
      name: plan.name,
      payment_gateway_plan_id: plan.payment_gateway_plan_id,
      type: plan.type,
    });

    // 4. Create Razorpay subscription
    const subscriptionOptions = {
      plan_id: plan.payment_gateway_plan_id,
      customer_notify: true,
      quantity: 1,
      total_count: 12, // 12 billing cycles
      start_at: Math.floor(Date.now() / 1000) + 60, // Start in 1 minute
      notes: {
        supabase_plan_id: planId, // ← Critical for webhook
        user_id: user.id, // ← Critical for webhook
        plan_name: plan.name,
      },
    };

    console.log("Creating Razorpay subscription with options:", subscriptionOptions);

    const subscription = await razorpay.subscriptions.create(subscriptionOptions);

    console.log("Razorpay subscription created:", {
      id: subscription.id,
      plan_id: subscription.plan_id,
      status: subscription.status,
      notes: subscription.notes,
    });

    return NextResponse.json({
      id: subscription.id,
      plan_id: subscription.plan_id,
      status: subscription.status,
      notes: subscription.notes,
      planName: plan.name,
    });
  } catch (error: any) {
    console.error("Error in create-subscription:", error.message, error.stack);
    return NextResponse.json(
      { error: error.message || "Failed to create subscription" },
      { status: 500 }
    );
  }
}