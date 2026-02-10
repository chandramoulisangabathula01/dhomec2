import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      console.error("Missing Razorpay Signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not set in environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Verify Signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Invalid Razorpay Signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType = event.event;
    console.log(`[Razorpay Webhook] Received event: ${eventType}`, event.id);

    const supabase = await createClient();

    // Business Logic based on Event Type
    switch (eventType) {
      case "payment.captured":
      case "order.paid": {
        const payload = event.payload.payment?.entity || event.payload.order?.entity;
        const razorpayOrderId = payload.order_id || payload.id;
        const paymentId = payload.payment_id || payload.id;
        
        // Find order by Razorpay Order ID or from notes
        const orderId = payload.notes?.order_id;
        
        if (orderId) {
          const { data, error } = await supabase
            .from("orders")
            .update({ 
              status: "paid", 
              payment_id: paymentId 
            })
            .eq("id", orderId)
            .select();
            
          if (error) {
            console.error(`[Webhook] Error updating order ${orderId}:`, error);
          } else {
            console.log(`[Webhook] Order ${orderId} updated to 'paid'`);
          }
        }
        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;
        const orderId = payment.notes?.order_id;
        
        if (orderId) {
          await supabase
            .from("orders")
            .update({ status: "cancelled" }) // Or 'failed' if that's a status
            .eq("id", orderId);
          console.log(`[Webhook] Order ${orderId} marked as cancelled due to payment failure`);
        }
        break;
      }

      case "payment.authorized": {
        console.log(`[Webhook] Payment authorized: ${event.payload.payment.entity.id}`);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[Razorpay Webhook Error]:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
