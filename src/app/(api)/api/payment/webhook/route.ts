import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/utils/client";

const supabaseAdmin = createClient();
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

// ============================================
// Types
// ============================================
interface PaymentNotes {
  supabase_plan_id?: string;
  user_id?: string;
  type?: "one_time" | "subscription";
}

interface WebhookEvent {
  event: string;
  payload: any;
}

// ============================================
// Utilities
// ============================================
function verifySignature(rawBody: string, signature: string): boolean {
  const shasum = crypto.createHmac("sha256", WEBHOOK_SECRET);
  shasum.update(rawBody);
  const digest = shasum.digest("hex");
  return digest === signature;
}

function logEvent(eventType: string, details: Record<string, any>) {
  console.log(`--- Processing ${eventType} ---`);
  console.log(JSON.stringify(details, null, 2));
}

function validateNotes(
  notes: PaymentNotes | undefined,
  requiredFields: Array<keyof PaymentNotes>
): { valid: boolean; error?: string } {
  if (!notes) {
    return { valid: false, error: "Missing notes" };
  }

  for (const field of requiredFields) {
    if (!notes[field]) {
      return { valid: false, error: `Missing ${field} in notes` };
    }
  }

  return { valid: true };
}

// ============================================
// Event Handlers
// ============================================
async function handleOneTimePayment(payment: any) {
  logEvent("payment.captured", {
    payment_id: payment.id,
    amount: payment.amount,
    method: payment.method,
    notes: payment.notes,
  });

  const { supabase_plan_id, type, user_id } = payment.notes || {};

  if (type !== "one_time") {
    console.log("Not a one-time payment, skipping");
    return;
  }

  const validation = validateNotes(payment.notes, [
    "supabase_plan_id",
    "user_id",
  ]);
  if (!validation.valid) {
    throw new Error(`Invalid payment data: ${validation.error}`);
  }

  const { data, error } = await supabaseAdmin.rpc("payment_purchase_plan", {
    plan_id_in: supabase_plan_id,
    order_status_in: "succeeded",
    payment_charge_id_in: payment.id,
    payment_method_in: payment.method,
    user_id_in: user_id,
  });

  if (error) {
    console.error("payment_purchase_plan error:", error);
    throw error;
  }

  console.log("✓ One-time payment processed. Order ID:", data);
}

async function handleInvoicePaid(invoice: any, payment: any) {
  logEvent("invoice.paid", {
    invoice_id: invoice.id,
    subscription_id: invoice.subscription_id,
    payment_id: payment.id,
    notes: payment.notes,
  });

  const razorpay_sub_id = invoice.subscription_id;

  if (!razorpay_sub_id) {
    console.log("Not a subscription invoice, skipping");
    return;
  }

  const { supabase_plan_id, user_id, type } = payment.notes || {};

  if (type !== "subscription") {
    console.log("Payment type is not 'subscription', skipping");
    return;
  }

  const validation = validateNotes(payment.notes, [
    "supabase_plan_id",
    "user_id",
  ]);
  if (!validation.valid) {
    throw new Error(`Invalid subscription data: ${validation.error}`);
  }

  const { data, error } = await supabaseAdmin.rpc("payment_purchase_plan", {
    plan_id_in: supabase_plan_id,
    order_status_in: "succeeded",
    payment_charge_id_in: payment.id,
    payment_method_in: payment.method,
    user_id_in: user_id,
    p_gateway_subscription_id_in: razorpay_sub_id,
  });

  if (error) {
    console.error("payment_purchase_plan error:", error);
    throw error;
  }

  console.log("✓ Subscription created from invoice.paid. Order ID:", data);
}

async function handleSubscriptionCharged(subscription: any, payment: any) {
  logEvent("subscription.charged", {
    subscription_id: subscription.id,
    payment_id: payment.id,
    status: subscription.status,
    current_start: subscription.current_start,
    current_end: subscription.current_end,
    notes: subscription.notes,
  });

  const { supabase_plan_id, user_id } = subscription.notes || {};
  const validation = validateNotes(subscription.notes, [
    "supabase_plan_id",
    "user_id",
  ]);
  if (!validation.valid) {
    throw new Error(`Invalid subscription data: ${validation.error}`);
  }

  // Check if subscription exists
  const { data: existingSub, error: subCheckError } = await supabaseAdmin
    .from("subscriptions")
    .select("id, user_id, status, plan_id")
    .eq("payment_gateway_subscription_id", subscription.id)
    .maybeSingle();

  if (subCheckError) {
    console.error("Error checking subscription:", subCheckError);
    throw subCheckError;
  }

  // First payment - create subscription
  if (!existingSub) {
    console.log("Creating new subscription (first payment)");
    return await createNewSubscription(
      supabase_plan_id,
      user_id,
      payment,
      subscription.id
    );
  }

  // Renewal payment
  console.log("Processing subscription renewal");
  return await renewSubscription(subscription, payment);
}

