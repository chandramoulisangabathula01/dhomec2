import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { LayoutDashboard, ShoppingBag, MessageSquare, LogOut, User as UserIcon, ArrowLeft, Heart, ChevronRight, Shield } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
    { name: "Personal Details", href: "/dashboard/profile", icon: UserIcon },
    { name: "Wishlist", href: "/dashboard/wishlist", icon: Heart },
    { name: "Support Tickets", href: "/dashboard/tickets", icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      {/* Sidebar - Enhanced */}
      <aside className="w-[280px] bg-white border-r border-slate-100 hidden md:flex flex-col fixed h-full z-20">
        {/* Top section */}
        <div className="p-6 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors mb-6 group text-sm">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Store</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold uppercase shadow-lg shadow-blue-500/15">
              {profile?.full_name?.[0] || user.email?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-slate-900 truncate">{profile?.full_name || 'My Account'}</h2>
              <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3">Menu</p>
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all group"
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span className="text-sm font-medium flex-1">{item.name}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
          
          {profile?.role === 'admin' && (
            <>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3">Admin</p>
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group"
                >
                  <Shield className="w-[18px] h-[18px]" />
                  <span className="text-sm font-medium flex-1">Admin Panel</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </>
          )}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-slate-100">
          <form action="/auth/signout" method="post">
             <button className="flex items-center gap-3 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-all text-sm font-medium text-left group">
                <LogOut className="w-[18px] h-[18px]" />
                <span>Sign Out</span>
             </button>
          </form>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-30 px-2 py-2">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.name.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-[280px] p-6 md:p-8 pb-24 md:pb-8">
        {children}
      </main>
    </div>
  );
}
