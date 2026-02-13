"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MoreVertical,
  Calendar,
  RotateCw,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MoreHorizontal
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const StatCard = ({ title, value, percentage, data, direction }: any) => {
  const isPositive = direction === "up";
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
        <p className={`text-[10px] font-bold mt-2 flex items-center gap-1 ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? "↗" : "↘"} {percentage}
        </p>
      </div>
      <div className="w-16 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={20}
              outerRadius={30}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default function AdminDashboardClient({
  userProfile,
  stats,
  recentOrders,
  recentTickets,
  revenueChartData,
  topCategories
}: any) {
  
  const [mounted, setMounted] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real Data Colors
  const earningsData = stats.pieCharts?.earnings.map((s: any) => ({ ...s, value: s.value > 0 ? s.value : 0.1 })) || [{ value: 75, color: "#4C63FC" }, { value: 25, color: "#E5E7EB" }];
  const salesData = stats.pieCharts?.sales.map((s: any) => ({ ...s, value: s.value > 0 ? s.value : 0.1 })) || [{ value: 60, color: "#4C63FC" }, { value: 40, color: "#E5E7EB" }];
  const productsData = stats.pieCharts?.products.map((s: any) => ({ ...s, value: s.value > 0 ? s.value : 0.1 })) || [{ value: 85, color: "#4C63FC" }, { value: 15, color: "#E5E7EB" }];

  // Year Selection Logic
  const availableYears = Object.keys(revenueChartData || {}).map(Number).sort((a, b) => b - a);
  const barData = (revenueChartData && revenueChartData[selectedYear]) || [];

  if (!mounted) {
    return <div className="p-10 text-center text-slate-400">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Earnings" 
          value={`₹${(stats.revenue || 0).toLocaleString('en-IN')}`} 
          percentage={`${stats.growth?.revenue > 0 ? '+' : ''}${stats.growth?.revenue || 0}%`} 
          direction={stats.growth?.revenue >= 0 ? "up" : "down"} 
          data={earningsData} 
        />
        <StatCard 
          title="Total Sales" 
          value={stats.orders} 
          percentage={`${stats.growth?.orders > 0 ? '+' : ''}${stats.growth?.orders || 0}%`} 
          direction={stats.growth?.orders >= 0 ? "up" : "down"} 
          data={salesData} 
        />
        <StatCard 
          title="Product Catalog" 
          value={stats.products} 
          percentage="Active" 
          direction="up" 
          data={productsData} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900">Financial Performance</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-[#4C63FC]"></span> Revenue
                  <span className="w-2 h-2 rounded-full bg-slate-700 ml-2"></span> Pending
                </div>
                <div className="relative group">
                    <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="appearance-none pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/10 cursor-pointer"
                    >
                        {availableYears.map(yr => (
                            <option key={yr} value={yr}>{yr}</option>
                        ))}
                        {/* Always show current year if missing */}
                        {!availableYears.includes(new Date().getFullYear()) && (
                             <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                        )}
                    </select>
                    <MoreVertical className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} barSize={10} barGap={4}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                    dy={10}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="completed" fill="#4C63FC" radius={[10, 10, 10, 10]} />
                  <Bar dataKey="pending" fill="#374151" radius={[10, 10, 10, 10]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Latest Orders Table */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900">Latest Orders</h3>
              <div className="flex gap-2">
                <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors"><RotateCw className="w-4 h-4" /></button>
                <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors"><Filter className="w-4 h-4" /></button>
                <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors"><MoreVertical className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="text-xs text-slate-400 border-b border-slate-50">
                    <th className="pb-3 pl-4 font-bold w-10"><input type="checkbox" className="rounded border-slate-300 text-[#4C63FC] focus:ring-[#4C63FC]" /></th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Order ID</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Customer</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Date</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Amount</th>
                    <th className="pb-3 font-bold uppercase tracking-wider">Status</th>
                    <th className="pb-3 font-bold w-10"></th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentOrders.length > 0 ? recentOrders.map((order: any) => (
                    <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                      <td className="py-4 pl-4"><input type="checkbox" className="rounded border-slate-300 text-[#4C63FC] focus:ring-[#4C63FC]" /></td>
                      <td className="py-4 font-bold text-slate-600">#{order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0 flex items-center justify-center text-xs font-bold text-slate-500">
                             {order.profiles?.full_name?.charAt(0) || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 truncate max-w-[120px]">{order.profiles?.full_name || "Guest User"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-slate-500 font-medium text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="py-4 font-black text-slate-900 border-dashed border-b border-slate-200 w-fit">₹{order.total_amount?.toLocaleString('en-IN')}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                          order.status === "DELIVERED" ? "bg-green-50 text-green-600" : 
                          order.status === "CANCELLED" ? "bg-red-50 text-red-600" : 
                          "bg-slate-100 text-slate-600"
                        }`}>
                           {order.status === "DELIVERED" ? <CheckCircle2 className="w-3 h-3" /> : 
                            order.status === "CANCELLED" ? <XCircle className="w-3 h-3" /> : 
                            <Clock className="w-3 h-3" /> }
                           {order.status}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-4">
                        <Link href={`/admin/orders/${order.id}`}>
                            <button className="p-1 text-slate-300 hover:text-slate-600 transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                        </Link>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400 text-sm">No recent orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="space-y-6">
          {/* Balance Card - Real Data */}
          <div className="bg-[#4C63FC] p-6 rounded-2xl shadow-xl shadow-blue-500/30 text-white relative overflow-hidden group">
            <div className="relative z-10 transition-transform group-hover:scale-[1.02] duration-300">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-xs font-medium text-blue-100 opacity-80 uppercase tracking-wider">Net Balance</p>
                  <p className="text-3xl font-black mt-2 tracking-tight">₹{(stats.revenue || 0).toLocaleString('en-IN')}</p>
                </div>
                <button className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm"><MoreVertical className="w-4 h-4" /></button>
              </div>
              <div className="flex items-end justify-between mt-8 pt-4 border-t border-white/10">
                <div>
                  <p className="text-sm font-bold opacity-90">{userProfile?.full_name || "Admin User"}</p>
                  <p className="text-[10px] opacity-60 uppercase tracking-widest mt-0.5">{userProfile?.role || "Administrator"}</p>
                </div>
                <p className="text-sm font-mono font-medium opacity-75 tracking-widest">**** 8842</p>
              </div>
            </div>
            {/* Decos */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors duration-500"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/15 transition-colors duration-500"></div>
          </div>

          {/* Top Categories (Replacing Popular Search) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-5 text-sm uppercase tracking-wider">Top Categories</h3>
            <div className="space-y-5">
              {topCategories.length > 0 ? topCategories.map((item: any) => (
                <div key={item.name} className="group">
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-700 capitalize group-hover:text-slate-900 transition-colors">{item.name}</span>
                    <span className="text-slate-400 font-medium text-[10px]">{item.count} items</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    {/* Dynamic width based on percentage */}
                    <div className={`h-full bg-lime-400 rounded-full transition-all duration-1000 ease-out w-0 group-hover:brightness-110`} style={{ width: `${mounted ? (item.percent > 10 ? item.percent : 10) : 0}%` }}></div>
                  </div>
                </div>
              )) : (
                 <p className="text-xs text-slate-400">No category data available.</p>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-5 text-sm uppercase tracking-wider">Store Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
               <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Conversion</p>
                  <p className="text-xl font-black text-slate-900">3.2%</p>
               </div>
               <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Users</p>
                  <p className="text-xl font-black text-green-600 flex items-center justify-center gap-1">
                     <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                     {Math.floor(Math.random() * 10) + 1}
                  </p>
               </div>
            </div>
          </div>

          {/* Recent Tickets (Replacing Recent Messages) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Recent Tickets</h3>
                <Link href="/admin/tickets" className="text-[10px] font-bold text-[#4C63FC] hover:underline">View All</Link>
             </div>
             <div className="space-y-4">
                {recentTickets.length > 0 ? recentTickets.map((ticket: any) => (
                   <Link href={`/admin/tickets/${ticket.id}`} key={ticket.id} className="flex gap-3 items-start group hover:bg-slate-50/50 p-2 rounded-xl transition-colors -mx-2 cursor-pointer">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-xs font-black text-slate-500 shrink-0">
                         {ticket.profiles?.full_name?.substring(0,2).toUpperCase() || "CN"}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-center mb-0.5">
                            <p className="text-xs font-bold text-slate-900 truncate">{ticket.profiles?.full_name || "Customer"}</p>
                            <p className="text-[9px] text-slate-400 font-medium">{new Date(ticket.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                         </div>
                         <div className="flex justify-between items-start gap-2">
                             <p className="text-[10px] text-slate-500 truncate">{ticket.subject || "No Subject"}</p>
                             <span className={`w-fit px-1.5 h-4 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0 ${
                                 ticket.status === 'open' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                             }`}>
                                {ticket.status}
                             </span>
                         </div>
                      </div>
                   </Link>
                )) : (
                    <p className="text-xs text-slate-400 text-center py-4">No recent tickets.</p>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
