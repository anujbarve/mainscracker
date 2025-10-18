import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Razorpay from "razorpay";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SC!,
});

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { planId } = await req.json(); // Pass your Supabase plan UUID

    // 1. Fetch the plan from your DB
    const { data: plan, error: planError } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Only sync recurring plans
    if (plan.type !== "recurring") {
      return NextResponse.json({ error: "Not a recurring plan" }, { status: 400 });
    }
    
    // Don't re-create if it already exists
    if (plan.payment_gateway_plan_id) {
       return NextResponse.json({ message: "Plan already synced" }, { status: 200 });
    }

    // 2. Create the plan in Razorpay
    const razorpayPlan = await razorpay.plans.create({
      period: plan.interval, // 'monthly', 'yearly', 'weekly'
      interval: plan.interval_count,
      item: {
        name: plan.name,
        description: plan.description || "N/A",
        amount: plan.price * 100, // Amount in paise
        currency: "INR",
      },
    });

    // 3. Update your Supabase plan with the new Razorpay ID
    const { error: updateError } = await supabaseAdmin
      .from("plans")
      .update({ payment_gateway_plan_id: razorpayPlan.id })
      .eq("id", plan.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update internal plan." }, { status: 500 });
    }

    return NextResponse.json({ success: true, razorpayPlanId: razorpayPlan.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}