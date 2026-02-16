"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import Razorpay from "razorpay";

// Define OrderStatus type locally or import if available
type OrderStatus = 
  | 'PENDING_PAYMENT'
  | 'PLACED'
  | 'ACCEPTED'
  | 'PACKED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURN_APPROVED'
  | 'RETURN_REJECTED'
  | 'REFUNDED';

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

  // Default 18% GST Logic (Inclusive)
  const gstAmount = orderDetails.total_amount - (orderDetails.total_amount / 1.18);
  const taxBreakdown = {
      cgst: Number((gstAmount / 2).toFixed(2)),
      sgst: Number((gstAmount / 2).toFixed(2))
  };

  // 2. Create Order
  // Note: payment_id renamed to razorpay_payment_id in recent migration
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      total_amount: orderDetails.total_amount,
      shipping_address: orderDetails.shipping_address,
      billing_address: orderDetails.billing_address,
      razorpay_payment_id: orderDetails.payment_id,
      razorpay_order_id: orderDetails.razorpay_order_id,
      status: "PENDING_PAYMENT",
      tax_breakdown: taxBreakdown
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
    throw new Error("Failed to create order items: " + itemsError.message);
  }
  
  // 4. Create Initial Audit Log
  const { error: auditError } = await supabase.from("order_status_history").insert({
    order_id: order.id,
    status: "PENDING_PAYMENT",
    changed_by: user.id
  });

  if (auditError) console.error("Error creating initial audit log:", auditError);

  console.log("Order items created successfully");

  // Send Confirmation Email
  try {
    const { OrderConfirmationEmail } = await import("@/lib/email-templates");
    const { sendEmail } = await import("@/lib/notifications");
    
    // Attempt to get user email
    let userEmail = user.email;
    let userName = user.user_metadata?.full_name || userEmail?.split('@')[0] || 'Customer';

    // If guest checkout details are available in shipping address, prioritize or fallback?
    // Usually auth user email is primary.
    if (!userEmail && orderDetails.shipping_address?.email) {
        userEmail = orderDetails.shipping_address.email;
        userName = orderDetails.shipping_address.fullName;
    }

    if (userEmail) {
        const confirmationHtml = OrderConfirmationEmail(
            order.id, 
            userName,
            orderDetails.items, // Assuming these have product details
            orderDetails.total_amount
        );
        await sendEmail(userEmail, `Order Confirmation #${order.id.slice(0, 8)}`, confirmationHtml);
    }
  } catch (emailErr) {
      console.warn("Failed to send confirmation email", emailErr);
  }

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
        console.warn("Razorpay keys missing. Using MOCK mode.");
        return { 
            id: `mock_order_${Date.now()}`, 
            amount: Math.round(amount * 100),
            isMock: true 
        };
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
        return { id: order.id, amount: order.amount, isMock: false };
    } catch (error: any) {
        console.error("Razorpay Order Error:", error);
        throw new Error(error.message || "Failed to initiate Razorpay order");
    }
}

export async function getAllOrders() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const allowedRoles = ['SUPER_ADMIN', 'SUPPORT_STAFF', 'LOGISTICS_STAFF'];
  if (!profile || !allowedRoles.includes(profile.role)) {
      throw new Error("Unauthorized: Staff access only");
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        *,
        products (name, image_url, slug)
      ),
      user:profiles!user_id (email, full_name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all orders:", error);
    throw error;
  }

  return orders;
}

