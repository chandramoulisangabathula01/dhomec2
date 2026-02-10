import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

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
        // In some events payload is direct entity, sometimes nested. 
        // Razorpay structure varies slightly by event type.
        // payment.captured -> payload.payment.entity
        // order.paid -> payload.order.entity
        
        let paymentId = payload.id;
        let razorpayOrderId = payload.order_id;
        let orderId = payload.notes?.order_id;

        if (!orderId && razorpayOrderId) {
            // Fallback: try to find by razorpay_order_id if notes missing
             const { data: existing } = await supabase
                .from("orders")
                .select("id")
                .eq("razorpay_order_id", razorpayOrderId)
                .single();
             if (existing) orderId = existing.id;
        }
        
        if (orderId) {
          console.log(`[Webhook] Updating order ${orderId} to PLACED`);
          const { error } = await supabase
            .from("orders")
            .update({ 
              status: "PLACED", 
              razorpay_payment_id: paymentId,
              updated_at: new Date().toISOString()
            })
            .eq("id", orderId);
            
          if (error) {
            console.error(`[Webhook] Error updating order ${orderId}:`, error);
          } else {
            // Audit Log
            await supabase.from("order_status_history").insert({
                order_id: orderId,
                status: "PLACED",
                changed_by: null // System/Webhook
            });
            console.log(`[Webhook] Order ${orderId} updated to 'PLACED'`);
            revalidatePath("/dashboard/orders");
            revalidatePath(`/orders/${orderId}`);
            revalidatePath("/admin/orders");
          }
        } else {
             console.warn(`[Webhook] Could not find order ID for event ${event.id}`);
        }
        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;
        const orderId = payment.notes?.order_id;
        
        if (orderId) {
          await supabase
            .from("orders")
            .update({ status: "CANCELLED", updated_at: new Date().toISOString() })
            .eq("id", orderId);
            
          await supabase.from("order_status_history").insert({
                order_id: orderId,
                status: "CANCELLED",
                changed_by: null
          });
          console.log(`[Webhook] Order ${orderId} marked as CANCELLED due to payment failure`);
          revalidatePath("/dashboard/orders");
          revalidatePath(`/orders/${orderId}`);
          revalidatePath("/admin/orders");
        }
        break;
      }

      case "payment.authorized": {
        console.log(`[Webhook] Payment authorized: ${event.payload.payment?.entity?.id}`);
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
