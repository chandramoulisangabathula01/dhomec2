import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not set");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const supabase = await createClient();

    if (event.event === "payment.captured") {
        const payment = event.payload.payment.entity;
        const orderId = payment.notes.order_id; // Assumes we pass order_id in notes

        if (orderId) {
            const { error } = await supabase
                .from("orders")
                .update({ 
                    status: "packed", // Or 'paid' / 'accepted' depending on flow
                    payment_id: payment.id 
                })
                .eq("id", orderId);
            
            if (error) console.error("Error updating order status:", error);
        }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
