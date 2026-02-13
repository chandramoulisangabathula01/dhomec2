import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Verify Shiprocket webhook authenticity
// Typically Shiprocket sends a header `x-shiprocket-token` if configured in settings.
// Or we can verify by checking if the order exists.
const WEBHOOK_SECRET = process.env.SHIPROCKET_WEBHOOK_TOKEN;

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    // Verify signature if secret is set
    if (WEBHOOK_SECRET) {
      const signature = req.headers.get("x-api-key");
      if (signature !== WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    const { current_status, order_id, channel_order_id, awb, courier_name, shipment_id } = body;

    // Determine the internal order ID (UUID)
    // Shiprocket usually returns the channel's order ID in 'channel_order_id' or 'order_id'
    // Our ID is a UUID string.
    let internalOrderId = channel_order_id || order_id;
    
    // Basic validation: UUID format check (optional but good for safety)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(internalOrderId);
    if (!isUuid && channel_order_id) {
        // Retry channel_order_id specifically if order_id was numeric
        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(channel_order_id)) {
            internalOrderId = channel_order_id;
        }
    }

    if (!internalOrderId) {
      console.error("[Shiprocket Webhook] Missing order ID:", body);
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    console.log(`[Shiprocket Webhook] Update for Order ${internalOrderId}: ${current_status}`);

    const supabase = await createClient();

    // Verify order exists
    const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("id, status, shipping_info")
        .eq("id", internalOrderId)
        .single();

    if (orderError || !order) {
        console.error(`[Shiprocket Webhook] Order ${internalOrderId} not found.`);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Map status
    let newStatus = null;
    const statusLower = (current_status || "").toLowerCase();

    if (statusLower.includes("delivered")) {
        newStatus = "DELIVERED";
    } else if (
        statusLower.includes("manifested") || 
        statusLower.includes("intransit") || 
        statusLower.includes("out for delivery") || 
        statusLower.includes("pickup") || 
        statusLower.includes("shipped")
    ) {
        newStatus = "SHIPPED"; // Or keep as SHIPPED if already there
    } else if (statusLower.includes("rto") || statusLower.includes("cancelled")) {
        newStatus = "CANCELLED"; // Or RETURNED if enum supports it
    }

    // Update if status changed or new shipping info
    if (newStatus && newStatus !== order.status) {
        // Prepare update payload
        const updates: any = {
            status: newStatus,
            updated_at: new Date().toISOString(),
        };

        // Update shipping info if available
        if (awb || courier_name || shipment_id) {
            updates.shipping_info = {
                ...order.shipping_info,
                awb_code: awb || order.shipping_info?.awb_code,
                courier_name: courier_name || order.shipping_info?.courier_name,
                shipment_id: shipment_id || order.shipping_info?.shipment_id,
                last_update: new Date().toISOString(),
                sr_status: current_status // Keep raw status for reference
            };
        }

        const { error: updateError } = await supabase
            .from("orders")
            .update(updates)
            .eq("id", internalOrderId);

        if (updateError) {
            console.error("[Shiprocket Webhook] Update failed:", updateError);
            return NextResponse.json({ error: "Update failed" }, { status: 500 });
        }

        // Add history
        await supabase.from("order_status_history").insert({
            order_id: internalOrderId,
            status: newStatus,
            changed_by: "system (shiprocket webhook)",
            notes: `Status updated to ${newStatus} via Shiprocket (${current_status})`
        });
    } else {
        // Just update shipping info / tracking if status didn't change (e.g. Manifested -> In Transit)
         if (awb || courier_name || shipment_id) {
             const updates = {
                shipping_info: {
                    ...order.shipping_info,
                    awb_code: awb || order.shipping_info?.awb_code,
                    courier_name: courier_name || order.shipping_info?.courier_name,
                    shipment_id: shipment_id || order.shipping_info?.shipment_id,
                    last_update: new Date().toISOString(),
                    sr_status: current_status
                },
                updated_at: new Date().toISOString(),
             };
             await supabase.from("orders").update(updates).eq("id", internalOrderId);
         }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[Shiprocket Webhook] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
