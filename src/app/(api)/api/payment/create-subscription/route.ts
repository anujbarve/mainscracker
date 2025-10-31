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
  console.log("🚀 CREATE SUBSCRIPTION API CALLED");
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
      throw authError; // Throw to be caught by the main catch block
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

    console.log("✅ Plan ID received:", planId);

    // 4. Fetch the Razorpay-synced plan ID
    console.log("4️⃣ Fetching plan from database...");
    console.log(
      `Query: SELECT * FROM plans WHERE id = ${planId} AND is_active = true AND type = 'recurring'`
    );
    const { data: plan, error: planError } = await supabase
      .from("plans")
      .select("id, payment_gateway_plan_id, name, type, price, currency")
      .eq("id", planId)
      .eq("is_active", true)
      .eq("type", "recurring")
      .single();

    // Specific logging for plan fetching
    if (planError) {
      console.error("❌ Plan query error:", planError);
      // Don't throw yet, let the next block handle it
    }

    if (!plan || planError || !plan.payment_gateway_plan_id) {
      console.error("❌ Plan not found or not configured for subscriptions.");
      console.error({
        planError: planError,
        planFound: !!plan,
        paymentGatewayPlanId: plan?.payment_gateway_plan_id,
      });
      return NextResponse.json(
        { error: "Plan not found or not configured for subscriptions" },
        { status: 404 }
      );
    }

    console.log("✅ Plan details found:", {
      id: plan.id,
      name: plan.name,
      payment_gateway_plan_id: plan.payment_gateway_plan_id,
      type: plan.type,
    });

    // 5. Create Razorpay subscription
    console.log("5️⃣ Preparing Razorpay subscription options...");
    const subscriptionOptions = {
      plan_id: plan.payment_gateway_plan_id,
      customer_notify: true,
      quantity: 1,
      total_count: 12, // 12 billing cycles
      notes: {
        supabase_plan_id: planId, // ← Critical for webhook
        user_id: user.id, // ← Critical for webhook
        plan_name: plan.name,
        type: "subscription",
      },
    };

    console.log(
      "Creating Razorpay subscription with options:",
      JSON.stringify(subscriptionOptions, null, 2)
    );

    let subscription;
    try {
      subscription = await razorpay.subscriptions.create(subscriptionOptions);
    } catch (razorpayError: any) {
      console.error("❌ Razorpay subscription creation failed:");
      console.error("  Status:", razorpayError.statusCode);
      console.error("  Error:", razorpayError.error);
      console.error("  Description:", razorpayError.error?.description);
      // Re-throw the error to be caught by the main catch block
      throw new Error(
        `Razorpay error: ${razorpayError.error?.description || razorpayError.message}`
      );
    }

    console.log("✅ Razorpay subscription created successfully:", {
      id: subscription.id,
      plan_id: subscription.plan_id,
      status: subscription.status,
      notes: subscription.notes,
    });

    // 6. Send response
    console.log("6️⃣ Sending successful response to client...");
    console.log("\n✅ SUBSCRIPTION CREATED SUCCESSFULLY\n");
    return NextResponse.json({
      id: subscription.id,
      plan_id: subscription.plan_id,
      status: subscription.status,
      notes: subscription.notes,
      planName: plan.name,
    });
    
  } catch (error: any) {
    // Enhanced catch block
    console.error("\n❌❌❌ CREATE SUBSCRIPTION FAILED ❌❌❌");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);

    // Check for specific Razorpay error structure
    if (error.error) {
      console.error("Razorpay Error Details:", error.error);
    }
    
    console.error("Error stack:", error.stack);
    console.error("Full error:", JSON.stringify(error, null, 2));

    return NextResponse.json(
      {
        error: error.message || "Failed to create subscription",
        details: error.error?.description || (process.env.NODE_ENV === "development" ? error.stack : undefined),
      },
      { status: 500 }
    );
  }
}