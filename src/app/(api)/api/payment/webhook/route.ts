import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  // 1. Verify the signature
  try {
    const shasum = crypto.createHmac("sha256", WEBHOOK_SECRET);
    shasum.update(rawBody);
    const digest = shasum.digest("hex");

    if (digest !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Signature verification failed" }, { status: 500 });
  }

  const event = JSON.parse(rawBody);
  let rpcError;

  // 2. Process the event
  try {
    switch (event.event) {
      // ----------------------------------------------------
      // CASE 1: One-Time Payment Succeeded
      // ----------------------------------------------------
      case "payment.captured": {
        const payment = event.payload.payment.entity;
        const { supabase_plan_id, type } = payment.notes;

        if (type !== "one_time") break;

        // Call your existing fn_purchase_plan for one-time purchases
        const { error } = await supabaseAdmin.rpc("fn_purchase_plan", {
          plan_id_in: supabase_plan_id,
          order_status_in: "succeeded",
          payment_charge_id_in: payment.id,
          payment_method_in: payment.method,
        });
        rpcError = error;
        break;
      }
      
      // ----------------------------------------------------
      // CASE 2: Subscription Payment Succeeded
      // ----------------------------------------------------
      case "subscription.charged": {
        const subscription = event.payload.subscription.entity;
        const payment = event.payload.payment.entity;
        const { supabase_plan_id } = subscription.notes;

        // Check if this subscription already exists in our DB
        const { data: existingSub, error: subCheckError } = await supabaseAdmin
          .from("subscriptions")
          .select("id")
          .eq("payment_gateway_subscription_id", subscription.id)
          .single();

        if (subCheckError && subCheckError.code !== "PGRST116") { // 'PGRST116' = no rows found
          rpcError = subCheckError;
          break;
        }

        // A) This is the FIRST payment of the subscription
        if (!existingSub) {
          // Call your existing function to create the order, grant credits, AND create the subscription
          const { error } = await supabaseAdmin.rpc("fn_purchase_plan", {
            plan_id_in: supabase_plan_id,
            order_status_in: "succeeded",
            payment_charge_id_in: subscription.id, // Use the subscription ID as the reference
            payment_method_in: payment.method,
          });
          rpcError = error;
        } 
        // B) This is a RENEWAL payment
        else {
          // Call our new renewal function
          const { error } = await supabaseAdmin.rpc("fn_handle_subscription_renewal", {
            p_gateway_subscription_id: subscription.id,
            p_gateway_payment_id: payment.id,
            p_payment_method: payment.method,
            p_new_period_start: new Date(subscription.current_start * 1000).toISOString(),
            p_new_period_end: new Date(subscription.current_end * 1000).toISOString(),
          });
          rpcError = error;
        }
        break;
      }
    }

    if (rpcError) {
      throw rpcError;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook handler failed:", error.message);
    return NextResponse.json({ error: `Webhook handler failed: ${error.message}` }, { status: 500 });
  }
}