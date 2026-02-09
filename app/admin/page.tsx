import { createClient } from "@/utils/supabase/server";
import { Users, Package, ShoppingCart, MessageSquare } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createClient();
  
  // Fetch stats (parallel)
  const [
    { count: usersCount },
    { count: productsCount },
    { count: ordersCount },
    { count: ticketsCount }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
  ]);

  const stats = [
    { label: "Total Users", value: usersCount || 0, icon: Users, color: "bg-blue-500" },
    { label: "Total Products", value: productsCount || 0, icon: Package, color: "bg-purple-500" },
    { label: "Total Orders", value: ordersCount || 0, icon: ShoppingCart, color: "bg-green-500" },
    { label: "Open Tickets", value: ticketsCount || 0, icon: MessageSquare, color: "bg-orange-500" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                    <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
            </div>
            <h3 className="text-sm font-medium text-slate-500">{stat.label}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
