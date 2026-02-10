import { createClient } from "@/utils/supabase/server";
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Eye, 
  MoreHorizontal,
  Calendar,
  CreditCard,
  User as UserIcon
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  
  const { data: orders } = await supabase
    .from("orders")
    .select("*, profile:profiles(email, full_name)")
    .order("created_at", { ascending: false });

  const totalRevenue = orders?.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0) || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Stats Banner */}
      <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Stream</h1>
             <p className="text-slate-500 mt-1 font-medium italic">Monitoring {orders?.length || 0} transaction sequences</p>
          </div>
          <div className="bg-slate-900 p-8 rounded-[32px] text-white flex items-center gap-8 shadow-xl relative overflow-hidden shrink-0">
             <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Gross Revenue</p>
                <h2 className="text-3xl font-black text-blue-400">₹{totalRevenue.toLocaleString()}</h2>
             </div>
             <div className="h-10 w-px bg-white/10 relative z-10" />
             <div className="relative z-10 text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-sm font-bold uppercase tracking-tight">Active Ops</span>
                </div>
             </div>
             <CreditCard className="absolute -right-4 -bottom-4 w-32 h-32 opacity-5" />
          </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                  placeholder="Search by transaction ID or user..." 
                  className="w-full bg-white border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium border"
              />
          </div>
          <Button variant="ghost" className="rounded-2xl border border-slate-200 bg-white shadow-sm font-bold text-xs gap-2 h-12 px-6">
              <Filter className="w-4 h-4" />
              Intelligence Filter
          </Button>
      </div>

      {/* Orders Table-List */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Sequence & Requester</th>
              <th className="p-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Financials</th>
              <th className="p-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Timestamp</th>
              <th className="p-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Status</th>
              <th className="p-6 font-black text-slate-500 uppercase tracking-widest text-[10px] text-right">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders?.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/80 transition-all group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                        {order.profile?.full_name?.charAt(0) || <UserIcon className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-[10px] text-slate-500 font-medium truncate">{order.profile?.full_name || 'Guest User'}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <div className="font-black text-slate-900">₹ {order.total_amount?.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400 font-medium">B2B Sequence</div>
                </td>
                <td className="p-6">
                    <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="font-medium text-xs truncate">
                            {new Date(order.created_at).toLocaleDateString([], {month: 'short', day: 'numeric', year: 'numeric'})}
                        </span>
                    </div>
                </td>
                <td className="p-6">
                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest
                        ${order.status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                        {order.status}
                    </span>
                </td>
                <td className="p-6 text-right">
                    <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-blue-600 hover:text-white transition-all group-hover:scale-110">
                            <Eye className="w-4 h-4" />
                        </Button>
                    </Link>
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                        <ShoppingCart className="w-16 h-16 opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-widest">No transaction sequences detected</p>
                    </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

