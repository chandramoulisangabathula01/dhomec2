import { createClient } from "@/utils/supabase/server";
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart3,
  Calendar,
  Filter,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // Fetch real data in parallel
  const [
    { data: orders },
    { count: usersCount },
    { count: categoryCount },
    { data: productsByCategory }
  ] = await Promise.all([
    supabase.from("orders").select("total_amount, created_at, status").order("created_at", { ascending: false }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("name, products(count)")
  ]);

  const totalRevenue = orders?.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0) || 0;
  const totalOrders = orders?.length || 0;
  
  // Real daily aggregation for the chart (last 12 data points)
  const chartData = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (11 - i));
    const dayStr = d.toISOString().split('T')[0];
    const dayRevenue = orders
      ?.filter(o => o.created_at.startsWith(dayStr))
      .reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0) || 0;
    return { day: d.getDate(), amount: dayRevenue, label: d.toLocaleDateString([], { month: 'short', day: 'numeric' }) };
  });

  const maxRevenue = Math.max(...chartData.map(d => d.amount), 1);

  const stats = [
    {
      label: "Gross Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      sub: "Total store volume",
      icon: CreditCard,
      color: "blue"
    },
    {
      label: "AOV",
      value: `₹${totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString() : 0}`,
      sub: "Average per order",
      icon: TrendingUp,
      color: "emerald"
    },
    {
      label: "Market Reach",
      value: (usersCount || 0).toLocaleString(),
      sub: "Active customers",
      icon: Users,
      color: "purple"
    },
    {
      label: "Taxonomy",
      value: (categoryCount || 0).toString(),
      sub: "Product categories",
      icon: BarChart3,
      color: "orange"
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight underline decoration-blue-500/20 decoration-8 underline-offset-8">Sales Intelligence</h1>
          <p className="text-slate-500 mt-4 font-medium italic">Advanced performance tracking and market data visualization</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
           <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Reporting Group: Global</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-200 transition-all">
            <div className={`w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</h3>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{stat.sub}</p>
            </div>
            <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`}>
               <stat.icon className="w-24 h-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Revenue Performance</h2>
              <p className="text-slate-400 text-sm mt-1">Daily gross volume tracking for the last 12 days</p>
            </div>
          </div>
          
          <div className="h-64 flex items-end gap-3 px-4">
             {chartData.map((d, i) => (
               <div key={i} className="flex-1 group relative">
                  <div 
                    className="w-full bg-slate-100 rounded-t-xl group-hover:bg-blue-600 transition-all duration-500 cursor-pointer relative"
                    style={{ height: `${(d.amount / maxRevenue) * 100}%`, minHeight: '4px' }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                      ₹{d.amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-4 text-[8px] font-black text-slate-300 transform -rotate-45 origin-left whitespace-nowrap">{d.label}</div>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden">
          <h2 className="text-2xl font-bold mb-8">Inventory Mix</h2>
          
          <div className="space-y-8 relative z-10 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
            {productsByCategory?.map((cat: any, i) => {
                const count = cat.products?.[0]?.count || 0;
                const totalProducts = productsByCategory.reduce((acc, c: any) => acc + (c.products?.[0]?.count || 0), 0);
                const percent = totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0;
                return (
                    <div key={i}>
                        <div className="flex justify-between text-[10px] font-black tracking-widest uppercase mb-2">
                            <span className="text-blue-400 italic font-medium truncate pr-4">{cat.name}</span>
                            <span>{percent}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000" style={{ width: `${percent}%` }} />
                        </div>
                    </div>
                );
            })}
          </div>

          <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10">
            <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Infrastructure Status</h4>
            <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <p className="text-xs font-medium text-slate-300">Live synchronization with store database active.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

