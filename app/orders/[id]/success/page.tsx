import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { CheckCircle2, Package, Home, AlertCircle } from "lucide-react";

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ payment_id?: string }>;
}) {
  let order: any = null;
  let paymentId: string | undefined;
  let errorMsg: string | null = null;

  try {
    const { id } = await params;
    
    if (!id || id === 'undefined') {
        throw new Error("Invalid Order ID");
    }

    const resolvedSearchParams = await searchParams;
    paymentId = resolvedSearchParams?.payment_id;
    const supabase = await createClient();

    // Update order with payment ID if provided
    if (paymentId) {
       // We ignore the result of the update to not block page load, but we await it to ensure consistency if possible
      await supabase
        .from("orders")
        .update({ payment_id: paymentId, status: "paid" })
        .eq("id", id)
        .select(); // safe execution
    }

    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *, products (name, image_url, slug)
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Order fetch error:", error);
      errorMsg = "Order not found or access denied.";
    } else {
        order = data;
    }
  } catch (err: any) {
    console.error("Order success page error:", err);
    errorMsg = "Something went wrong while loading your order.";
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center max-w-md mx-auto">
          {errorMsg ? (
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          ) : (
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          )}
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {errorMsg ? "Unable to Load Order" : "Payment Received!"}
          </h1>
          <p className="text-slate-500 mb-6">
              {errorMsg || "Your order is being processed. You can track it from your dashboard."}
          </p>
          <div className="flex flex-col gap-3 justify-center sm:flex-row">
            <Link
                href="/dashboard/orders"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-colors"
            >
                <Package className="w-4 h-4" />
                View My Orders
            </Link>
            <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-colors"
            >
                <Home className="w-4 h-4" />
                Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Safely parse shipping address
  let shippingAddress: any = null;
  try {
    if (order.shipping_address) {
        if (typeof order.shipping_address === "string") {
            shippingAddress = JSON.parse(order.shipping_address);
        } else if (typeof order.shipping_address === "object") {
            shippingAddress = order.shipping_address;
        }
    }
  } catch (e) {
    console.warn("Failed to parse shipping address", e);
    shippingAddress = null;
  }

  // Robust checks for formatting
  const formattedTotal = order.total_amount 
    ? Number(order.total_amount).toLocaleString("en-IN") 
    : "0";

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      {/* Success Header */}
      <div className="pt-24 pb-12 text-center px-4">
        <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in-50 duration-500">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 animate-in fade-in slide-in-from-bottom-3 duration-500">
          Order Placed Successfully!
        </h1>
        <p className="text-slate-500 text-lg max-w-md mx-auto animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100">
          Thank you for your purchase. We&apos;ll process your order shortly.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="max-w-2xl mx-auto px-4 pb-16 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Order Info Header */}
          <div className="bg-slate-50 px-8 py-6 border-b border-slate-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Order ID</p>
                <p className="text-sm font-mono font-bold text-slate-800">
                    {order.id ? order.id.slice(0, 8).toUpperCase() : "N/A"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {order.status === "paid" ? "Payment Confirmed" : "Processing"}
                </span>
              </div>
            </div>
            {paymentId && (
              <p className="text-xs text-slate-400 mt-3">
                Payment ID: <span className="font-mono">{paymentId}</span>
              </p>
            )}
          </div>

          {/* Order Items */}
          <div className="px-8 py-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Items Ordered</h3>
            {Array.isArray(order.order_items) && order.order_items.map((item: any) => {
               // Safe defaults
               const productName = item.products?.name || "Product";
               const productImg = item.products?.image_url;
               const itemTotal = (item.price_at_purchase || 0) * (item.quantity || 1);
               
               return (
                  <div key={item.id || Math.random()} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
                    <div className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                      {productImg ? (
                        <img src={productImg} alt={productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{productName}</p>
                      <p className="text-xs text-slate-400">Qty: {item.quantity || 1}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      ₹{Number(itemTotal).toLocaleString("en-IN")}
                    </p>
                  </div>
               );
            })}

            {/* Total */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <span className="text-base font-bold text-slate-800">Total Paid</span>
              <span className="text-xl font-extrabold text-emerald-600">
                ₹{formattedTotal}
              </span>
            </div>
          </div>

          {/* Shipping Info */}
          {shippingAddress && (
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Shipping To</h3>
              <div className="text-sm text-slate-600 space-y-1">
                {shippingAddress.fullName && <p className="font-bold text-slate-800">{shippingAddress.fullName}</p>}
                {shippingAddress.address && <p>{shippingAddress.address}</p>}
                {(shippingAddress.city || shippingAddress.state || shippingAddress.pincode) && (
                  <p>{[shippingAddress.city, shippingAddress.state, shippingAddress.pincode].filter(Boolean).join(", ")}</p>
                )}
                {shippingAddress.phone && <p>Phone: {shippingAddress.phone}</p>}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-8 py-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard/orders"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              <Package className="w-4 h-4" />
              Track Order
            </Link>
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-200 transition-colors"
            >
              <Home className="w-4 h-4" />
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="mt-8 bg-white rounded-2xl border border-slate-100 p-8">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">What happens next?</h3>
          <div className="space-y-6">
            {[
              { step: "1", title: "Order Confirmed", desc: "We've received your order and payment", done: true },
              { step: "2", title: "Processing", desc: "Your order is being packed", done: false },
              { step: "3", title: "Shipped", desc: "Your order is on its way", done: false },
              { step: "4", title: "Delivered", desc: "Your order has been delivered", done: false },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  item.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                }`}>
                  {item.done ? "✓" : item.step}
                </div>
                <div>
                  <p className={`text-sm font-bold ${item.done ? "text-slate-800" : "text-slate-400"}`}>{item.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
