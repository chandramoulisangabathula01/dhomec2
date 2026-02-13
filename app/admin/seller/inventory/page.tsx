"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Box,
  Package,
  AlertTriangle,
  Search,
  RefreshCcw,
  Edit,
  Save,
  X,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  TrendingDown,
  Zap,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  stock_quantity: number;
  min_stock_threshold: number;
  base_lead_time_days: number;
  allow_backorder: boolean;
  manufacturing_buffer_days: number;
  categories?: { name: string } | null;
};

type HealthFilter = "all" | "healthy" | "low" | "out";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [healthFilter, setHealthFilter] = useState<HealthFilter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [sortField, setSortField] = useState<"stock" | "name" | "threshold">("stock");
  const [sortAsc, setSortAsc] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("id, name, image_url, price, stock_quantity, min_stock_threshold, base_lead_time_days, allow_backorder, manufacturing_buffer_days, categories(name)")
      .order("stock_quantity", { ascending: true });

    if (error) console.error("Inventory fetch error:", error);
    setProducts((data as unknown as Product[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      stock_quantity: product.stock_quantity,
      min_stock_threshold: product.min_stock_threshold,
      base_lead_time_days: product.base_lead_time_days,
      allow_backorder: product.allow_backorder,
      manufacturing_buffer_days: product.manufacturing_buffer_days,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await supabase
      .from("products")
      .update({
        stock_quantity: editForm.stock_quantity,
        min_stock_threshold: editForm.min_stock_threshold,
        base_lead_time_days: editForm.base_lead_time_days,
        allow_backorder: editForm.allow_backorder,
        manufacturing_buffer_days: editForm.manufacturing_buffer_days,
      })
      .eq("id", editingId);
    setEditingId(null);
    fetchProducts();
  };

  const getHealthStatus = (product: Product) => {
    if (product.stock_quantity === 0) return "out";
    if (product.stock_quantity <= product.min_stock_threshold) return "low";
    return "healthy";
  };

  const filteredProducts = products
    .filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q)) return false;
      }
      if (healthFilter !== "all" && getHealthStatus(p) !== healthFilter) return false;
      return true;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === "stock") cmp = a.stock_quantity - b.stock_quantity;
      else if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else cmp = a.min_stock_threshold - b.min_stock_threshold;
      return sortAsc ? cmp : -cmp;
    });

  const healthyCnt = products.filter((p) => getHealthStatus(p) === "healthy").length;
  const lowCnt = products.filter((p) => getHealthStatus(p) === "low").length;
  const outCnt = products.filter((p) => getHealthStatus(p) === "out").length;

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Capacity & Inventory</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Smart threshold management for ready-to-ship buffers</p>
        </div>
        <button onClick={fetchProducts} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
          <RefreshCcw className={`w-5 h-5 text-slate-400 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Health Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setHealthFilter(healthFilter === "healthy" ? "all" : "healthy")}
          className={`p-5 rounded-2xl border transition-all text-left ${
            healthFilter === "healthy" ? "bg-green-50 border-green-300 shadow-lg shadow-green-500/10" : "bg-white border-slate-100 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-[10px] font-black text-green-500 uppercase">Stock &gt; Threshold</span>
          </div>
          <p className="text-3xl font-black text-green-600">{healthyCnt}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Healthy Products</p>
        </button>

        <button
          onClick={() => setHealthFilter(healthFilter === "low" ? "all" : "low")}
          className={`p-5 rounded-2xl border transition-all text-left ${
            healthFilter === "low" ? "bg-amber-50 border-amber-300 shadow-lg shadow-amber-500/10" : "bg-white border-slate-100 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-5 h-5 text-amber-500" />
            <span className="text-[10px] font-black text-amber-500 uppercase">Stock ≤ Threshold</span>
          </div>
          <p className="text-3xl font-black text-amber-600">{lowCnt}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Low Stock — Start Production</p>
        </button>

        <button
          onClick={() => setHealthFilter(healthFilter === "out" ? "all" : "out")}
          className={`p-5 rounded-2xl border transition-all text-left ${
            healthFilter === "out" ? "bg-red-50 border-red-300 shadow-lg shadow-red-500/10" : "bg-white border-slate-100 hover:shadow-md"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-[10px] font-black text-red-500 uppercase">Zero Stock</span>
          </div>
          <p className="text-3xl font-black text-red-600">{outCnt}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Out of Stock — Backorder Mode</p>
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-[#2874f0]/20 focus:border-[#2874f0] transition-all"
          />
        </div>
        {healthFilter !== "all" && (
          <button onClick={() => setHealthFilter("all")} className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all">
            <X className="w-3 h-3" /> Clear Filter
          </button>
        )}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center">
            <RefreshCcw className="w-8 h-8 text-slate-300 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-400">Loading inventory...</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Product</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-700" onClick={() => toggleSort("stock")}>
                  <span className="flex items-center gap-1">Stock Qty <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-700" onClick={() => toggleSort("threshold")}>
                  <span className="flex items-center gap-1">Min Threshold <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Lead Time</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Backorder</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Health</th>
                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((product) => {
                const health = getHealthStatus(product);
                const isEditing = editingId === product.id;
                return (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{product.name}</p>
                          <p className="text-[10px] text-slate-400">{(product.categories as any)?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.stock_quantity ?? 0}
                          onChange={(e) => setEditForm({ ...editForm, stock_quantity: Number(e.target.value) })}
                          className="w-20 px-2 py-1 border rounded-lg text-xs font-bold"
                        />
                      ) : (
                        <span className={`text-sm font-black ${
                          health === "out" ? "text-red-600" : health === "low" ? "text-amber-600" : "text-slate-900"
                        }`}>
                          {product.stock_quantity}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.min_stock_threshold ?? 10}
                          onChange={(e) => setEditForm({ ...editForm, min_stock_threshold: Number(e.target.value) })}
                          className="w-20 px-2 py-1 border rounded-lg text-xs font-bold"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-slate-600">{product.min_stock_threshold}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.base_lead_time_days ?? 5}
                          onChange={(e) => setEditForm({ ...editForm, base_lead_time_days: Number(e.target.value) })}
                          className="w-16 px-2 py-1 border rounded-lg text-xs font-bold"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-slate-600">{product.base_lead_time_days} days</span>
                      )}
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <button
                          onClick={() => setEditForm({ ...editForm, allow_backorder: !editForm.allow_backorder })}
                          className="flex items-center gap-1.5"
                        >
                          {editForm.allow_backorder ? (
                            <ToggleRight className="w-6 h-6 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-slate-400" />
                          )}
                          <span className="text-[10px] font-bold">{editForm.allow_backorder ? "ON" : "OFF"}</span>
                        </button>
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                          product.allow_backorder ? "bg-green-50 text-green-700 border border-green-200" : "bg-slate-100 text-slate-500"
                        }`}>
                          {product.allow_backorder ? "Enabled" : "Disabled"}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                        health === "out" ? "bg-red-100 text-red-700" :
                        health === "low" ? "bg-amber-100 text-amber-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {health === "out" ? "OUT" : health === "low" ? "LOW" : "OK"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={saveEdit} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all">
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-all">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(product)} className="p-2 hover:bg-slate-100 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <Edit className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                      )}
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
