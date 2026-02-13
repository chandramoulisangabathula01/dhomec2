import { createClient } from "@/utils/supabase/server";
import { 
  Search, 
  Filter, 
  RotateCw,
  Package,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Truck,
  Scale,
  MapPin,
  Printer
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  
  // Get User Role for Default View
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
  const isLogistics = profile?.role === 'LOGISTICS_STAFF';

  // Fetch Orders with Items & Product Weights
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
        *, 
        profile:profiles(full_name, email),
        order_items(
            quantity,
            product:products(name, weight_kg, dimensions)
        )
    `)
    .order("created_at", { ascending: false })
    .limit(50); // Limit for performance

  if (error) {
    console.error("Error fetching admin orders:", error);
  }

  // Calculate Stats
  const totalRevenue = orders?.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0) || 0;
  const pendingOrders = orders?.filter(o => !['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(o.status)).length || 0;
  const readyToShip = orders?.filter(o => ['PACKED', 'PLACED', 'ACCEPTED'].includes(o.status)).length || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Management</h1>
          <p className="text-xs font-bold text-slate-400 mt-1">Track sales, shipments & logistics</p>
        </div>
        <div className="flex gap-3">
             <Button variant="outline" className="gap-2 rounded-xl h-10">
                 <Filter className="w-4 h-4" /> Filter
             </Button>
             <Button className="gap-2 rounded-xl h-10 bg-[#4C63FC] hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                 <Package className="w-4 h-4" /> Export CSV
             </Button>
        </div>
      </div>

      <Tabs defaultValue={isLogistics ? "logistics" : "sales"} className="w-full">
        <TabsList className="bg-white p-1 rounded-xl border border-slate-200 w-full md:w-auto h-auto grid grid-cols-2 md:inline-flex mb-6">
          <TabsTrigger value="sales" className="rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 font-bold px-6 py-2 gap-2">
             <CreditCard className="w-4 h-4" /> Sales Overview
          </TabsTrigger>
          <TabsTrigger value="logistics" className="rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 font-bold px-6 py-2 gap-2">
             <Truck className="w-4 h-4" /> Logistics Queue
             <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[10px] ml-1">{readyToShip}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
             {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#4C63FC]">
                        <CreditCard className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{orders?.length || 0}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                        <Package className="w-5 h-5" />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Processing</p>
                        <p className="text-2xl font-black text-slate-900 mt-1">{pendingOrders}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Sales Table */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead>
                    <tr className="text-xs text-slate-400 border-b border-slate-50">
                        <th className="pb-3 pl-4 font-bold w-10"><input type="checkbox" className="rounded border-slate-300 text-[#4C63FC] focus:ring-[#4C63FC]" /></th>
                        <th className="pb-3 font-bold uppercase tracking-wider">Order ID</th>
                        <th className="pb-3 font-bold uppercase tracking-wider">Customer</th>
                        <th className="pb-3 font-bold uppercase tracking-wider">Date</th>
                        <th className="pb-3 font-bold uppercase tracking-wider">Amount</th>
                        <th className="pb-3 font-bold uppercase tracking-wider">Status</th>
                        <th className="pb-3 font-bold w-10"></th>
                    </tr>
                    </thead>
                    <tbody className="text-sm">
                    {orders && orders.length > 0 ? orders.map((order) => (
                        <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                        <td className="py-4 pl-4"><input type="checkbox" className="rounded border-slate-300 text-[#4C63FC] focus:ring-[#4C63FC]" /></td>
                        <td className="py-4 font-bold text-slate-600">#{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="py-4">
                            <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">
                                {order.profile?.full_name?.charAt(0) || "U"}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 truncate max-w-[150px]">{order.profile?.full_name || "Guest User"}</p>
                                <p className="text-[10px] text-slate-400">{order.profile?.email || "-"}</p>
                            </div>
                            </div>
                        </td>
                        <td className="py-4 text-slate-500 font-medium text-xs">
                            {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 font-black text-slate-900 border-dashed border-b border-slate-200 w-fit">
                            ₹{order.total_amount?.toLocaleString()}
                        </td>
                        <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                            order.status === "DELIVERED" ? "bg-green-50 text-green-600" : 
                            order.status === "CANCELLED" ? "bg-red-50 text-red-600" : 
                            order.status === "SHIPPED" ? "bg-blue-50 text-blue-600" :
                            "bg-slate-100 text-slate-600"
                            }`}>
                            {order.status === "DELIVERED" ? <CheckCircle2 className="w-3 h-3" /> : 
                                order.status === "CANCELLED" ? <XCircle className="w-3 h-3" /> : 
                                order.status === "SHIPPED" ? <Package className="w-3 h-3" /> :
                                <Clock className="w-3 h-3" /> }
                            {order.status}
                            </span>
                        </td>
                        <td className="py-4 text-right pr-4">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link href={`/admin/orders/${order.id}`}>
                                    <button className="p-1.5 text-slate-400 hover:text-[#4C63FC] hover:bg-blue-50 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                                </Link>
                            </div>
                        </td>
                        </tr>
                    )) : (
                        <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                            No orders found.
                        </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
            </div>
        </TabsContent>

        <TabsContent value="logistics">
             {/* Logistics Table */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                    <thead>
                    <tr className="text-xs text-slate-400 border-b border-slate-50 bg-slate-50/50">
                        <th className="py-4 pl-4 font-bold uppercase tracking-wider">Order Details</th>
                        <th className="py-4 font-bold uppercase tracking-wider">Weight & Dims</th>
                        <th className="py-4 font-bold uppercase tracking-wider">Shipping Address</th>
                        <th className="py-4 font-bold uppercase tracking-wider">Carrier Info</th>
                        <th className="py-4 font-bold uppercase tracking-wider">Status</th>
                        <th className="py-4 font-bold w-10 text-right pr-6">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="text-sm">
                    {orders && orders.length > 0 ? orders.map((order) => {
                        const totalWeight = order.order_items?.reduce((acc: number, item: any) => acc + ((item.product?.weight_kg || 0) * item.quantity), 0).toFixed(2);
                        const itemCount = order.order_items?.reduce((acc: number, item: any) => acc + item.quantity, 0);
                        const address = (order.shipping_address as any) || {};

                        return (
                        <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                            <td className="py-4 pl-6">
                                <p className="font-bold text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                                <p className="text-[10px] text-slate-500 font-medium">{itemCount} Items • {new Date(order.created_at).toLocaleDateString()}</p>
                            </td>
                            <td className="py-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                        <Scale className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{totalWeight} Kg</p>
                                        <p className="text-[10px] text-slate-400">Total Volumetric</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 max-w-[200px]">
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-slate-300 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="font-bold text-slate-900 text-xs truncate">{address.city || 'N/A'}, {address.state || ''}</p>
                                        <p className="text-[10px] text-slate-500 font-mono">PIN: {address.pincode || '000000'}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4">
                                {(order.shipping_info as any)?.provider ? (
                                    <div>
                                        <p className="font-bold text-blue-600 text-xs">{(order.shipping_info as any).provider}</p>
                                        <p className="text-[10px] text-slate-400 font-mono">AWB: {(order.shipping_info as any).awb_code}</p>
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-400 italic">Not Assigned</span>
                                )}
                            </td>
                            <td className="py-4">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                order.status === "DELIVERED" ? "bg-green-50 text-green-600" : 
                                order.status === "SHIPPED" ? "bg-blue-50 text-blue-600" :
                                "bg-slate-100 text-slate-600"
                                }`}>
                                {order.status}
                                </span>
                            </td>
                            <td className="py-4 text-right pr-6">
                                <div className="flex items-center justify-end gap-2">
                                    <Link href={`/admin/orders/${order.id}/invoice`} target="_blank">
                                        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs font-bold border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                                            <Printer className="w-3 h-3" /> Invoice
                                        </Button>
                                    </Link>
                                    <Link href={`/admin/orders/${order.id}`}>
                                        <Button size="sm" className="h-8 gap-2 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800">
                                            Manage
                                        </Button>
                                    </Link>
                                </div>
                            </td>
                        </tr>
                        );
                    }) : (
                        <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                            No active orders in logistics queue.
                        </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
