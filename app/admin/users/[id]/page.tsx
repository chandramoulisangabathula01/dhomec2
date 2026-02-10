import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  ShoppingBag, 
  MessageSquare, 
  Calendar, 
  User as UserIcon, 
  Shield, 
  ExternalLink,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function UserDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch all user related data
  const [
    { data: profile },
    { data: orders },
    { data: tickets }
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase.from("orders").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    supabase.from("tickets").select("*").eq("user_id", id).order("created_at", { ascending: false })
  ]);

  if (!profile) {
    redirect("/admin/users");
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white shadow-sm border border-transparent hover:border-slate-200">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Activity</h1>
            <p className="text-slate-500 font-medium">Detailed overview for {profile.full_name || `@${profile.username}`}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
                profile.role === 'admin' 
                ? 'bg-purple-50 text-purple-700 border-purple-100' 
                : 'bg-blue-50 text-blue-700 border-blue-100'
            }`}>
                {profile.role?.toUpperCase()} ROLE
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Profile Info */}
        <div className="space-y-6">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4 border-4 border-white shadow-lg">
                        <UserIcon className="w-12 h-12" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">{profile.full_name || 'Guest User'}</h2>
                    <p className="text-sm text-slate-500">@{profile.username || 'no-username'}</p>
                </div>

                <div className="space-y-4 border-t pt-6">
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">User ID</label>
                        <p className="text-xs font-mono text-slate-600 break-all">{profile.id}</p>
                    </div>
                    {profile.website && (
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Website</label>
                            <a href={profile.website} target="_blank" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                {profile.website} <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    )}
                    <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Last Update</label>
                        <p className="text-sm text-slate-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'No updates yet'}
                        </p>

                    </div>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl">
                <h3 className="font-bold flex items-center gap-2 mb-4">
                    <History className="w-5 h-5 text-blue-400" />
                    Summary Stats
                </h3>
                <div className="space-y-6">
                    <div className="flex justify-between items-end">
                        <span className="text-slate-400 text-sm">Total Orders</span>
                        <span className="text-3xl font-extrabold">{orders?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <span className="text-slate-400 text-sm">Open Tickets</span>
                        <span className="text-3xl font-extrabold">{tickets?.filter(t => t.status === 'open').length || 0}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right: Activity Lists */}
        <div className="lg:col-span-2 space-y-8">
            {/* Orders Section */}
            <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100">
              <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  Recent Orders
                </h3>
              </div>
              <div className="divide-y">
                {orders && orders.length > 0 ? orders.map((order) => (
                  <div key={order.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">₹{order.total_amount}</p>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{order.status}</span>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center text-slate-400">
                    No orders found for this user.
                  </div>
                )}
              </div>
            </div>

            {/* Tickets Section */}
            <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100">
              <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-orange-600" />
                  Support History
                </h3>
              </div>
              <div className="divide-y">
                {tickets && tickets.length > 0 ? tickets.map((ticket) => (
                  <Link 
                    href={`/admin/tickets/${ticket.id}`} 
                    key={ticket.id}
                    className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between block"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{ticket.subject}</p>
                      <p className="text-xs text-slate-500">{new Date(ticket.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest
                            ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                            {ticket.status}
                        </span>
                        <span className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1">
                            Go to conversation <ArrowLeft className="w-3 h-3 rotate-180" />
                        </span>
                    </div>
                  </Link>
                )) : (
                  <div className="p-12 text-center text-slate-400">
                    No support tickets found.
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
