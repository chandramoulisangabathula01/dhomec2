import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { LayoutDashboard, ShoppingBag, MessageSquare, LogOut, User as UserIcon, ArrowLeft, Home, Heart, RotateCcw } from "lucide-react";
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
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:block fixed h-full z-20">
        <div className="p-6 border-b">
          <Link href="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-6 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Store</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
              {user.email?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-slate-800 truncate">My Account</h2>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-sm font-medium">Overview</span>
          </Link>
          <Link
            href="/dashboard/orders"
            className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-sm font-medium">Orders</span>
          </Link>
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Personal Details</span>
          </Link>
          <Link
            href="/dashboard/wishlist"
            className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            <Heart className="w-5 h-5" />
            <span className="text-sm font-medium">Wishlist</span>
          </Link>
          <Link
            href="/dashboard/tickets"
            className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm font-medium">Support Tickets</span>
          </Link>

          <div className="pt-4 mt-4 border-t">
            <form action="/auth/signout" method="post">
               <button className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium text-left">
                  <LogOut className="w-5 h-5" />
                  Sign Out
               </button>
            </form>
          </div>
        </nav>
      </aside>


      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