async function createNewSubscription(
  planId: string,
  userId: string,
  payment: any,
  subscriptionId: string
) {
  const { data, error } = await supabaseAdmin.rpc("payment_purchase_plan", {
    plan_id_in: planId,
    order_status_in: "succeeded",
    payment_charge_id_in: payment.id,
    payment_method_in: payment.method,
    user_id_in: userId,
    p_gateway_subscription_id_in: subscriptionId,
  });

  if (error) {
    console.error("payment_purchase_plan error:", error);
    throw error;
  }

  console.log("✓ New subscription created. Order ID:", data);
}

async function renewSubscription(subscription: any, payment: any) {
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
    console.error("fn_handle_subscription_renewal error:", error);
    throw error;
  }

  console.log("✓ Subscription renewed successfully");
}

async function updateSubscriptionStatus(
  subscriptionId: string,
  status: string,
  additionalFields: Record<string, any> = {}
) {
  const { error } = await supabaseAdmin
    .from("subscriptions")
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...additionalFields,
    })
    .eq("payment_gateway_subscription_id", subscriptionId);

  if (error) {
    console.error(`Error updating subscription to ${status}:`, error);
    throw error;
  }

  console.log(`✓ Subscription ${status} successfully`);
}

async function handleSubscriptionCancelled(subscription: any) {
  logEvent("subscription.cancelled", { subscription_id: subscription.id });
  await updateSubscriptionStatus(subscription.id, "canceled", {
    canceled_at: new Date().toISOString(),
  });
}

async function handleSubscriptionPaused(subscription: any) {
  logEvent("subscription.paused", { subscription_id: subscription.id });
  await updateSubscriptionStatus(subscription.id, "paused", {
    pause_collection: true,
  });
}

async function handleSubscriptionResumed(subscription: any) {
  logEvent("subscription.resumed", { subscription_id: subscription.id });
  await updateSubscriptionStatus(subscription.id, "active", {
    pause_collection: false,
  });
}

async function handlePaymentAuthorized(payment: any) {
  logEvent("payment.authorized", {
    payment_id: payment.id,
    amount: payment.amount,
    notes: payment.notes,
  });
  console.log("✓ Payment authorized, awaiting capture");
}

async function handlePaymentFailed(payment: any) {
  logEvent("payment.failed", {
    payment_id: payment.id,
    user_id: payment.notes?.user_id,
    error_code: payment.error_code,
    error_description: payment.error_description,
  });
  
  // TODO: Implement payment failure logging
  // await logPaymentFailure(payment);
  
  console.log("✓ Payment failure processed");
}

async function handleRefundCreated(refund: any) {
  logEvent("refund.created", {
    refund_id: refund.id,
    payment_id: refund.payment_id,
    amount: refund.amount,
  });
  
  // TODO: Implement refund record creation
  // await createRefundRecord(refund);
  
  console.log("✓ Refund creation processed");
}

async function handleRefundProcessed(refund: any) {
  logEvent("refund.processed", {
    refund_id: refund.id,
    payment_id: refund.payment_id,
    amount: refund.amount,
  });
  
  // TODO: Implement refund record update
  // await updateRefundRecord(refund);
  
  console.log("✓ Refund processing completed");
}

async function handleSubscriptionAuthenticated(subscription: any) {
  logEvent("subscription.authenticated", {
    subscription_id: subscription.id,
    user_id: subscription.notes?.user_id,
  });
  console.log("✓ Subscription authentication noted");
}

async function handleOrderPaid() {
  logEvent("order.paid", {});
  console.log("✓ Order paid noted (no action taken to avoid duplicates)");
}

// ============================================
// Event Router
// ============================================
async function processWebhookEvent(event: WebhookEvent) {
  const eventType = event.event;
  const payload = event.payload;

  switch (eventType) {
    case "payment.captured":
      return await handleOneTimePayment(payload.payment.entity);

    case "invoice.paid":
      return await handleInvoicePaid(
        payload.invoice.entity,
        payload.payment.entity
      );

    case "subscription.charged":
      return await handleSubscriptionCharged(
        payload.subscription.entity,
        payload.payment.entity
      );

    case "subscription.cancelled":
      return await handleSubscriptionCancelled(payload.subscription.entity);

    case "subscription.paused":
      return await handleSubscriptionPaused(payload.subscription.entity);

    case "subscription.resumed":
      return await handleSubscriptionResumed(payload.subscription.entity);

    case "payment.authorized":
      return await handlePaymentAuthorized(payload.payment.entity);

    case "payment.failed":
      return await handlePaymentFailed(payload.payment.entity);

    case "refund.created":
      return await handleRefundCreated(payload.refund.entity);

    case "refund.processed":
      return await handleRefundProcessed(payload.refund.entity);

    case "subscription.authenticated":
      return await handleSubscriptionAuthenticated(payload.subscription.entity);

    case "order.paid":
      return await handleOrderPaid();

    default:
      console.log(`Unhandled event type: ${eventType}`);
  }
}

// ============================================
// Main Handler
// ============================================
export async function POST(req: Request) {
  console.log("=== Razorpay Webhook Received ===");

  try {
    // 1. Get raw body and signature
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      console.error("No signature provided");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    // 2. Verify signature
    if (!verifySignature(rawBody, signature)) {
      console.error("Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    console.log("✓ Signature verified");

    // 3. Parse and process event
    const event: WebhookEvent = JSON.parse(rawBody);
    console.log("Event type:", event.event);

    await processWebhookEvent(event);

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