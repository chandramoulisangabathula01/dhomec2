import { createClient } from "@/utils/supabase/server";
import { ShoppingBag, MessageSquare, ArrowRight, User as UserIcon } from "lucide-react";
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Welcome back, <span className="text-blue-600">{profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}</span>
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Here's what's happening with your account today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-24 h-24 text-blue-600" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 font-bold">
                <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-500 text-sm tracking-wide uppercase">Your Orders</h3>
            <p className="text-4xl font-extrabold text-slate-900 mt-2">{ordersCount || 0}</p>
            <Link href="/dashboard/orders" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 mt-6 hover:underline group/link">
                View all orders
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
        </div>

        <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-24 h-24 text-indigo-600" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 font-bold">
                <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-500 text-sm tracking-wide uppercase">Support Tickets</h3>
            <p className="text-4xl font-extrabold text-slate-900 mt-2">0</p>
            <Link href="/dashboard/tickets" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 mt-6 hover:underline group/link">
                Open a ticket
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
        </div>

        <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <UserIcon className="w-24 h-24 text-slate-600" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 mb-6 font-bold">
                <UserIcon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-500 text-sm tracking-wide uppercase">Profile Status</h3>
            <p className="text-4xl font-extrabold text-slate-900 mt-2">Active</p>
            <Link href="/dashboard/profile" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 mt-6 hover:underline group/link">
                Manage profile
                <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
        </div>
      </div>
    </div>
  );
}

