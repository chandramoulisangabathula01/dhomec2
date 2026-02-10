import { createClient } from "@/utils/supabase/server";
import { ShoppingBag, MessageSquare, ArrowRight, User as UserIcon, Heart } from "lucide-react";
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

  const cards = [
    {
      icon: ShoppingBag,
      label: "Your Orders",
      count: ordersCount || 0,
      href: "/dashboard/orders",
      linkText: "View all orders",
      color: "blue",
      bgClass: "bg-blue-50",
      textClass: "text-blue-600",
    },
    {
      icon: Heart,
      label: "Wishlist",
      count: wishlistCount || 0,
      href: "/dashboard/wishlist",
      linkText: "View wishlist",
      color: "rose",
      bgClass: "bg-rose-50",
      textClass: "text-rose-600",
    },
    {
      icon: MessageSquare,
      label: "Support Tickets",
      count: ticketsCount || 0,
      href: "/dashboard/tickets",
      linkText: "Open a ticket",
      color: "indigo",
      bgClass: "bg-indigo-50",
      textClass: "text-indigo-600",
    },
    {
      icon: UserIcon,
      label: "Profile Status",
      count: "Active",
      href: "/dashboard/profile",
      linkText: "Manage profile",
      color: "slate",
      bgClass: "bg-slate-50",
      textClass: "text-slate-600",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Welcome back, <span className="text-blue-600">{profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}</span>
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Here&apos;s what&apos;s happening with your account today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <card.icon className={`w-24 h-24 ${card.textClass}`} />
            </div>
            <div className={`w-12 h-12 rounded-2xl ${card.bgClass} flex items-center justify-center ${card.textClass} mb-6 font-bold`}>
              <card.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-500 text-sm tracking-wide uppercase">{card.label}</h3>
            <p className="text-4xl font-extrabold text-slate-900 mt-2">{card.count}</p>
            <Link href={card.href} className={`inline-flex items-center gap-2 text-sm font-bold ${card.textClass} mt-6 hover:underline group/link`}>
              {card.linkText}
              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-[24px] border border-slate-100 p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/products" className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 transition-colors group">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Browse Products</p>
              <p className="text-xs text-slate-500">Explore our catalog</p>
            </div>
          </Link>
          <Link href="/dashboard/tickets/new" className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 transition-colors group">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Get Support</p>
              <p className="text-xs text-slate-500">Create a support ticket</p>
            </div>
          </Link>
          <Link href="/contact" className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 transition-colors group">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Contact Us</p>
              <p className="text-xs text-slate-500">Reach our team</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
