import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  LogOut, 
  Star, 
  Layers, 
  Home,
  ShieldCheck,
  RotateCcw,
  Mail,
  Settings
} from "lucide-react";
import AdminHeader from "./AdminHeader";

export default async function AdminLayout({
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
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const navGroups = [
    {
      label: "Analysis",
      items: [
        { href: "/admin", label: "Dashboard", icon: BarChart3 },
        { href: "/admin/analytics", label: "Sales Analytics", icon: BarChart3, badge: "PRO" },
      ]
    },
    {
      label: "Management",
      items: [
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/categories", label: "Categories", icon: Layers },
        { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
        { href: "/admin/returns", label: "Returns", icon: RotateCcw },
        { href: "/admin/users", label: "Users", icon: Users },
      ]
    },
    {
      label: "Engagement",
      items: [
        { href: "/admin/enquiries", label: "Enquiries", icon: Mail },
        { href: "/admin/reviews", label: "Reviews", icon: Star },
        { href: "/admin/tickets", label: "Support Tickets", icon: MessageSquare },
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0F172A] text-white flex-shrink-0 fixed h-full z-30 shadow-2xl">
        <div className="p-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">BizPortal</h1>
          </div>
          <Link href="/" className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest group">
            <Home className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />
            Back to Storefront
          </Link>
        </div>

        <nav className="p-6 space-y-8 h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-white/5 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3 text-slate-400 group-hover:text-white">
                      <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-sm font-black tracking-tighter">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/50 absolute bottom-0 w-full bg-[#0F172A]/80 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
              {profile?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
               <p className="text-xs font-bold truncate">{profile?.full_name || 'Administrator'}</p>
               <p className="text-[10px] text-slate-500 font-medium italic">Root Access</p>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <button className="w-full flex items-center gap-3 px-4 py-2 text-[10px] uppercase tracking-widest text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-black">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        {/* Top Header Bar */}
        <AdminHeader />
        
        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  );
}

