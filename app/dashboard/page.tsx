import { createClient } from "@/utils/supabase/server";
import { ShoppingBag, MessageSquare, ArrowRight, User as UserIcon, Heart, Package, Clock, TrendingUp, Star, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { count: ordersCount } = await supabase
    .from("orders")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", user.id);

  const { count: ticketsCount } = await supabase
    .from("tickets")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", user.id);

  const { count: wishlistCount } = await supabase
    .from("wishlist")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", user.id);

  // Fetch recent orders for activity timeline
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, status, total_amount, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const cards = [
    {
      icon: ShoppingBag,
      label: "Your Orders",
      count: ordersCount || 0,
      href: "/dashboard/orders",
      linkText: "View all orders",
      gradient: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
      borderHover: "hover:border-blue-200",
    },
    {
      icon: Heart,
      label: "Wishlist",
      count: wishlistCount || 0,
      href: "/dashboard/wishlist",
      linkText: "View wishlist",
      gradient: "from-rose-500 to-rose-600",
      bgLight: "bg-rose-50",
      textColor: "text-rose-600",
      borderHover: "hover:border-rose-200",
    },
    {
      icon: MessageSquare,
      label: "Support Tickets",
      count: ticketsCount || 0,
      href: "/dashboard/tickets",
      linkText: "Open a ticket",
      gradient: "from-indigo-500 to-indigo-600",
      bgLight: "bg-indigo-50",
      textColor: "text-indigo-600",
      borderHover: "hover:border-indigo-200",
    },
    {
      icon: UserIcon,
      label: "Profile Status",
      count: "Active",
      href: "/dashboard/profile",
      linkText: "Manage profile",
      gradient: "from-emerald-500 to-emerald-600",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
      borderHover: "hover:border-emerald-200",
    },
  ];

  const statusColors: Record<string, string> = {
    'placed': 'bg-blue-100 text-blue-700',
    'confirmed': 'bg-indigo-100 text-indigo-700',
    'packed': 'bg-amber-100 text-amber-700',
    'shipped': 'bg-purple-100 text-purple-700',
    'delivered': 'bg-emerald-100 text-emerald-700',
    'cancelled': 'bg-red-100 text-red-700',
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header - Enhanced */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-10">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500/10 rounded-full blur-[60px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl uppercase shadow-lg shadow-blue-500/20">
                {profile?.full_name?.[0] || user?.email?.[0] || 'U'}
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">{getGreeting()},</p>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}
                </h1>
              </div>
            </div>
            <p className="text-slate-400 text-sm">Here&apos;s what&apos;s happening with your account today.</p>
          </div>
          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-all border border-white/10 hover:border-white/20 backdrop-blur-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            Browse Products
          </Link>
        </div>
      </div>

      {/* Stats Cards - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`bg-white p-6 rounded-2xl border border-slate-100 ${card.borderHover} hover:shadow-lg transition-all duration-300 group relative overflow-hidden block`}
          >
            {/* Gradient top accent */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl`} />
            
            {/* Background icon */}
            <div className="absolute top-0 right-0 p-3 opacity-[0.04] group-hover:scale-110 transition-transform">
              <card.icon className={`w-24 h-24 ${card.textColor}`} />
            </div>
            
            <div className={`w-11 h-11 rounded-xl ${card.bgLight} flex items-center justify-center ${card.textColor} mb-5`}>
              <card.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-400 text-xs tracking-wide uppercase mb-1">{card.label}</h3>
            <p className="text-3xl font-extrabold text-slate-900 mb-4 tabular-nums">{card.count}</p>
            <div className={`inline-flex items-center gap-1.5 text-sm font-semibold ${card.textColor} group-hover:gap-2.5 transition-all`}>
              {card.linkText}
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders - Enhanced */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
                <p className="text-xs text-slate-400">Your latest orders</p>
              </div>
            </div>
            <Link href="/dashboard/orders" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="divide-y divide-slate-50">
            {recentOrders && recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <Link 
                  key={order.id} 
                  href={`/dashboard/orders`}
                  className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusColors[order.status?.toLowerCase()] || 'bg-slate-100 text-slate-600'}`}>
                      {order.status}
                    </span>
                    {order.total_amount && (
                      <span className="text-sm font-bold text-slate-900 tabular-nums">₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-400 font-medium mb-1">No orders yet</p>
                <p className="text-xs text-slate-400 mb-4">Start exploring our product catalog</p>
                <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
                  Browse Products <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions - Enhanced */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-3 p-6 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
              <p className="text-xs text-slate-400">Frequent tasks</p>
            </div>
          </div>
          
          <div className="p-4 space-y-2">
            <Link href="/products" className="flex items-center gap-3 p-4 rounded-xl hover:bg-blue-50 transition-all group">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">Browse Products</p>
                <p className="text-[11px] text-slate-400">Explore our catalog</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
            </Link>
            
            <Link href="/dashboard/tickets/new" className="flex items-center gap-3 p-4 rounded-xl hover:bg-indigo-50 transition-all group">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">Get Support</p>
                <p className="text-[11px] text-slate-400">Create a support ticket</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
            </Link>
            
            <Link href="/dashboard/wishlist" className="flex items-center gap-3 p-4 rounded-xl hover:bg-rose-50 transition-all group">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">My Wishlist</p>
                <p className="text-[11px] text-slate-400">Saved items</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-600 transition-colors" />
            </Link>
            
            <Link href="/contact" className="flex items-center gap-3 p-4 rounded-xl hover:bg-emerald-50 transition-all group">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">Contact Us</p>
                <p className="text-[11px] text-slate-400">Reach our team</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
