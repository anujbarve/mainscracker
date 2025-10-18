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

    // 3. Fetch plan details (this query is now authenticated as the user)
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("price, name")
      .eq("id", planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // 4. Create Razorpay order
    const options = {
      amount: plan.price * 100, // Amount in paise
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}