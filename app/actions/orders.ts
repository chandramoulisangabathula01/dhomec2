"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import Razorpay from "razorpay";

export async function createOrder(
  orderDetails: {
    total_amount: number;
    shipping_address: any;
    billing_address: any;
    payment_id?: string;
    razorpay_order_id?: string;
    items: any[];
  }
) {
  console.log("createOrder called with details:", JSON.stringify(orderDetails, null, 2));
  
  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Auth error in createOrder:", userError);
    throw new Error("User must be logged in to create an order");
  }

  console.log("User authenticated:", user.id);

  // 2. Create Order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      total_amount: orderDetails.total_amount,
      shipping_address: orderDetails.shipping_address,
      billing_address: orderDetails.billing_address,
      payment_id: orderDetails.payment_id,
      razorpay_order_id: orderDetails.razorpay_order_id,
      status: "pending"
    })
    .select()
    .single();

  if (orderError) {
    console.error("Supabase Error creating order:", orderError);
    throw new Error("Failed to create order record: " + orderError.message);
  }

  console.log("Order record created:", order.id);

  // 3. Create Order Items
  if (!orderDetails.items || !Array.isArray(orderDetails.items) || orderDetails.items.length === 0) {
      console.warn("Order created with no items:", order.id);
      return order;
  }

  const orderItemsInput = orderDetails.items.map((item: any) => ({
    order_id: order.id,
    product_id: item.id || item.product_id,
    quantity: item.quantity || 1,
    price_at_purchase: item.price || 0,
  }));

  console.log("Inserting order items:", orderItemsInput.length);

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsInput);

  if (itemsError) {
    console.error("Error creating order items:", itemsError);
    // Even if items fail, we return the order so the client can potentially recover or we can debug
    throw new Error("Failed to create order items: " + itemsError.message);
  }

  console.log("Order items created successfully");
  revalidatePath("/dashboard/orders");
  return order;
}

export async function getUserOrders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        products (name, image_url, slug)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return orders;
}

export async function getOrderById(orderId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: order, error } = await supabase
        .from("orders")
        .select(`
            *,
            order_items (
                *,
                products (name, image_url, slug)
            )
        `)
        .eq("id", orderId)
        .single();
    
    if (error) return null;
    
    return order;
}

export async function createRazorpayOrder(amount: number) {
    console.log("createRazorpayOrder called with amount:", amount);
    
    // Check for keys
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error("Razorpay keys missing in environment variables");
        throw new Error("Razorpay configuration is incomplete. Please check environment variables.");
    }

    try {
        const instance = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        console.log("Generating Razorpay order...");
        const order = await instance.orders.create({
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });
        
        console.log("Razorpay order created:", order.id);
        return { id: order.id, amount: order.amount };
    } catch (error: any) {
        console.error("Razorpay Order Error:", error);
        throw new Error(error.message || "Failed to initiate Razorpay order");
    }
}


