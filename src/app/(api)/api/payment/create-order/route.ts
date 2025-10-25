import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Razorpay from "razorpay";
import { createClient } from "@/utils/server";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SC!,
});

export async function POST(req: Request) {
  console.log("\n========================================");
  console.log("📦 CREATE ORDER API CALLED");
  console.log("========================================\n");

  try {
    // Check if Razorpay is initialized
    if (!razorpay) {
      throw new Error("Razorpay not initialized. Check API keys.");
    }

    // 1. Create the server client
    console.log("1️⃣ Creating Supabase client...");
    const cookieStore = await cookies();

    const supabase = await createClient();

    console.log("✅ Supabase client created");

    // 2. Get the authenticated user
    console.log("2️⃣ Getting authenticated user...");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error("❌ Auth error:", authError);
      throw authError;
    }

    if (!user) {
      console.error("❌ No user found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ User authenticated:", user.id);

    // 3. Parse request body
    console.log("3️⃣ Parsing request body...");
    const body = await req.json();
    const { planId } = body;

    console.log("Request body:", body);

    if (!planId) {
      console.error("❌ Missing planId");
      return NextResponse.json({ error: "Missing planId" }, { status: 400 });
    }

    console.log("✅ Plan ID:", planId);

    // 4. Fetch plan details
    console.log("4️⃣ Fetching plan from database...");
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("*")
      .eq("id", planId)
      .eq("is_active", true)
      .single();

    if (planError) {
      console.error("❌ Plan query error:", planError);
      throw new Error(`Plan query failed: ${planError.message}`);
    }

    if (!plan) {
      console.error("❌ Plan not found or inactive");
      return NextResponse.json(
        { error: "Plan not found or inactive" },
        { status: 404 }
      );
    }

    console.log("✅ Plan found:", {
      id: plan.id,
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      type: plan.type,
    });

    // 5. Create Razorpay order
    console.log("5️⃣ Creating Razorpay order...");
    
    const orderAmount = Math.round(Number(plan.price) * 100);
    console.log("Order amount (paise):", orderAmount);

    const options = {
      amount: orderAmount,
      currency: plan.currency || "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        supabase_plan_id: planId,
        user_id: user.id,
        type: "one_time",
        plan_name: plan.name,
      },
    };

    console.log("Razorpay order options:", JSON.stringify(options, null, 2));

    let order;
    try {
      order = await razorpay.orders.create(options);
      console.log("✅ Razorpay order created:", {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
      });
    } catch (razorpayError: any) {
      console.error("❌ Razorpay order creation failed:");
      console.error("  Status:", razorpayError.statusCode);
      console.error("  Error:", razorpayError.error);
      console.error("  Description:", razorpayError.error?.description);
      throw new Error(
        `Razorpay error: ${razorpayError.error?.description || razorpayError.message}`
      );
    }

    console.log("\n✅ ORDER CREATED SUCCESSFULLY\n");

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      notes: order.notes,
      planName: plan.name,
    });
  } catch (error: any) {
    console.error("\n❌❌❌ CREATE ORDER FAILED ❌❌❌");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Full error:", JSON.stringify(error, null, 2));

    return NextResponse.json(
      {
        error: error.message || "Failed to create order",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}