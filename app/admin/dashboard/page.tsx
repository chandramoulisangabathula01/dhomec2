"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Package, Activity, MessageSquare, ShoppingCart, IndianRupee, Star, RotateCcw, Mail, TrendingUp } from "lucide-react";
import Link from "next/link";

type ActivityItem = {
    id: string;
    type: 'enquiry' | 'product' | 'order' | 'ticket';
    title: string;
    description: string;
    timestamp: string;
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    enquiries: 0, products: 0, orders: 0, users: 0,
    tickets: 0, revenue: 0, returns: 0, reviews: 0,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initDashboard = async () => {
      try {
        const [
          { count: enquiryCount },
          { count: productCount },
          { count: orderCount },
          { count: userCount },
          { count: ticketCount },
          { count: returnCount },
          { count: reviewCount },
          { data: ordersData },
        ] = await Promise.all([
          supabase.from('enquiries').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('tickets').select('*', { count: 'exact', head: true }),
          supabase.from('returns').select('*', { count: 'exact', head: true }),
          supabase.from('reviews').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('total_amount').eq('status', 'paid'),
        ]);

        const totalRevenue = (ordersData || []).reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

        setStats({
          enquiries: enquiryCount || 0,
          products: productCount || 0,
          orders: orderCount || 0,
          users: userCount || 0,
          tickets: ticketCount || 0,
          revenue: totalRevenue,
          returns: returnCount || 0,
          reviews: reviewCount || 0,
        });

        // Recent activity
        const { data: recentEnquiries } = await supabase.from('enquiries').select('id, name, created_at').order('created_at', { ascending: false }).limit(3);
        const { data: recentProducts } = await supabase.from('products').select('id, name, created_at').order('created_at', { ascending: false }).limit(3);
        const { data: recentOrders } = await supabase.from('orders').select('id, total_amount, created_at').order('created_at', { ascending: false }).limit(3);
        const { data: recentTickets } = await supabase.from('tickets').select('id, subject, created_at').order('created_at', { ascending: false }).limit(3);

        const allActivities: ActivityItem[] = [
          ...(recentEnquiries || []).map((e: any) => ({
            id: e.id, type: 'enquiry' as const, title: 'New Enquiry', description: `From ${e.name}`, timestamp: e.created_at
          })),
          ...(recentProducts || []).map((p: any) => ({
            id: p.id, type: 'product' as const, title: 'Product Added', description: p.name, timestamp: p.created_at
          })),
          ...(recentOrders || []).map((o: any) => ({
            id: o.id, type: 'order' as const, title: 'New Order', description: `₹${Number(o.total_amount || 0).toLocaleString('en-IN')}`, timestamp: o.created_at
          })),
          ...(recentTickets || []).map((t: any) => ({
            id: t.id, type: 'ticket' as const, title: 'Support Ticket', description: t.subject, timestamp: t.created_at
          })),
        ]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 8);
        setActivities(allActivities);
      } catch (err) {
        console.error("Dashboard init error:", err);
      }
      setLoading(false);
    };
    initDashboard();
  }, []);

  const statCards = [
    { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: "emerald", href: "/admin/orders" },
    { label: "Total Orders", value: stats.orders, icon: ShoppingCart, color: "blue", href: "/admin/orders" },
    { label: "Active Products", value: stats.products, icon: Package, color: "indigo", href: "/admin/products" },
    { label: "Enquiries", value: stats.enquiries, icon: Mail, color: "amber", href: "/admin/enquiries" },
    { label: "Registered Users", value: stats.users, icon: Users, color: "purple", href: "/admin/users" },
    { label: "Support Tickets", value: stats.tickets, icon: MessageSquare, color: "rose", href: "/admin/tickets" },
    { label: "Returns", value: stats.returns, icon: RotateCcw, color: "orange", href: "/admin/returns" },
    { label: "Reviews", value: stats.reviews, icon: Star, color: "yellow", href: "/admin/reviews" },
  ];

  const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", iconBg: "bg-emerald-100" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", iconBg: "bg-blue-100" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", iconBg: "bg-indigo-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", iconBg: "bg-amber-100" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", iconBg: "bg-purple-100" },
    rose: { bg: "bg-rose-50", text: "text-rose-600", iconBg: "bg-rose-100" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", iconBg: "bg-orange-100" },
    yellow: { bg: "bg-yellow-50", text: "text-yellow-600", iconBg: "bg-yellow-100" },
  };

  const activityIcons: Record<string, typeof MessageSquare> = {
    enquiry: Mail,
    product: Package,
    order: ShoppingCart,
    ticket: MessageSquare,
  };

  const activityColors: Record<string, string> = {
    enquiry: "bg-amber-50 text-amber-600",
    product: "bg-indigo-50 text-indigo-600",
    order: "bg-emerald-50 text-emerald-600",
    ticket: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1 text-sm">Overview of your business activity</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            System Online
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const colors = colorMap[card.color];
          return (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.label}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors.iconBg} ${colors.text} group-hover:scale-110 transition-transform`}>
                  <card.icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">
                {loading ? (
                  <span className="inline-block w-16 h-7 bg-slate-100 rounded animate-pulse" />
                ) : (
                  card.value
                )}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Activity & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3 pb-4 border-b border-slate-50">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-slate-100 rounded" />
                    <div className="h-3 w-48 bg-slate-50 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-1">
              {activities.map((item) => {
                const Icon = activityIcons[item.type] || Activity;
                return (
                  <div key={`${item.type}-${item.id}`} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${activityColors[item.type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500 truncate">{item.description}</p>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                      {new Date(item.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
              <TrendingUp className="w-8 h-8 mb-2 text-slate-200" />
              No recent activity
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: "Add New Product", href: "/admin/products/new", icon: Package, color: "bg-blue-50 text-blue-600" },
              { label: "View Orders", href: "/admin/orders", icon: ShoppingCart, color: "bg-emerald-50 text-emerald-600" },
              { label: "Manage Enquiries", href: "/admin/enquiries", icon: Mail, color: "bg-amber-50 text-amber-600" },
              { label: "Support Tickets", href: "/admin/tickets", icon: MessageSquare, color: "bg-rose-50 text-rose-600" },
              { label: "Manage Returns", href: "/admin/returns", icon: RotateCcw, color: "bg-orange-50 text-orange-600" },
              { label: "User Management", href: "/admin/users", icon: Users, color: "bg-purple-50 text-purple-600" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
