import { NextResponse } from "next/server";

import crypto from "crypto";
import { createClient } from "@/utils/client";


const supabaseAdmin = createClient();

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  console.log("=== Razorpay Webhook Received ===");

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature) {
    console.error("No signature provided");
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  // 1. Verify the signature
  try {
    const shasum = crypto.createHmac("sha256", WEBHOOK_SECRET);
    shasum.update(rawBody);
    const digest = shasum.digest("hex");

    if (digest !== signature) {
      console.error("Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    console.log("✓ Signature verified");
  } catch (error) {
    console.error("Signature verification failed:", error);
    return NextResponse.json(
      { error: "Signature verification failed" },
      { status: 500 }
    );
  }

  const event = JSON.parse(rawBody);
  console.log("Event type:", event.event);
  console.log("Event payload:", JSON.stringify(event.payload, null, 2));

  let rpcError;

  // 2. Process the event
  try {
    switch (event.event) {
      // ----------------------------------------------------
      // CASE 1: One-Time Payment Succeeded
      // ----------------------------------------------------
      case "payment.captured": {
        console.log("--- Processing payment.captured ---");
        const payment = event.payload.payment.entity;
        const { supabase_plan_id, type, user_id } = payment.notes || {};

        console.log("Payment details:", {
          payment_id: payment.id,
          supabase_plan_id,
          type,
          user_id,
          amount: payment.amount,
          method: payment.method,
        });

        if (type !== "one_time") {
          console.log("Not a one-time payment, skipping");
          break;
        }

        if (!supabase_plan_id || !user_id) {
          console.error("Missing supabase_plan_id or user_id in payment notes");
          return NextResponse.json(
            { error: "Invalid payment data" },
            { status: 400 }
          );
        }

        console.log(" USERRRR ID : " + user_id);

        const { data, error } = await supabaseAdmin.rpc("payment_purchase_plan", {
          plan_id_in: supabase_plan_id,
          order_status_in: "succeeded",
          payment_charge_id_in: payment.id,
          payment_method_in: payment.method,
          user_id_in : user_id
        });

        if (error) {
          console.error("fn_purchase_plan error:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          rpcError = error;
        } else {
          console.log(
            "✓ One-time payment processed successfully. Order ID:",
            data
          );
        }
        break;
      }

      // ----------------------------------------------------
      // CASE 2: Subscription Payment Succeeded
      // ----------------------------------------------------
      case "subscription.charged": {
        console.log("--- Processing subscription.charged ---");
        const subscription = event.payload.subscription.entity;
        const payment = event.payload.payment.entity;
        const { supabase_plan_id, user_id } = subscription.notes || {};

        console.log("Subscription details:", {
          subscription_id: subscription.id,
          payment_id: payment.id,
          supabase_plan_id,
          user_id,
          status: subscription.status,
          current_start: subscription.current_start,
          current_end: subscription.current_end,
        });

        if (!supabase_plan_id || !user_id) {
          console.error(
            "Missing supabase_plan_id or user_id in subscription notes"
          );
          return NextResponse.json(
            { error: "Invalid subscription data" },
            { status: 400 }
          );
        }

        // Check if subscription exists
        const { data: existingSub, error: subCheckError } = await supabaseAdmin
          .from("subscriptions")
          .select("id, user_id, status, plan_id")
          .eq("payment_gateway_subscription_id", subscription.id)
          .maybeSingle();

        if (subCheckError) {
          console.error("Error checking subscription:", subCheckError);
          rpcError = subCheckError;
          break;
        }

        console.log("Existing subscription:", existingSub || "None found");

        // First payment - create subscription
        if (!existingSub) {
          console.log("Creating new subscription (first payment)");

          const { data, error } = await supabaseAdmin.rpc("payment_purchase_plan", {
            plan_id_in: supabase_plan_id,
            order_status_in: "succeeded",
            payment_charge_id_in: payment.id,
            payment_method_in: payment.method,
            user_id_in: user_id, // ← Pass user_id
          });

          if (error) {
            console.error("fn_purchase_plan error:", {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code,
            });
            rpcError = error;
          } else {
            console.log(
              "✓ New subscription created successfully. Order ID:",
              data
            );
          }
        }
        // Renewal payment
        else {
          console.log("Processing subscription renewal");

          const { data, error } = await supabaseAdmin.rpc(
            "fn_handle_subscription_renewal",
            {
              p_gateway_subscription_id: subscription.id,
              p_gateway_payment_id: payment.id,
              p_payment_method: payment.method,
              p_new_period_start: new Date(
                subscription.current_start * 1000
              ).toISOString(),
              p_new_period_end: new Date(
                subscription.current_end * 1000
              ).toISOString(),
            }
          );

          if (error) {
            console.error("fn_handle_subscription_renewal error:", {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code,
            });
            rpcError = error;
          } else {
            console.log("✓ Subscription renewed successfully");
          }
        }
        break;
      }

      // ----------------------------------------------------
      // CASE 3: Subscription Cancelled
      // ----------------------------------------------------
      case "subscription.cancelled": {
        console.log("--- Processing subscription.cancelled ---");
        const subscription = event.payload.subscription.entity;

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "canceled",
            canceled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("payment_gateway_subscription_id", subscription.id);

        if (error) {
          console.error("Error cancelling subscription:", error);
          rpcError = error;
        } else {
          console.log("✓ Subscription cancelled successfully");
        }
        break;
      }

      // ----------------------------------------------------
      // CASE 4: Subscription Paused
      // ----------------------------------------------------
      case "subscription.paused": {
        console.log("--- Processing subscription.paused ---");
        const subscription = event.payload.subscription.entity;

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "paused",
            pause_collection: true,
            updated_at: new Date().toISOString(),
          })
          .eq("payment_gateway_subscription_id", subscription.id);

        if (error) {
          console.error("Error pausing subscription:", error);
          rpcError = error;
        } else {
          console.log("✓ Subscription paused successfully");
        }
        break;
      }

      // ----------------------------------------------------
      // CASE 5: Subscription Resumed
      // ----------------------------------------------------
      case "subscription.resumed": {
        console.log("--- Processing subscription.resumed ---");
        const subscription = event.payload.subscription.entity;

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "active",
            pause_collection: false,
            updated_at: new Date().toISOString(),
          })
          .eq("payment_gateway_subscription_id", subscription.id);

        if (error) {
          console.error("Error resuming subscription:", error);
          rpcError = error;
        } else {
          console.log("✓ Subscription resumed successfully");
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    if (rpcError) {
      throw rpcError;
    }

    console.log("=== Webhook processed successfully ===");
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("=== Webhook handler failed ===");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
    return NextResponse.json(
      { error: `Webhook handler failed: ${error.message}` },
      { status: 500 }
    );
  }
}
