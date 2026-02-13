import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import {
  Factory,
  AlertTriangle,
  Package,
  ClipboardCheck,
  Truck,
  Timer,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ChevronRight,
  Box,
  Zap,
  Activity,
  Eye,
  BarChart3,
} from "lucide-react";

export const dynamic = "force-dynamic";

function getSLAColor(targetDate: string | null) {
  if (!targetDate) return { color: "slate", label: "No SLA", hours: null };
  const hoursRemaining = (new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursRemaining < 0) return { color: "red", label: "BREACHED", hours: Math.abs(Math.round(hoursRemaining)) };
  if (hoursRemaining < 24) return { color: "amber", label: "URGENT", hours: Math.round(hoursRemaining) };
  if (hoursRemaining < 48) return { color: "yellow", label: "WARNING", hours: Math.round(hoursRemaining) };
  return { color: "green", label: "ON TRACK", hours: Math.round(hoursRemaining) };
}

export default async function SellerDashboard() {
  const supabase = await createClient();

  const [
    { count: newOrdersCount },
    { count: inProductionCount },
    { count: qcCount },
    { count: readyToPackCount },
    { count: criticalCount },
    { data: criticalOrders },
    { data: revenueData },
    { data: lowStockProducts },
    { data: workshopSettings },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("production_status", "New"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("production_status", "In-Production"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("production_status", "QC"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("production_status", "Ready"),
    supabase.from("orders").select("*", { count: "exact", head: true })
      .in("production_status", ["New", "In-Production"])
      .lte("target_ship_date", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()),
    supabase.from("orders").select("*, profile:profiles(full_name), items:order_items(*, product:products(name))")
      .in("production_status", ["New", "In-Production"])
      .lte("target_ship_date", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString())
      .order("target_ship_date", { ascending: true })
      .limit(5),
    supabase.from("orders").select("total_amount, created_at").eq("status", "DELIVERED"),
    supabase.from("products").select("id, name, stock_quantity, min_stock_threshold, image_url")
      .lte("stock_quantity", 10)
      .order("stock_quantity", { ascending: true })
      .limit(8),
    supabase.from("seller_settings").select("*"),
    supabase.from("orders").select("*, profile:profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const totalRevenue = revenueData?.reduce((a, c) => a + (Number(c.total_amount) || 0), 0) || 0;
  const workshopLoad = workshopSettings?.find((s: any) => s.setting_key === "workshop_load")?.setting_value || "normal";

  const pipelineStages = [
    { label: "New Work", count: newOrdersCount || 0, icon: Package, color: "bg-blue-500", textColor: "text-blue-600", bgLight: "bg-blue-50", href: "/admin/seller/pipeline?tab=new" },
    { label: "In Production", count: inProductionCount || 0, icon: Factory, color: "bg-orange-500", textColor: "text-orange-600", bgLight: "bg-orange-50", href: "/admin/seller/pipeline?tab=production" },
    { label: "Quality Check", count: qcCount || 0, icon: ClipboardCheck, color: "bg-purple-500", textColor: "text-purple-600", bgLight: "bg-purple-50", href: "/admin/seller/pipeline?tab=qc" },
    { label: "Ready to Pack", count: readyToPackCount || 0, icon: Truck, color: "bg-green-500", textColor: "text-green-600", bgLight: "bg-green-50", href: "/admin/seller/pipeline?tab=ready" },
  ];

  const outOfStockCount = lowStockProducts?.filter((p: any) => p.stock_quantity === 0).length || 0;
  const lowStockCount = lowStockProducts?.filter((p: any) => p.stock_quantity > 0).length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Command Center</h1>
          <p className="text-slate-500 mt-1 font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#2874f0]" />
            Production pipeline & operations overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border ${
            workshopLoad === "high" 
              ? "bg-red-50 border-red-200 text-red-700" 
              : workshopLoad === "medium" 
                ? "bg-amber-50 border-amber-200 text-amber-700" 
                : "bg-green-50 border-green-200 text-green-700"
          }`}>
            <Zap className="w-3.5 h-3.5" />
            Workshop: {workshopLoad === "high" ? "⚠ High Load" : workshopLoad === "medium" ? "Medium Load" : "Normal"}
          </div>
          <Link href="/admin/seller/pipeline" className="px-5 py-2.5 bg-[#2874f0] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" />
            Open Pipeline
          </Link>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalCount && criticalCount > 0 && (
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-2xl p-5 text-white shadow-xl shadow-red-500/20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)" }} />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg">🔴 {criticalCount} Critical Production Alert{criticalCount > 1 ? "s" : ""}</h3>
                <p className="text-red-100 text-sm font-medium">Orders breaching or close to breaching SLA. Immediate attention required.</p>
              </div>
            </div>
            <Link href="/admin/seller/pipeline?tab=critical" className="px-5 py-2.5 bg-white text-red-600 rounded-xl text-xs font-black hover:bg-red-50 transition-all flex items-center gap-2">
              View Critical <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Production Pipeline Flow */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {pipelineStages.map((stage, i) => (
          <Link key={stage.label} href={stage.href} className="group">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stage.bgLight} ${stage.textColor} group-hover:scale-110 transition-transform`}>
                  <stage.icon className="w-5 h-5" />
                </div>
                {i < 3 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                )}
              </div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stage.label}</h3>
              <p className="text-3xl font-black text-slate-900">{stage.count}</p>
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${stage.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Orders List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              SLA Watchlist
            </h3>
            <Link href="/admin/seller/pipeline?tab=critical" className="text-[10px] font-black uppercase tracking-widest text-[#2874f0] hover:underline">
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {criticalOrders && criticalOrders.length > 0 ? (
              criticalOrders.map((order: any) => {
                const sla = getSLAColor(order.target_ship_date);
                return (
                  <div key={order.id} className="p-4 hover:bg-slate-50/50 transition-all flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      sla.color === "red" ? "bg-red-500 animate-pulse" : 
                      sla.color === "amber" ? "bg-amber-500" : "bg-green-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          sla.color === "red" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {sla.label} {sla.hours !== null ? `• ${sla.hours}h` : ""}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium truncate">
                        {order.profile?.full_name || "Guest"} • {order.production_status}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-900">₹{Number(order.total_amount).toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">{order.target_ship_date ? new Date(order.target_ship_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "No date"}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-10 text-center">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                  <ClipboardCheck className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-sm font-bold text-slate-900">All Clear! 🎉</p>
                <p className="text-xs text-slate-400 mt-1">No critical SLA breaches detected</p>
              </div>
            )}
          </div>
        </div>

        {/* Inventory Health Widget */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Box className="w-4 h-4 text-[#2874f0]" />
              Inventory Health
            </h3>
            <Link href="/admin/seller/inventory" className="text-[10px] font-black uppercase tracking-widest text-[#2874f0] hover:underline">
              Manage
            </Link>
          </div>
          <div className="p-5 space-y-4">
            {/* Health Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                <p className="text-[10px] font-bold text-red-400 uppercase">Out of Stock</p>
                <p className="text-2xl font-black text-red-600">{outOfStockCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-[10px] font-bold text-amber-400 uppercase">Low Stock</p>
                <p className="text-2xl font-black text-amber-600">{lowStockCount}</p>
              </div>
            </div>
            {/* Low stock items list */}
            <div className="space-y-2">
              {lowStockProducts?.slice(0, 4).map((product: any) => (
                <div key={product.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                    {product.image_url ? (
                      <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-4 h-4 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{product.name}</p>
                    <p className={`text-[10px] font-bold ${product.stock_quantity === 0 ? "text-red-500" : "text-amber-500"}`}>
                      {product.stock_quantity === 0 ? "OUT OF STOCK" : `${product.stock_quantity} left`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Card + Recent Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <Wallet className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-sm">Revenue Summary</h3>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Delivered Value</p>
            <p className="text-4xl font-black text-blue-400 mb-6">₹{totalRevenue.toLocaleString()}</p>
            <Link href="/admin/seller/financials" className="flex items-center gap-2 text-xs font-bold text-blue-300 hover:text-white transition-colors">
              View Settlements <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#2874f0]" />
              Recent Operations
            </h3>
          </div>
          <div className="divide-y divide-slate-50">
            {recentOrders?.map((order: any) => (
              <div key={order.id} className="p-4 flex items-center gap-4 hover:bg-slate-50/50 transition-all">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                  order.production_status === "New" ? "bg-blue-500" :
                  order.production_status === "In-Production" ? "bg-orange-500" :
                  order.production_status === "QC" ? "bg-purple-500" :
                  order.production_status === "Ready" ? "bg-green-500" : "bg-slate-400"
                }`}>
                  {order.production_status?.[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{order.production_status || "Pending"}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">{order.profile?.full_name || "Guest"} • ₹{Number(order.total_amount).toLocaleString()}</p>
                </div>
                <p className="text-[10px] text-slate-400 font-medium shrink-0">
                  {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
