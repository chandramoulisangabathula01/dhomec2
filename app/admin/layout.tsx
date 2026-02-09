import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Package, ShoppingCart, MessageSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard"); // Redirect non-admins to user dashboard
  }

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 fixed h-full z-20">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold">Dhomec Admin</h1>
        </div>
        <nav className="p-4 space-y-2">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-2 hover:bg-slate-800 rounded-md transition-colors"
          >
            <LayoutDashboard className="w-5 h-5 text-slate-400" />
            Overview
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-3 px-4 py-2 hover:bg-slate-800 rounded-md transition-colors"
          >
            <Package className="w-5 h-5 text-slate-400" />
            Products
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 px-4 py-2 hover:bg-slate-800 rounded-md transition-colors"
          >
            <ShoppingCart className="w-5 h-5 text-slate-400" />
            Orders
          </Link>
          <Link
            href="/admin/tickets"
            className="flex items-center gap-3 px-4 py-2 hover:bg-slate-800 rounded-md transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-slate-400" />
            Tickets
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-2 hover:bg-slate-800 rounded-md transition-colors"
          >
            <Users className="w-5 h-5 text-slate-400" />
            Users
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800 absolute bottom-0 w-full">
            <form action="/auth/signout" method="post">
                <Button variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-slate-800">
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </Button>
            </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}
