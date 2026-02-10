
import { getUserOrders } from "@/app/actions/orders";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Package, Truck, CheckCircle2, Clock, Calendar, ArrowRight, ShoppingBag, Printer } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ReturnRequestButton from "@/components/orders/ReturnRequestButton";
export const dynamic = "force-dynamic";

export default async function UserOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const orders = await getUserOrders();

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6"> 
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-sm">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">My Orders</h1>
                <p className="text-slate-500 font-medium text-sm">Monitor your current and past transaction lifecycles.</p>
            </div>
            <Link href="/products">
                <Button className="rounded-2xl font-bold bg-slate-900 text-white hover:bg-black transition-all h-12 px-6">
                    Launch Store
                </Button>
            </Link>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
            {orders.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-[40px] border border-slate-200/60 shadow-lg shadow-slate-100">
                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Empty Stream</h2>
                    <p className="text-slate-500 mb-8 font-medium">No order sequences detected in your history.</p>
                    <Link href="/products">
                        <Button variant="outline" className="rounded-2xl font-bold border-2 h-12 px-8">
                            Start First Sequence
                        </Button>
                    </Link>
                </div>
            ) : (
                orders.map((order: any) => (
                    <div key={order.id} className="bg-white rounded-[32px] border border-slate-200/60 p-6 sm:p-10 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 group relative overflow-hidden">
                        {/* Status Accent Bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                             order.status === 'DELIVERED' ? 'bg-green-500' :
                             order.status === 'CANCELLED' ? 'bg-red-500' :
                             'bg-blue-500'
                        }`} />

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-8">
                            <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-transform duration-500 group-hover:scale-110 ${
                                    order.status === 'DELIVERED' ? 'border-green-100 bg-green-50 text-green-600' :
                                    order.status === 'CANCELLED' ? 'border-red-100 bg-red-50 text-red-600' :
                                    'border-blue-100 bg-blue-50 text-blue-600'
                                }`}>
                                    <Package className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-black text-xl text-slate-900 tracking-tight">#{order.id.slice(0, 8).toUpperCase()}</h3>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {formatStatus(order.status)}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wide">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 text-right">
                                <p className="text-2xl font-black text-slate-900 tracking-tighter">₹ {order.total_amount?.toLocaleString()}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Transaction Volume</p>
                            </div>
                        </div>

                        {/* Recent item preview */}
                        <div className="bg-slate-50/50 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center gap-6 border border-slate-100/50">
                             <div className="flex -space-x-4">
                                 {(order.order_items || []).slice(0, 4).map((item: any, idx: number) => {
                                     const product = item.products || item.product;
                                     return (
                                        <div key={idx} className="w-12 h-12 rounded-xl border-4 border-white bg-white shadow-sm overflow-hidden relative z-10 transition-transform hover:-translate-y-1 hover:z-30">
                                            {product?.image_url && <img src={product.image_url} className="w-full h-full object-cover" alt="" />}
                                        </div>
                                     )
                                 })}
                                 {(order.order_items || []).length > 4 && (
                                     <div className="w-12 h-12 rounded-xl border-4 border-white bg-slate-100 flex items-center justify-center text-[11px] font-black text-slate-500 relative z-20">
                                         +{order.order_items.length - 4}
                                     </div>
                                 )}
                             </div>
                             <div className="flex-1">
                                <span className="text-sm font-bold text-slate-700">
                                    {extractItemSummary(order.order_items)}
                                </span>
                                <div className="flex items-center gap-4 mt-2">
                                     <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <Clock className="w-3.5 h-3.5" />
                                        Update: {new Date(order.updated_at || order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                     </div>
                                </div>
                             </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                             <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
                                Current Sequence: {order.status}
                             </div>
                              <div className="flex gap-3">
                                <Link href={`/orders/${order.id}/invoice`} target="_blank">
                                    <Button variant="outline" className="rounded-xl font-bold text-[10px] uppercase tracking-widest border-2 h-10 px-5 gap-2 hover:bg-slate-50 transition-all">
                                        <Printer className="w-4 h-4" /> Invoice
                                    </Button>
                                </Link>
                                {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                                     <ReturnRequestButton 
                                         orderId={order.id} 
                                         variant="outline"
                                         className="rounded-xl font-bold text-[10px] uppercase tracking-widest border-2 h-10 px-5 gap-2 hover:bg-slate-50 transition-all border-orange-100 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                     />
                                )}
                                <Link href={`/orders/${order.id}`}>
                                    <Button className="rounded-xl font-black text-[11px] uppercase tracking-widest bg-slate-900 text-white hover:bg-black group-hover:translate-x-1 transition-all h-10 px-6">
                                        Track Lifecycle <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                              </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}

function formatStatus(status: string) {
    const map: Record<string, string> = {
        'PENDING_PAYMENT': 'Payment Initiated',
        'PLACED': 'Order Confirmed',
        'ACCEPTED': 'Processing',
        'PACKED': 'Packed',
        'SHIPPED': 'In Transit',
        'DELIVERED': 'Delivered',
        'CANCELLED': 'Cancelled',
        'RETURN_REQUESTED': 'Return Pending',
        'RETURN_APPROVED': 'Return Approved',
        'REFUNDED': 'Refunded'
    };
    return map[status.toUpperCase()] || status;
}

function extractItemSummary(items: any[]) {
    if (!items || items.length === 0) return "No items";
    const firstProduct = items[0]?.products || items[0]?.product;
    const name = firstProduct?.name || "Product";
    if (items.length === 1) return name;
    return `${name} and ${items.length - 1} other items`;
}
