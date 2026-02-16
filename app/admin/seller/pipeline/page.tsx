"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Factory,
  Package,
  ClipboardCheck,
  Truck,
  AlertTriangle,
  Timer,
  Play,
  Pause,
  CheckCircle2,
  Camera,
  ArrowRight,
  Search,
  RefreshCcw,
  ChevronDown,
  FileText,
  X,
  Upload,
  Printer,
} from "lucide-react";

type Order = {
  id: string;
  created_at: string;
  total_amount: number;
  production_status: string;
  start_date: string | null;
  target_ship_date: string | null;
  materials_available: boolean;
  production_notes: string | null;
  qc_photos: string[] | null;
  workshop_priority: string;
  profile?: { full_name: string } | null;
  items?: { quantity: number; product?: { name: string } }[];
};

const TABS = [
  { key: "new", label: "New Work", icon: Package, color: "blue" },
  { key: "production", label: "In Production", icon: Factory, color: "orange" },
  { key: "qc", label: "Quality Check", icon: ClipboardCheck, color: "purple" },
  { key: "ready", label: "Ready to Pack", icon: Truck, color: "green" },
  { key: "critical", label: "Critical SLA", icon: AlertTriangle, color: "red" },
];

const STATUS_MAP: Record<string, string> = {
  new: "New",
  production: "In-Production",
  qc: "QC",
  ready: "Ready",
};

function getSLAInfo(targetDate: string | null, startDate: string | null) {
  if (!targetDate) return { color: "slate", label: "No SLA", hours: 0, percent: 0 };
  const now = Date.now();
  const target = new Date(targetDate).getTime();
  const start = startDate ? new Date(startDate).getTime() : now;
  const hoursRemaining = (target - now) / (1000 * 60 * 60);
  const totalDuration = target - start;
  const elapsed = now - start;
  const percent = totalDuration > 0 ? Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)) : 0;

  if (hoursRemaining < 0) return { color: "red", label: "BREACHED", hours: Math.abs(Math.round(hoursRemaining)), percent: 100 };
  if (hoursRemaining < 24) return { color: "amber", label: "URGENT", hours: Math.round(hoursRemaining), percent };
  if (hoursRemaining < 48) return { color: "yellow", label: "WARNING", hours: Math.round(hoursRemaining), percent };
  return { color: "green", label: "ON TRACK", hours: Math.round(hoursRemaining), percent };
}

