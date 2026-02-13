"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Wallet,
  IndianRupee,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  RefreshCcw,
  Download,
  CreditCard,
  BadgePercent,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";

type OrderSettlement = {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  razorpay_payment_id: string | null;
  production_status: string;
  profile?: { full_name: string } | null;
};

// Dhomec commission and Razorpay fee constants
const RAZORPAY_FEE_PERCENT = 2.36; // 2% + GST on fee
const DHOMEC_COMMISSION_PERCENT = 5;
const PAYOUT_DELAY_DAYS = 7;

export default function FinancialsPage() {
  const [orders, setOrders] = useState<OrderSettlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | "settled" | "pending">("all");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("orders")
      .select("id, created_at, total_amount, status, razorpay_payment_id, production_status, profile:profiles(full_name)")
      .not("status", "eq", "CANCELLED")
      .not("status", "eq", "PENDING_PAYMENT")
      .order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) console.error("Financials fetch error:", error);
    setOrders((data as unknown as OrderSettlement[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const calculateSettlement = (amount: number) => {
    const sale = Number(amount) || 0;
    const razorpayFee = Math.round(sale * RAZORPAY_FEE_PERCENT) / 100;
    const dhomecCommission = Math.round(sale * DHOMEC_COMMISSION_PERCENT) / 100;
    const netPayout = sale - razorpayFee - dhomecCommission;
    return { sale, razorpayFee, dhomecCommission, netPayout };
  };

  const getPayoutDate = (createdAt: string, status: string) => {
    if (status !== "DELIVERED") return null;
    const date = new Date(createdAt);
    date.setDate(date.getDate() + PAYOUT_DELAY_DAYS);
    return date;
  };

  const isSettled = (order: OrderSettlement) => {
    if (order.status !== "DELIVERED") return false;
    const payoutDate = getPayoutDate(order.created_at, order.status);
    return payoutDate ? payoutDate <= new Date() : false;
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === "settled") return isSettled(o);
    if (filterStatus === "pending") return !isSettled(o);
    return true;
  });

  // Summary calcs
  const totalSales = orders.reduce((a, o) => a + (Number(o.total_amount) || 0), 0);
  const totalRazorpayFee = orders.reduce((a, o) => a + calculateSettlement(o.total_amount).razorpayFee, 0);
  const totalCommission = orders.reduce((a, o) => a + calculateSettlement(o.total_amount).dhomecCommission, 0);
  const totalPayout = orders.reduce((a, o) => a + calculateSettlement(o.total_amount).netPayout, 0);
  const pendingPayout = orders.filter((o) => !isSettled(o)).reduce((a, o) => a + calculateSettlement(o.total_amount).netPayout, 0);
  const settledPayout = orders.filter((o) => isSettled(o)).reduce((a, o) => a + calculateSettlement(o.total_amount).netPayout, 0);

  // Next payout date: find the earliest order that hasn't settled yet
  const pendingOrders = orders.filter((o) => !isSettled(o) && o.status === "DELIVERED");
  const nextPayoutDate = pendingOrders.length > 0
    ? pendingOrders.reduce((earliest, o) => {
        const pd = getPayoutDate(o.created_at, o.status);
        return pd && (!earliest || pd < earliest) ? pd : earliest;
      }, null as Date | null)
    : null;

  const downloadCSV = () => {
    const headers = ["Order ID", "Customer", "Sale Amount", "Razorpay Fee", "Dhomec Commission", "Net Payout", "Status", "Payout Date"];
    const rows = filteredOrders.map((o) => {
      const s = calculateSettlement(o.total_amount);
      const pd = getPayoutDate(o.created_at, o.status);
      return [
        o.id.slice(0, 8),
        o.profile?.full_name || "Guest",
        s.sale.toFixed(2),
        s.razorpayFee.toFixed(2),
        s.dhomecCommission.toFixed(2),
        s.netPayout.toFixed(2),
        isSettled(o) ? "Settled" : "Pending",
        pd ? pd.toLocaleDateString() : "N/A",
      ];
    });

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `settlements_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payment Settlement</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Reconciliation & payout tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={fetchOrders} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
            <RefreshCcw className={`w-5 h-5 text-slate-400 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg"><CreditCard className="w-4 h-4 text-blue-500" /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase">Gross Sales</span>
          </div>
          <p className="text-2xl font-black text-slate-900">₹{totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-red-50 rounded-lg"><BadgePercent className="w-4 h-4 text-red-500" /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase">Total Deductions</span>
          </div>
          <p className="text-2xl font-black text-red-600">-₹{(totalRazorpayFee + totalCommission).toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 mt-1">Razorpay: ₹{totalRazorpayFee.toLocaleString()} • Dhomec: ₹{totalCommission.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><Wallet className="w-4 h-4" /></div>
            <span className="text-[10px] font-black text-green-100 uppercase">Net Payout</span>
          </div>
          <p className="text-2xl font-black">₹{totalPayout.toLocaleString()}</p>
          <p className="text-[10px] text-green-200 mt-1">Settled: ₹{settledPayout.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-amber-50 rounded-lg"><CalendarCheck className="w-4 h-4 text-amber-500" /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase">Next Payout</span>
          </div>
          <p className="text-lg font-black text-slate-900">
            {nextPayoutDate ? nextPayoutDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "No pending"}
          </p>
          <p className="text-[10px] text-amber-600 font-bold mt-1">Pending: ₹{pendingPayout.toLocaleString()}</p>
        </div>
      </div>

      {/* Payout Cycle Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-4">
        <div className="p-2 bg-[#2874f0] rounded-lg text-white"><IndianRupee className="w-4 h-4" /></div>
        <div>
          <p className="text-xs font-bold text-[#2874f0]">Settlement Formula</p>
          <p className="text-[11px] text-slate-600">Sale Price − Razorpay Fee ({RAZORPAY_FEE_PERCENT}%) − Dhomec Commission ({DHOMEC_COMMISSION_PERCENT}%) = Your Payout • Payout cycle: Delivery + {PAYOUT_DELAY_DAYS} days</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "pending", "settled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all capitalize ${
              filterStatus === f ? "bg-[#2874f0] text-white border-[#2874f0]" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f === "all" ? `All (${orders.length})` : f === "pending" ? `Pending (${orders.filter((o) => !isSettled(o)).length})` : `Settled (${orders.filter((o) => isSettled(o)).length})`}
          </button>
        ))}
      </div>

      {/* Settlement Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center">
            <RefreshCcw className="w-8 h-8 text-slate-300 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400">Loading settlements...</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Order & Customer</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Sale Price</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Razorpay Fee</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Commission</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Net Payout</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Payout Date</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order) => {
                const settlement = calculateSettlement(order.total_amount);
                const payoutDate = getPayoutDate(order.created_at, order.status);
                const settled = isSettled(order);
                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="p-4">
                      <p className="text-xs font-bold text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-[10px] text-slate-500">{order.profile?.full_name || "Guest"}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-bold text-slate-900">₹{settlement.sale.toLocaleString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-semibold text-red-500">-₹{settlement.razorpayFee.toLocaleString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-semibold text-red-500">-₹{settlement.dhomecCommission.toLocaleString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-black text-green-600">₹{settlement.netPayout.toLocaleString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-xs text-slate-600">
                        {payoutDate ? payoutDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                        settled ? "bg-green-100 text-green-700" : order.status === "DELIVERED" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {settled ? (
                          <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Settled</span>
                        ) : order.status === "DELIVERED" ? (
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
                        ) : (
                          order.status
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <Wallet className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400">No settlements found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
