import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, profile:profiles(email, full_name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-medium text-slate-500">Order ID</th>
              <th className="p-4 font-medium text-slate-500">Customer</th>
              <th className="p-4 font-medium text-slate-500">Total</th>
              <th className="p-4 font-medium text-slate-500">Status</th>
              <th className="p-4 font-medium text-slate-500">Date</th>
              <th className="p-4 font-medium text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders?.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="p-4 font-mono text-xs">{order.id.slice(0, 8)}</td>
                <td className="p-4">
                  <div className="font-medium text-slate-900">{order.profile?.full_name || 'Unknown'}</div>
                  <div className="text-xs text-slate-500">{order.profile?.email}</div>
                </td>
                <td className="p-4">₹ {order.total_amount?.toLocaleString()}</td>
                <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize 
                        ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {order.status}
                    </span>
                </td>
                <td className="p-4 text-slate-500">{new Date(order.created_at).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                    <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4 text-slate-500" />
                        </Button>
                    </Link>
                </td>
              </tr>
            ))}
            {orders?.length === 0 && (
                <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No orders found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
