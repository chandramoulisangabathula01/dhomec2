import { getUserOrders } from "@/app/actions/orders";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Package, Truck, Calendar, ChevronRight } from "lucide-react";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const orders = await getUserOrders();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>


        {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No orders yet</h3>
                <p className="text-slate-500 mb-6">Start shopping to see your orders here.</p>
                <Link href="/products" className="text-primary hover:underline">Browse Products</Link>
            </div>
        ) : (
            <div className="space-y-6">
                {orders.map((order: any) => (
                    <div key={order.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="p-6 border-b bg-slate-50/50 flex flex-wrap gap-4 justify-between items-center">
                            <div className="flex gap-6 text-sm">
                                <div>
                                    <p className="text-slate-500 mb-1">Order Placed</p>
                                    <div className="font-medium flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-slate-500 mb-1">Total Amount</p>
                                    <p className="font-medium">₹ {order.total_amount?.toLocaleString('en-IN')}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 mb-1">Status</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                        ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                          'bg-yellow-100 text-yellow-800'}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                            <div className="hidden sm:block">
                                <span className="text-muted-foreground text-sm font-mono">#{order.id.slice(0, 8)}</span>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                {order.order_items.map((item: any) => (
                                    <div key={item.id} className="flex gap-4 items-center">
                                        <div className="w-16 h-16 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                                            {item.products.image_url ? (
                                                <img src={item.products.image_url} alt={item.products.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-xs text-slate-400">No Img</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-slate-900 truncate">{item.products.name}</h4>
                                            <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                             <p className="font-medium text-sm">₹ {item.price_at_purchase?.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    );
}