import { ShippingInfo } from "@/types";

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus, shippingInfo?: ShippingInfo) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const allowedRoles = ['SUPER_ADMIN', 'SUPPORT_STAFF', 'LOGISTICS_STAFF'];
  if (!profile || !allowedRoles.includes(profile.role)) {
      throw new Error("Unauthorized: Staff access only");
  }

  // Validate State Transition
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
      console.error(`[OrderAction] Fetch error for ${orderId}:`, fetchError);
      throw new Error(`Order not found or fetch failed: ${fetchError?.message}`);
  }

  const currentStatus = order.status as OrderStatus;
  console.log(`[OrderAction] Updating ${orderId} from ${currentStatus} to ${newStatus}`);
  
  // Define valid transitions
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING_PAYMENT: ['PLACED', 'CANCELLED'],
    PLACED: ['ACCEPTED', 'CANCELLED'],
    ACCEPTED: ['PACKED', 'CANCELLED'],
    PACKED: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED', 'RETURN_REQUESTED'],
    DELIVERED: ['RETURN_REQUESTED'],
    CANCELLED: [],
    RETURN_REQUESTED: ['RETURN_APPROVED', 'RETURN_REJECTED', 'REFUNDED'],
    RETURN_APPROVED: ['REFUNDED'],
    RETURN_REJECTED: [],
    REFUNDED: []
  };
  
  if (!validTransitions[currentStatus]?.includes(newStatus)) {
      console.error(`[OrderAction] Invalid transition attempt: ${currentStatus} -> ${newStatus}`);
      // Allow re-setting the same status? No, usually not needed.
      if (currentStatus !== newStatus) {
          throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
      }
  }

  // Prepare Update Data
  const updateData: any = { 
    status: newStatus,
    updated_at: new Date().toISOString()
  };

  if (shippingInfo && newStatus === 'SHIPPED') {
      updateData.shipping_info = shippingInfo;
  }

  // Update Status
  const { error: updateError } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId);

  if (updateError) throw updateError;

  // Audit Log
  const { error: auditError } = await supabase
    .from("order_status_history")
    .insert({
      order_id: orderId,
      status: newStatus,
      changed_by: user.id
    });

  if (auditError) console.error("Error creating audit log:", auditError);

  // Send Email Notification for SHIPPED status
  if (newStatus === 'SHIPPED' && shippingInfo) {
      try {
          // Fetch user email details
          const { data: orderWithUser } = await supabase
              .from('orders')
              .select('id, user_id, shipping_address, user:profiles(email, full_name)')
              .eq('id', orderId)
              .single();
          
          if (orderWithUser) {
              const userObj: any = Array.isArray(orderWithUser.user) ? orderWithUser.user[0] : orderWithUser.user;
              const recipientEmail = userObj?.email || (orderWithUser.shipping_address as any)?.email;
              const recipientName = userObj?.full_name || (orderWithUser.shipping_address as any)?.fullName || 'Customer';
              
              if (recipientEmail) {
                  const { OrderShippedEmail } = await import("@/lib/email-templates");
                  const { sendEmail } = await import("@/lib/notifications");
                  const emailHtml = OrderShippedEmail(orderId, recipientName, shippingInfo);
                  await sendEmail(recipientEmail, `Order #${orderId.slice(0, 8)} Shipped!`, emailHtml);
              }
          }
      } catch (emailErr) {
          console.error("Failed to send shipment email:", emailErr);
      }
  }

  revalidatePath(`/admin/orders`);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/dashboard/orders`);
  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}

export async function getOrderHistory(orderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const allowedRoles = ['SUPER_ADMIN', 'SUPPORT_STAFF', 'LOGISTICS_STAFF'];
  if (!profile || !allowedRoles.includes(profile.role)) {
      // Check if user is the order owner
      const { data: order } = await supabase.from('orders').select('user_id').eq('id', orderId).single();
      if (!order || order.user_id !== user.id) {
          throw new Error("Unauthorized: Access denied");
      }
  }

  const { data: history, error } = await supabase
    .from("order_status_history")
    .select(`
      *,
      changer:profiles!order_status_history_changed_by_fkey (full_name, email)
    `)
    .eq("order_id", orderId)
    .order("changed_at", { ascending: false });

  if (error) {
    console.error("Error fetching order history:", JSON.stringify(error, null, 2));
    return [];
  }

  return history;
}

export async function requestOrderReturn(orderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Verify ownership
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("status, user_id")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
      throw new Error("Order not found");
  }

  if (order.user_id !== user.id) {
      throw new Error("Unauthorized to access this order");
  }

  const currentStatus = order.status;
  
  // Only allow from SHIPPED or DELIVERED
  if (currentStatus !== 'SHIPPED' && currentStatus !== 'DELIVERED') {
      throw new Error(`Return cannot be requested for an order in ${currentStatus} status`);
  }

  // Update Status
  const { error: updateError } = await supabase
    .from("orders")
    .update({ 
      status: 'RETURN_REQUESTED',
      updated_at: new Date().toISOString()
    })
    .eq("id", orderId);

  if (updateError) throw updateError;

  // Audit Log
  const { error: auditError } = await supabase
    .from("order_status_history")
    .insert({
      order_id: orderId,
      status: 'RETURN_REQUESTED',
      changed_by: user.id
    });

  if (auditError) console.error("Error creating audit log:", auditError);

  revalidatePath(`/orders/${orderId}`);
  revalidatePath(`/admin/orders`);
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function verifyPaymentStatus(orderId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");
    
    // Fetch Order
    const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
    if (!order) throw new Error("Order not found");

    if (!order.razorpay_order_id) {
         throw new Error("No Razorpay Order ID linked to this order.");
    }

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("Razorpay keys missing.");
    }

    try {
        const instance = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // Fetch order from Razorpay
        const rzOrder = await instance.orders.fetch(order.razorpay_order_id);
        
        let newStatus: OrderStatus | null = null;
        if (rzOrder.status === 'paid') {
            newStatus = 'PLACED';
        } else if (rzOrder.status === 'attempted') {
             // Check payments
             const payments = await instance.orders.fetchPayments(order.razorpay_order_id);
             const captured = payments.items.find((p: any) => p.status === 'captured');
             if (captured) {
                  newStatus = 'PLACED';
                  // Update payment ID if different
                  if (captured.id !== order.razorpay_payment_id) {
                      await supabase.from('orders').update({ razorpay_payment_id: captured.id }).eq('id', orderId);
                  }
             }
        }

        if (newStatus && newStatus !== order.status) {
             const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
             if (error) throw error;
             
             await supabase.from("order_status_history").insert({
                order_id: orderId,
                status: newStatus,
                changed_by: user.id
             });
             
             revalidatePath(`/admin/orders/${orderId}`);
             return { success: true, status: newStatus, message: "Payment verified. Order status updated." };
        }

        return { success: false, status: rzOrder.status, message: `Razorpay status: ${rzOrder.status}. No change needed.` };

    } catch (error: any) {
        console.error("Payment Verification Error:", error);
        throw new Error(error.message || "Verification failed");
    }
}
