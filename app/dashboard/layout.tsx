import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { LayoutDashboard, ShoppingBag, MessageSquare, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="flex min-h-screen pt-16 bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:block fixed h-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-800">My Account</h2>
          <p className="text-sm text-slate-500 truncate">{user.email}</p>
        </div>
        <nav className="px-4 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-md transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            Overview
          </Link>
          <Link
            href="/dashboard/orders"
            className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-md transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            Orders
          </Link>
          <Link
            href="/dashboard/tickets"
            className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-md transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            Support Tickets
          </Link>
          <form action="/auth/signout" method="post" className="mt-8">
             <Button variant="ghost" className="w-full justify-start gap-3 px-4 text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="w-5 h-5" />
                Sign Out
             </Button>
          </form>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
