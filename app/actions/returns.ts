"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createReturn(
  orderId: string,
  reason: string,
  items: { order_item_id: string; quantity: number; reason?: string }[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify order belongs to user
  const { data: order } = await supabase
    .from("orders")
    .select("id, total_amount, status")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) throw new Error("Order not found");
  if (!["paid", "delivered"].includes(order.status || "")) {
    throw new Error("Returns can only be initiated for paid or delivered orders");
  }

  // Create return request
  const { data: returnReq, error: returnError } = await supabase
    .from("returns")
    .insert({
      order_id: orderId,
      user_id: user.id,
      reason,
      status: "requested",
      refund_amount: order.total_amount,
    })
    .select()
    .single();

  if (returnError) {
    console.error("Error creating return:", returnError);
    throw new Error("Failed to create return request");
  }

  // Create return items
  if (items.length > 0) {
    const returnItems = items.map((item) => ({
      return_id: returnReq.id,
      order_item_id: item.order_item_id,
      quantity: item.quantity,
      reason: item.reason || reason,
    }));

    const { error: itemsError } = await supabase
      .from("return_items")
      .insert(returnItems);

    if (itemsError) {
      console.error("Error creating return items:", itemsError);
    }
  }

  // Update order status
  await supabase
    .from("orders")
    .update({ status: "return_requested" })
    .eq("id", orderId);

  revalidatePath("/dashboard/orders");
  revalidatePath("/admin/returns");
  return returnReq;
}

export async function getUserReturns() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("returns")
    .select(`
      *,
      orders (
        id, total_amount, created_at, status,
        order_items (
          *, products (name, image_url, slug)
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching returns:", error);
    return [];
  }
  return data;
}

export async function getAllReturns() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Forbidden");

  const { data, error } = await supabase
    .from("returns")
    .select(`
      *,
      profiles (full_name, avatar_url),
      orders (
        id, total_amount, created_at,
        order_items (
          *, products (name, image_url)
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all returns:", error);
    return [];
  }
  return data;
}

export async function updateReturnStatus(
  returnId: string,
  status: string,
  adminNotes?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Only admins can update return status");

  const updateData: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (adminNotes) updateData.admin_notes = adminNotes;

  const { error } = await supabase
    .from("returns")
    .update(updateData)
    .eq("id", returnId);

  if (error) {
    console.error("Error updating return:", error);
    throw new Error("Failed to update return status");
  }

  // If approved, update order status
  if (status === "approved" || status === "refund_initiated") {
    const { data: returnReq } = await supabase
      .from("returns")
      .select("order_id")
      .eq("id", returnId)
      .single();
    
    if (returnReq) {
      await supabase
        .from("orders")
        .update({ status: status === "refund_initiated" ? "refunded" : "return_approved" })
        .eq("id", returnReq.order_id);
    }
  }

  revalidatePath("/admin/returns");
  revalidatePath("/dashboard/orders");
  return { success: true };
}
