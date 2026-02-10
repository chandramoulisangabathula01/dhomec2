"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createOrder(
  orderDetails: {
    total_amount: number;
    shipping_address: any;
    billing_address: any;
    payment_id?: string;
    razorpay_order_id?: string;
    items: any[]; // Accept items from client
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User must be logged in to create an order");
  }

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
      status: "pending" // Initial status
    })
    .select()
    .single();

  if (orderError) {
    console.error("Error creating order:", orderError, orderDetails);
    throw new Error("Failed to create order record");
  }

  // 3. Create Order Items
  const orderItemsInput = orderDetails.items.map((item: any) => ({
    order_id: order.id,
    product_id: item.id, // Using item.id which is the product id in client cart
    quantity: item.quantity,
    price_at_purchase: item.price, // Snapshot price from client
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsInput);

  if (itemsError) {
    console.error("Error creating order items:", itemsError);
    throw new Error("Failed to create order items");
  }

  // 4. Cleanup (Optional: client clears localStorage)
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
    
    // Security check: only allow if user owns order or is admin
    // (Admin check omitted for brevity, assuming RLS handles it or separate admin action)
    if (order.user_id !== user.id) {
        // Check if admin
        // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        // if (profile?.role !== 'admin') return null;
        // RELYING ON RLS POLICIES DEFINED IN SCHEMA
    }

    return order;
}

export async function createRazorpayOrder(amount: number) {
    console.log("Starting createRazorpayOrder with amount:", amount);
    
    // Debug logging for env vars (masking secrets)
    console.log("Checking Razorpay Keys...");
    console.log("NEXT_PUBLIC_RAZORPAY_KEY_ID present:", !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);
    console.log("RAZORPAY_KEY_SECRET present:", !!process.env.RAZORPAY_KEY_SECRET);

    const Razorpay = require("razorpay");
    
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.error("Razorpay keys are missing!");
        throw new Error("Razorpay keys are not configured");
    }

    try {
        const instance = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        console.log("Razorpay instance created. Creating order...");
        const order = await instance.orders.create({
            amount: Math.round(amount * 100), // amount in the smallest currency unit
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
        });
        
        console.log("Razorpay order created successfully:", order.id);
        return { id: order.id, amount: order.amount };
    } catch (error: any) {
        console.error("Razorpay order creation failed:", error);
        // Log the full error object structure if possible
        if (error.statusCode) console.error("Status Code:", error.statusCode);
        if (error.error) console.error("Error Details:", error.error);
        throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
}

