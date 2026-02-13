import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Force this route to be dynamic (no static caching)
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ 
    status: "active", 
    message: "Shiprocket Webhook Listener is ready" 
  }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    
    // 1. Verify Authentication (x-api-key)
    const token = req.headers.get("x-api-key");
    const secret = process.env.SHIPROCKET_WEBHOOK_TOKEN;
    
    if (secret && token !== secret) {
      console.warn("[Webhook] Unauthorized access attempt:", token);
      // Shiprocket requires 200 OK even on failure to avoid disabling webhook
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 200 });
    }

    const body = JSON.parse(rawBody);
    console.log("[Webhook] Received Event:", JSON.stringify(body, null, 2));

    const { 
      current_status, 
      order_id, 
      channel_order_id, 
      awb, 
      courier_name, 
      shipment_id,
      scans 
    } = body;

    // 2. Extract UUID from order_id (Handle composite IDs like "12345_UUID")
    let internalOrderId = null;
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

    // Check channel_order_id first
    if (channel_order_id) {
      const match = String(channel_order_id).match(uuidRegex);
      if (match) internalOrderId = match[0];
    }
    
    // Check order_id if not found yet
    if (!internalOrderId && order_id) {
      const match = String(order_id).match(uuidRegex);
      if (match) internalOrderId = match[0];
    }

    // Fallback: Use order_id as is if no UUID found
    if (!internalOrderId && order_id) {
      internalOrderId = order_id; 
    }

    if (!internalOrderId) {
      console.error("[Webhook] No valid order_id found in payload");
      return NextResponse.json({ success: false, message: "No order ID found" }, { status: 200 });
    }

    const supabase = await createClient();

    // 3. Verify Order Exists
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id, status, shipping_info")
        .eq("id", internalOrderId)
        .single();

    if (orderError || !order) {
        console.error(`[Webhook] Order ${internalOrderId} not found in DB.`);
        return NextResponse.json({ success: false, message: "Order not found" }, { status: 200 });
    }

    // 4. Map Status
    let newStatus = null;
    const statusLower = (current_status || "").toLowerCase();

    // Mapping logic based on Shiprocket status strings
    if (statusLower.includes("delivered")) {
        newStatus = "DELIVERED";
    } else if (
        statusLower.includes("manifested") || 
        statusLower.includes("intransit") || 
        statusLower.includes("out for delivery") || 
        statusLower.includes("pickup") || 
        statusLower.includes("shipped") ||
        statusLower.includes("in transit")
    ) {
        newStatus = "SHIPPED"; 
    } else if (statusLower.includes("rto") || statusLower.includes("cancelled") || statusLower.includes("canceled")) {
        newStatus = "CANCELLED";
    }

    // Logic: Do not revert a "DELIVERED" status to "SHIPPED"
    if (order.status === "DELIVERED" && newStatus === "SHIPPED") {
      newStatus = null;
    }

    // 5. Update Database
    const now = new Date().toISOString();
    let shippingInfoUpdates: any = {};
    
    // Always update shipping info with latest details
    if (awb || courier_name || shipment_id || current_status) {
       shippingInfoUpdates = {
          ...order.shipping_info,
          last_update: now,
          sr_status: current_status, // Store raw status for debugging
          history: [
            ...(order.shipping_info?.history || []),
            { 
              status: current_status, 
              timestamp: now,
              details: scans && scans.length > 0 ? scans[scans.length - 1] : null 
            }
          ]
       };
       if (awb) shippingInfoUpdates.awb_code = awb;
       if (courier_name) shippingInfoUpdates.courier_name = courier_name;
       if (shipment_id) shippingInfoUpdates.shipment_id = shipment_id;
    }

    const updates: any = {
      updated_at: now,
      shipping_info: shippingInfoUpdates
    };

    // Only update status if mapped and different
    if (newStatus && newStatus !== order.status) {
       updates.status = newStatus;
    }

    const { error: updateError } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", internalOrderId);

    if (updateError) {
        console.error("[Webhook] Update failed:", updateError);
        // Log error but return 200
        return NextResponse.json({ success: false, message: "Database update failed" }, { status: 200 });
    }

    // 6. Log History Entry if status changed
    if (newStatus && newStatus !== order.status) {
      await supabase.from("order_status_history").insert({
          order_id: internalOrderId,
          status: newStatus,
          changed_by: "system (shiprocket)",
          notes: `Status updated via webhook: ${current_status}`
      });
    }

    return NextResponse.json({ success: true, message: "Processed successfully" });

  } catch (err: any) {
    console.error("[Webhook] Critical Error:", err);
    // Return 200 even on critical error to satisfy Shiprocket
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 200 });
  }
}
