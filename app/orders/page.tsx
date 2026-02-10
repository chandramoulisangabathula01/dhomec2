
import { getUserOrders } from "@/app/actions/orders";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Package, Truck, CheckCircle2, Clock, Calendar, ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function UserOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const orders = await getUserOrders();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">My Orders</h1>
                <p className="text-slate-500 font-medium">Track your purchase history and status.</p>
            </div>
            {/* Maybe a link to shop more? */}
            <Link href="/products">
                <Button className="rounded-xl font-bold">
                    Browse Products
                </Button>
            </Link>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
            {orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[32px] border border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2">No orders yet</h2>
                    <p className="text-slate-500 mb-6">Start shopping to see your orders here.</p>
                    <Link href="/products">
                        <Button variant="outline" className="rounded-xl font-bold">
                            Start Shopping
                        </Button>
                    </Link>
                </div>
            ) : (
                orders.map((order: any) => (
                    <div key={order.id} className="bg-white rounded-[24px] border border-slate-200 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${
                                    order.status === 'DELIVERED' ? 'border-green-100 bg-green-50 text-green-600' :
                                    order.status === 'CANCELLED' ? 'border-red-100 bg-red-50 text-red-600' :
                                    'border-blue-100 bg-blue-50 text-blue-600'
                                }`}>
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-black text-slate-900 tracking-tight">#{order.id.slice(0, 8).toUpperCase()}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                            'bg-blue-100 text-blue-700'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right sm:text-right">
                                <p className="text-2xl font-black text-slate-900">₹ {order.total_amount?.toLocaleString()}</p>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">Total Amount</p>
                            </div>
                        </div>

                        {/* Recent item preview */}
                        <div className="bg-slate-50 rounded-xl p-4 mb-6 flex items-center gap-4">
                             {/* Show up to 3 product thumbnails */}
                             <div className="flex -space-x-3">
                                 {(order.order_items || []).slice(0, 3).map((item: any, idx: number) => {
                                     const product = item.products || item.product;
                                     return (
                                        <div key={idx} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden relative z-10">
                                            {product?.image_url && <img src={product.image_url} className="w-full h-full object-cover" alt="" />}
                                        </div>
                                     )
                                 })}
                                 {(order.order_items || []).length > 3 && (
                                     <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 relative z-20">
                                         +{order.order_items.length - 3}
                                     </div>
                                 )}
                             </div>
                             <span className="text-xs font-medium text-slate-600">
                                 {extractItemSummary(order.order_items)}
                             </span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                             <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                <Clock className="w-3.5 h-3.5" />
                                Last updated: {new Date(order.updated_at || order.created_at).toLocaleString()}
                             </div>
                             <Link href={`/orders/${order.id}`}>
                                <Button className="group-hover:translate-x-1 transition-transform rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800">
                                    Track Order <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                             </Link>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}

function extractItemSummary(items: any[]) {
    if (!items || items.length === 0) return "No items";
    const firstProduct = items[0]?.products || items[0]?.product;
    const name = firstProduct?.name || "Product";
    if (items.length === 1) return name;
    return `${name} + ${items.length - 1} more items`;
}
