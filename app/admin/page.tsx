import { createClient } from "@/utils/supabase/server";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  TrendingUp, 
  ArrowUpRight, 
  Activity,
  Zap,
  Clock,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();
  
  // Fetch stats (parallel)
  const [
    { count: usersCount },
    { count: productsCount },
    { count: ordersCount },
    { count: ticketsCount },
    { data: recentOrders },
    { data: revenueData }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("orders").select("*, profiles(full_name)").order("created_at", { ascending: false }).limit(5),
    supabase.from("orders").select("total_amount")
  ]);

  const totalRevenue = revenueData?.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0) || 0;
  const avgOrderValue = ordersCount && ordersCount > 0 ? Math.round(totalRevenue / ordersCount) : 0;
  
  const stats = [
    { 
        label: "Market Reach", 
        value: usersCount || 0, 
        icon: Users, 
        trend: "Live", 
        sub: "Registered customer accounts",
        color: "text-blue-600",
        bg: "bg-blue-50" 
    },
    { 
        label: "Inventory Depth", 
        value: productsCount || 0, 
        icon: Package, 
        trend: "Active", 
        sub: "Products in your catalog",
        color: "text-purple-600", 
        bg: "bg-purple-50" 
    },
    { 
        label: "Sales Volume", 
        value: ordersCount || 0, 
        icon: ShoppingCart, 
        trend: "Total", 
        sub: "Total orders processed",
        color: "text-emerald-600", 
        bg: "bg-emerald-50" 
    },
    { 
        label: "Service Load", 
        value: ticketsCount || 0, 
        icon: MessageSquare, 
        trend: "Open", 
        sub: "Unresolved support tickets",
        color: "text-orange-600", 
        bg: "bg-orange-50" 
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-500" />
            Connected to Live Supabase Infrastructure.
          </p>
        </div>
        <div className="flex items-center gap-3">
            <Link href="/admin/orders">
                <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Order History
                </button>
            </Link>
            <Link href="/admin/analytics">
                <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2">
                    <Zap className="w-4 h-4 fill-current text-blue-200" />
                    Detailed Analytics
                </button>
            </Link>
        </div>
      </div>
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden relative">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-colors group-hover:bg-blue-600 group-hover:text-white`}>
                    <stat.icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full bg-slate-50 text-slate-400 capitalize`}>
                    {stat.trend}
                </div>
            </div>
            <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900">{stat.value}</span>
                </div>
                <p className="text-xs text-slate-400 mt-3 font-medium">{stat.sub}</p>
            </div>
            {/* Subtle background decoration */}
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon className="w-24 h-24" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analysis Card */}
        <div className="lg:col-span-2 bg-slate-900 rounded-[32px] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-2xl font-bold">Revenue Performance</h2>
                        <p className="text-slate-400 text-sm mt-1">Platform gross volume analysis</p>
                    </div>
                    <div className="text-right">
                        <p className="text-4xl font-black text-blue-400">₹{totalRevenue.toLocaleString()}</p>
                        <p className="text-xs font-bold text-white/50 uppercase tracking-tighter">Total Lifetime Revenue</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Average Order Value</p>
                            <p className="text-2xl font-black text-blue-400">₹{avgOrderValue.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Real-time AOV based on {ordersCount} orders</p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Operations</p>
                            <p className="text-2xl font-black text-emerald-400">{ordersCount}</p>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Successful order transactions</p>
                        </div>
                    </div>
                    
                    <div className="bg-blue-600/10 p-6 rounded-2xl border border-blue-500/20 mt-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Revenue Intelligence Active</h4>
                                <p className="text-xs text-blue-200">Automatically tracking financial streams from live orders.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>


        {/* Operational Activity Container */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Operational Activity
                </h3>
                <Link href="/admin/orders" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">
                    View Logs
                </Link>
            </div>

            <div className="space-y-6">
                {recentOrders && recentOrders.length > 0 ? recentOrders.map((order: any, i) => (
                    <div key={order.id} className="flex gap-4 group">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                <ShoppingCart className="w-5 h-5" />
                            </div>
                            {i !== recentOrders.length - 1 && <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-slate-100" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-xs font-bold text-slate-900 truncate">New Inbound Order</p>
                                <span className="text-[9px] font-bold text-slate-400">{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium">
                                {order.profiles?.full_name || 'Guest'} placed order #{order.id.slice(0, 6)}
                            </p>
                        </div>
                    </div>
                )) : (
                    <p className="text-center py-10 text-slate-400 text-sm font-medium">No recent operations detected.</p>
                )}
                
                <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-50 text-slate-500 text-xs font-bold hover:bg-slate-100 hover:text-slate-700 transition-all border border-dashed border-slate-200">
                    Load Historical Data
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

