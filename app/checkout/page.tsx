"use client";

export const dynamic = "force-dynamic";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { createOrder, createRazorpayOrder } from "@/app/actions/orders";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async (orderId: string, razorpayOrderId: string, amount: number) => {
    const supabase = createClient();
    const res = await supabase.auth.getUser();

    const user = res.data.user;

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount, // amount is already in paise from Razorpay API
      currency: "INR",
      name: "Dhomec",
      description: "Order #" + orderId,
      order_id: razorpayOrderId,
      handler: async function (response: any) {
         router.push(`/orders/${orderId}/success?payment_id=${response.razorpay_payment_id}`);
         clearCart();
      },
      prefill: {
        name: user?.user_metadata?.full_name || "User",
        email: user?.email || "user@example.com",
        contact: user?.phone || "9999999999",
      },
      notes: {
        order_id: orderId,
      },
      theme: {
        color: "#2563eb",
      },
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.on("payment.failed", function (response: any) {
      alert(response.error.description);
      setLoading(false);
    });
    rzp1.open();
  };

  const handleCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const shippingAddress = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
      pincode: formData.get("pincode"),
      phone: formData.get("phone"),
    };

    try {
      // 1. Create Razorpay Order
      const rzpOrder = await createRazorpayOrder(totalPrice);

      // 2. Create Order on Supabase
      const order = await createOrder({
        total_amount: totalPrice,
        shipping_address: shippingAddress,
        billing_address: shippingAddress,
        razorpay_order_id: rzpOrder.id,
        items: items, // Pass the cart items from localStorage
      });

      if (!order) throw new Error("Failed to create order");

      // 3. Initiate Payment
      if (window.Razorpay) {
        handlePayment(order.id, rzpOrder.id, rzpOrder.amount);
      } else {
        alert("Razorpay SDK failed to load. Please refresh.");
        setLoading(false);
      }


    } catch (error: any) {
      console.error("Checkout error:", error);
      alert(error.message || "Something went wrong during checkout.");
      setLoading(false);
    }
  };


  if (items.length === 0) {
     return (
        <div className="min-h-screen pt-24 px-4 flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <Button onClick={() => router.push("/")}>Continue Shopping</Button>
        </div>
     )
  }

  return (
    <>
    <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
    />
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.back()}
                className="hover:bg-slate-100 rounded-full"
            >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <h1 className="text-3xl font-bold">Checkout</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Shipping Form */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-6">Shipping Details</h2>
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input name="fullName" required className="w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                 </div>
                 <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input name="email" type="email" required className="w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                 </div>
                 <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input name="phone" type="tel" required className="w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                 </div>
                 <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                    <textarea name="address" required className="w-full rounded-md border-gray-300 shadow-sm p-2 border" rows={3}/>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <input name="city" required className="w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                    <input name="state" required className="w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                    <input name="pincode" required className="w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                 </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm border h-fit">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            <div className="divide-y space-y-4">
                {items.map(item => (
                    <div key={item.id} className="flex justify-between py-2">
                        <span className="text-sm">
                            {item.name} <span className="text-muted-foreground">x{item.quantity}</span>
                        </span>
                        <span className="text-sm font-medium">₹ {(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                ))}
                
                <div className="pt-4 border-t flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹ {totalPrice.toLocaleString('en-IN')}</span>
                </div>
            </div>

            <Button 
                type="submit" 
                form="checkout-form"
                className="w-full mt-8 py-6 text-lg" 
                disabled={loading}
            >
                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                Pay & Place Order
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-4">
                Secured by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