export default function PipelinePage() {
  const [activeTab, setActiveTab] = useState("new");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [counts, setCounts] = useState<Record<string, number>>({});

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Get initial tab from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && TABS.some((t) => t.key === tab)) {
      setActiveTab(tab);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch counts for all tabs
      const countPromises = Object.entries(STATUS_MAP).map(async ([key, val]) => {
        const { count } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("production_status", val);
        return [key, count || 0] as [string, number];
      });

      // Critical count
      const { count: critCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .in("production_status", ["New", "In-Production"])
        .lte("target_ship_date", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());

      const countsArr = await Promise.all(countPromises);
      const newCounts: Record<string, number> = {};
      countsArr.forEach(([k, v]) => (newCounts[k] = v));
      newCounts["critical"] = critCount || 0;
      setCounts(newCounts);

      // Fetch orders for active tab
      let query = supabase
        .from("orders")
        .select("*, profile:profiles(full_name), items:order_items(quantity, product:products(name))")
        .order("target_ship_date", { ascending: true, nullsFirst: false });

      if (activeTab === "critical") {
        query = query
          .in("production_status", ["New", "In-Production"])
          .lte("target_ship_date", new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
      } else {
        query = query
            .eq("production_status", STATUS_MAP[activeTab] || "New")
            .neq("status", "PENDING_PAYMENT");
      }

      const { data, error } = await query;
      if (error) console.error("Pipeline fetch error:", error);
      setOrders((data as unknown as Order[]) || []);
    } catch (err) {
      console.error("Pipeline error:", err);
    }
    setLoading(false);
  }, [activeTab, supabase]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const moveOrder = async (orderId: string, newStatus: string) => {
    const updateData: any = { production_status: newStatus };
    if (newStatus === "In-Production") updateData.start_date = new Date().toISOString();

    await supabase.from("orders").update(updateData).eq("id", orderId);
    fetchOrders();
  };

  const toggleMaterials = async (orderId: string, available: boolean) => {
    await supabase.from("orders").update({ materials_available: available }).eq("id", orderId);
    fetchOrders();
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.size === 0) return;
    const ids = Array.from(selectedOrders);

    for (const id of ids) {
      await moveOrder(id, bulkAction);
    }
    setSelectedOrders(new Set());
    setBulkAction("");
    fetchOrders();
  };

  const toggleSelect = (id: string) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map((o) => o.id)));
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.profile?.full_name?.toLowerCase().includes(q) ||
      o.items?.some((item) => item.product?.name?.toLowerCase().includes(q))
    );
  });

  const getNextStatus = (current: string) => {
    const flow: Record<string, string> = {
      New: "In-Production",
      "In-Production": "QC",
      QC: "Ready",
    };
    return flow[current];
  };

  const printJobSheet = (order: Order) => {
    const items = order.items?.map((i) => `${i.product?.name || "Item"} x${i.quantity}`).join("\n") || "N/A";
    const content = `
===== DHOMEC JOB SHEET =====
Order: #${order.id.slice(0, 8).toUpperCase()}
Customer: ${order.profile?.full_name || "Guest"}
Amount: ₹${Number(order.total_amount).toLocaleString()}
Target Ship Date: ${order.target_ship_date ? new Date(order.target_ship_date).toLocaleDateString() : "TBD"}
Status: ${order.production_status}

--- ITEMS ---
${items}

--- NOTES ---
${order.production_notes || "None"}

Materials Available: ${order.materials_available ? "Yes" : "No"}
============================
    `.trim();

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`<pre style="font-family:monospace;font-size:14px;padding:20px;">${content}</pre>`);
      win.document.title = `Job Sheet - ${order.id.slice(0, 8)}`;
      win.print();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Production Pipeline</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Work-by-time order management</p>
        </div>
        <button onClick={fetchOrders} className="p-2 hover:bg-slate-100 rounded-xl transition-all" title="Refresh">
          <RefreshCcw className={`w-5 h-5 text-slate-400 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = counts[tab.key] || 0;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedOrders(new Set()); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                isActive
                  ? tab.color === "red"
                    ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20"
                    : tab.color === "blue"
                    ? "bg-[#2874f0] text-white border-[#2874f0] shadow-lg shadow-blue-500/20"
                    : tab.color === "orange"
                    ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20"
                    : tab.color === "purple"
                    ? "bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/20"
                    : "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {count > 0 && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bulk Actions Bar */}
      {selectedOrders.size > 0 && (
        <div className="bg-[#2874f0] rounded-xl p-4 flex items-center justify-between text-white animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">{selectedOrders.size} order{selectedOrders.size > 1 ? "s" : ""} selected</span>
            <button onClick={() => setSelectedOrders(new Set())} className="text-blue-200 hover:text-white text-xs font-bold">
              Clear
            </button>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="bg-white/20 border border-white/30 rounded-lg px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm"
            >
              <option value="">Bulk Action...</option>
              <option value="In-Production">→ Move to Production</option>
              <option value="QC">→ Move to QC</option>
              <option value="Ready">→ Move to Ready</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className="px-4 py-1.5 bg-white text-[#2874f0] rounded-lg text-xs font-black disabled:opacity-50 hover:bg-blue-50 transition-all"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          placeholder="Search orders, customers, products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#2874f0]/20 focus:border-[#2874f0] transition-all"
        />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center">
            <RefreshCcw className="w-8 h-8 text-slate-300 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400">Loading pipeline...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-20 text-center">
            <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400">No orders in this stage</p>
            <p className="text-xs text-slate-300 mt-1">Orders will appear here as they flow through the pipeline</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="p-4 w-10">
                  <input type="checkbox" checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0} onChange={selectAll} className="rounded" />
                </th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Order & Customer</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Items</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">SLA Progress</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Materials</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order) => {
                const sla = getSLAInfo(order.target_ship_date, order.start_date);
                const nextStatus = getNextStatus(order.production_status);
                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="p-4">
                      <input type="checkbox" checked={selectedOrders.has(order.id)} onChange={() => toggleSelect(order.id)} className="rounded" />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-full rounded-full shrink-0 ${
                          sla.color === "red" ? "bg-red-500" : sla.color === "amber" ? "bg-amber-500" : sla.color === "yellow" ? "bg-yellow-500" : "bg-green-500"
                        }`} />
                        <div>
                          <p className="text-xs font-bold text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{order.profile?.full_name || "Guest"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="max-w-[200px]">
                        {order.items?.slice(0, 2).map((item, i) => (
                          <p key={i} className="text-[11px] text-slate-600 truncate">
                            {item.product?.name || "Item"} × {item.quantity}
                          </p>
                        ))}
                        {(order.items?.length || 0) > 2 && (
                          <p className="text-[10px] text-slate-400">+{(order.items?.length || 0) - 2} more</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1.5 w-36">
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            sla.color === "red" ? "bg-red-100 text-red-700" :
                            sla.color === "amber" ? "bg-amber-100 text-amber-700" :
                            sla.color === "yellow" ? "bg-yellow-100 text-yellow-700" :
                            "bg-green-100 text-green-700"
                          }`}>
                            {sla.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {sla.hours > 0 ? `${sla.hours}h` : ""}
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              sla.color === "red" ? "bg-red-500" :
                              sla.color === "amber" ? "bg-amber-500" :
                              sla.color === "yellow" ? "bg-yellow-500" :
                              "bg-green-500"
                            }`}
                            style={{ width: `${sla.percent}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-slate-400">
                          {order.target_ship_date ? `Ship by ${new Date(order.target_ship_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : "No deadline"}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleMaterials(order.id, !order.materials_available)}
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                          order.materials_available
                            ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                            : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                        }`}
                      >
                        {order.materials_available ? "✓ Available" : "✗ Missing"}
                      </button>
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-black text-slate-900">₹{Number(order.total_amount).toLocaleString()}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => printJobSheet(order)}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                          title="Print Job Sheet"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                        </button>
                        {nextStatus && (
                          <button
                            onClick={() => moveOrder(order.id, nextStatus)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2874f0] text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-all"
                          >
                            <ArrowRight className="w-3 h-3" />
                            {nextStatus === "In-Production" ? "Start" :
                             nextStatus === "QC" ? "To QC" : "Pack"}
                          </button>
                        )}
                        {order.production_status === "In-Production" && (
                          <button
                            onClick={() => moveOrder(order.id, "New")}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-bold hover:bg-amber-200 transition-all"
                            title="Pause Production"
                          >
                            <Pause className="w-3 h-3" />
                            Pause
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
