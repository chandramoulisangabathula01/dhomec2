
import { getOrderById } from "@/app/actions/orders";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Package, Truck, CheckCircle2, Clock, Calendar, MapPin, CreditCard, ArrowLeft, Printer, RefreshCcw, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ReturnRequestButton from "@/components/orders/ReturnRequestButton";

export const dynamic = "force-dynamic";

const STATUS_FLOW = [
  "PLACED",
  "ACCEPTED",
  "PACKED",
  "SHIPPED",
  "DELIVERED"
];

const STATUS_DESCRIPTIONS: Record<string, string> = {
  PLACED: "Order has been placed and is waiting for confirmation.",
  ACCEPTED: "Order has been confirmed by the seller.",
  PACKED: "Order is packed and ready for shipping.",
  SHIPPED: "Order is on the way to you.",
  DELIVERED: "Order has been delivered."
};

const STATUS_ICONS: Record<string, any> = {
  PLACED: Clock,
  ACCEPTED: CheckCircle2,
  PACKED: Package,
  SHIPPED: Truck,
  DELIVERED: MapPin
};

export default async function UserOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  // Security check: ensure user owns the order (getOrderById does not enforce ownership strict, it fetches single by ID but check logic inside)
  // Wait, my getOrderById calls `supabase.from("orders")...` directly. I should verify ownership.
  // Actually, getOrderById calls `createClient` which uses cookies.
  // But my `getOrderById` implementation does:
  // `.eq("id", orderId).single()`
  // It does NOT filter by `user_id`. But RLS on `orders` table says:
  // `create policy "Users can view own orders" on orders for select using (user_id = auth.uid());`
  // So `getOrderById` implicitly respects RLS and will return error/null if user doesn't own it.
  // So we are safe.

  const currentStatusIndex = STATUS_FLOW.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';
  const isReturned = order.status.includes('RETURN');

  // Parse shipping address
  let shippingAddress: any = order.shipping_address;
  if (typeof shippingAddress === "string") {
      try {
          shippingAddress = JSON.parse(shippingAddress);
      } catch (e) {
          // ignore
      }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/orders">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white hover:shadow-sm">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
                    <p className="text-sm font-medium text-slate-500">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Link href={`/orders/${order.id}/invoice`} target="_blank">
                    <Button variant="outline" size="sm" className="rounded-xl border-2 font-bold gap-2 hover:bg-white">
                        <Printer className="w-4 h-4" /> Invoice
                    </Button>
                </Link>
                <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${
                    isCancelled ? 'bg-red-100 text-red-700' : 
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                }`}>
                    {order.status}
                </div>
            </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm overflow-hidden relative">
            {isCancelled ? (
                 <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl font-bold">X</span>
                    </div>
                    <h2 className="text-xl font-black text-slate-900">Order Cancelled</h2>
                    <p className="text-slate-500 mt-2">This order has been cancelled.</p>
                 </div>
            ) : isReturned ? (
                 <div className="text-center py-12">
                    <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <RefreshCcw className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">Return Process Initiated</h2>
                    <p className="text-slate-500 mt-2 italic font-medium">Status: {order.status.replace('_', ' ')}</p>
                    <p className="text-xs text-slate-400 mt-4 max-w-sm mx-auto">Our logistics team is currently processing your request. You will be notified of any updates.</p>
                 </div>
            ) : order.status === 'RETURN_REJECTED' ? (
                 <div className="text-center py-12">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900">Return Request Denied</h2>
                    <p className="text-slate-500 mt-2">Your return request has been reviewed and declined.</p>
                    <p className="text-xs text-slate-400 mt-4">Please contact support for more details regarding this decision.</p>
                 </div>
            ) : (
                <div className="relative">
                    {/* Desktop Stepper */}
                    <div className="hidden md:flex justify-between items-center relative z-10">
                        {STATUS_FLOW.map((status, index) => {
                            const isCompleted = currentStatusIndex >= index;
                            const isCurrent = currentStatusIndex === index;
                            const Icon = STATUS_ICONS[status] || CheckCircle2;
                            
                            return (
                                <div key={status} className="flex flex-col items-center gap-4 relative group flex-1">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 z-10 bg-white ${
                                        isCompleted ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-200' : 
                                        'border-slate-100 text-slate-300'
                                    }`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="text-center absolute top-16 w-32">
                                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                                            isCompleted ? 'text-slate-900' : 'text-slate-300'
                                        }`}>
                                            {status}
                                        </p>
                                        {isCurrent && (
                                            <p className="text-[10px] font-medium text-blue-500 animate-pulse">
                                                In Progress
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Connecting Line */}
                    <div className="hidden md:block absolute top-6 left-0 w-full h-0.5 bg-slate-100 -z-0">
                        <div 
                            className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min((currentStatusIndex / (STATUS_FLOW.length - 1)) * 100, 100)}%` }}
                        />
                    </div>

                    {/* Mobile Stepper (Vertical) */}
                    <div className="md:hidden space-y-8 pl-4 border-l-2 border-slate-100 ml-4 relative">
                         {STATUS_FLOW.map((status, index) => {
                            const isCompleted = currentStatusIndex >= index;
                            const isCurrent = currentStatusIndex === index;
                            const Icon = STATUS_ICONS[status] || CheckCircle2;

                            return (
                                <div key={status} className="relative pl-8">
                                    <div className={`absolute -left-[21px] top-0 w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500 bg-white ${
                                        isCompleted ? 'border-blue-500 bg-blue-500 text-white' : 
                                        'border-slate-100 text-slate-300'
                                    }`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className={`font-black uppercase text-xs tracking-widest ${
                                            isCompleted ? 'text-slate-900' : 'text-slate-300'
                                        }`}>
                                            {status}
                                        </h3>
                                        {isCompleted && STATUS_DESCRIPTIONS[status] && (
                                            <p className="text-xs text-slate-500 mt-1">{STATUS_DESCRIPTIONS[status]}</p>
                                        )}
                                    </div>
                                </div>
                            )
                         })}
                    </div>
                </div>
            )}
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                 {/* Items */}
                 <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="font-black text-slate-700 text-xs uppercase tracking-widest flex items-center gap-2">
                            <Package className="w-4 h-4 text-slate-500" />
                            Items Details
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {(order.order_items || order.items || []).map((item: any) => {
                             const product = item.products || item.product;
                             return (
                                 <div key={item.id} className="p-8 flex gap-6">
                                     <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                                         {product?.image_url && (
                                             <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                         )}
                                     </div>
                                     <div className="flex-1">
                                         <h4 className="font-bold text-slate-900 mb-1">{product?.name}</h4>
                                         <p className="text-xs text-slate-500">Quantity: {item.quantity}</p>
                                     </div>
                                     <div className="font-black text-slate-900">
                                         ₹ {item.price_at_purchase?.toLocaleString()}
                                     </div>
                                 </div>
                             )
                        })}
                    </div>
                     <div className="bg-slate-50/80 p-8 flex justify-between items-center border-t border-slate-100">
                        <span className="font-bold text-slate-600 text-sm">Total Paid</span>
                        <span className="text-2xl font-black text-green-600">₹ {order.total_amount?.toLocaleString()}</span>
                    </div>
                 </div>
            </div>

            <div className="space-y-6">
                 {/* Shipping */}
                 <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
                    <h3 className="font-black text-slate-700 text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        Delivery Address
                    </h3>
                    {shippingAddress ? (
                         <div className="text-sm space-y-1 text-slate-600 leading-relaxed">
                            <p className="font-bold text-slate-900 mb-2">{shippingAddress.fullName}</p>
                            <p>{shippingAddress.address}</p>
                            <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
                            <p className="mt-2 font-medium text-slate-500">{shippingAddress.phone}</p>
                         </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic">No address details</p>
                    )}
                 </div>

                 {/* Support & Returns */}
                 <div className="bg-blue-600 rounded-[32px] p-8 text-white shadow-xl shadow-blue-200 space-y-4">
                     <div>
                        <h3 className="font-black text-xs uppercase tracking-widest mb-4 opacity-80">Need Help?</h3>
                        <p className="text-sm font-medium mb-6 opacity-90">If you have any issues with your order, our support team is ready to help.</p>
                        <Link href="/contact">
                            <Button variant="secondary" className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl h-12">
                                Contact Support
                            </Button>
                        </Link>
                     </div>
                     
                     {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                         <div className="pt-4 border-t border-white/10">
                            <p className="text-xs font-medium mb-4 opacity-90">Wish to return this order?</p>
                            <ReturnRequestButton orderId={order.id} />
                         </div>
                     )}
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
}
