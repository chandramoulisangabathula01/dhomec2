"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Papa from "papaparse";
import {
  FileSpreadsheet,
  Upload,
  Download,
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Package,
  X,
  FileText,
  Loader2,
} from "lucide-react";

type BulkOrder = {
  id: string;
  production_status: string;
  profile?: { full_name: string } | null;
  total_amount: number;
  created_at: string;
};

type ProductCSV = {
  id: string;
  name: string;
  min_stock_threshold: number;
  base_lead_time_days: number;
  stock_quantity: number;
  allow_backorder: boolean;
};

export default function BulkOperationsPage() {
  const [orders, setOrders] = useState<BulkOrder[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[] | null>(null);
  const [csvFileName, setCsvFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSection, setActiveSection] = useState<"orders" | "catalog">("orders");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("id, production_status, profile:profiles(full_name), total_amount, created_at")
      .in("production_status", ["New", "In-Production", "QC", "Ready"])
      .order("created_at", { ascending: false });
    setOrders((data as unknown as BulkOrder[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedOrders.size === 0) return;
    setProcessing(true);
    setResult(null);
    try {
      const ids = Array.from(selectedOrders);
      const updateData: any = { production_status: bulkStatus };
      if (bulkStatus === "In-Production") updateData.start_date = new Date().toISOString();

      const { error } = await supabase
        .from("orders")
        .update(updateData)
        .in("id", ids);

      if (error) throw error;
      setResult({ type: "success", message: `Successfully updated ${ids.length} order(s) to "${bulkStatus}"` });
      setSelectedOrders(new Set());
      setBulkStatus("");
      fetchOrders();
    } catch (err: any) {
      setResult({ type: "error", message: err.message || "Failed to update orders" });
    }
    setProcessing(false);
  };

  const exportCatalogCSV = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name, stock_quantity, min_stock_threshold, base_lead_time_days, allow_backorder");
    
    if (!data) return;
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `catalog_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setCsvPreview(results.data.slice(0, 10));
      },
      error: (err) => {
        setResult({ type: "error", message: `CSV parse error: ${err.message}` });
      },
    });
  };

  const processCatalogCSV = async () => {
    if (!csvPreview) return;
    setProcessing(true);
    setResult(null);
    try {
      // Re-parse full file
      const file = fileInputRef.current?.files?.[0];
      if (!file) throw new Error("No file selected");

      const parseResult: any = await new Promise((resolve, reject) => {
        Papa.parse(file, {
          header: true,
          complete: resolve,
          error: reject,
        });
      });

      let updated = 0;
      let errors = 0;

      for (const row of parseResult.data) {
        if (!row.id) continue;
        const updateData: any = {};
        if (row.min_stock_threshold !== undefined) updateData.min_stock_threshold = Number(row.min_stock_threshold);
        if (row.base_lead_time_days !== undefined) updateData.base_lead_time_days = Number(row.base_lead_time_days);
        if (row.stock_quantity !== undefined) updateData.stock_quantity = Number(row.stock_quantity);
        if (row.allow_backorder !== undefined) updateData.allow_backorder = row.allow_backorder === "true" || row.allow_backorder === true;

        if (Object.keys(updateData).length > 0) {
          const { error } = await supabase.from("products").update(updateData).eq("id", row.id);
          if (error) errors++;
          else updated++;
        }
      }

      setResult({
        type: errors === 0 ? "success" : "error",
        message: `Updated ${updated} products. ${errors > 0 ? `${errors} errors occurred.` : ""}`,
      });
      setCsvPreview(null);
      setCsvFileName("");
    } catch (err: any) {
      setResult({ type: "error", message: err.message || "CSV import failed" });
    }
    setProcessing(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedOrders.size === orders.length) setSelectedOrders(new Set());
    else setSelectedOrders(new Set(orders.map((o) => o.id)));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bulk Operations</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Mass status updates & CSV catalog management</p>
      </div>

      {/* Result toast */}
      {result && (
        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top duration-300 ${
          result.type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
        }`}>
          {result.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          )}
          <p className={`text-sm font-medium ${result.type === "success" ? "text-green-700" : "text-red-700"}`}>{result.message}</p>
          <button onClick={() => setResult(null)} className="ml-auto p-1 hover:bg-white/50 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveSection("orders")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
            activeSection === "orders" ? "bg-[#2874f0] text-white border-[#2874f0] shadow-lg shadow-blue-500/20" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Package className="w-4 h-4" /> Bulk Status Update
        </button>
        <button
          onClick={() => setActiveSection("catalog")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${
            activeSection === "catalog" ? "bg-[#2874f0] text-white border-[#2874f0] shadow-lg shadow-blue-500/20" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> CSV Catalog Management
        </button>
      </div>

      {activeSection === "orders" && (
        <div className="space-y-4">
          {/* Bulk action bar */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4">
            <span className="text-sm font-bold text-slate-700">{selectedOrders.size} selected</span>
            <ArrowRight className="w-4 h-4 text-slate-300" />
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#2874f0]/20"
            >
              <option value="">Select new status...</option>
              <option value="New">New Work</option>
              <option value="In-Production">In Production</option>
              <option value="QC">Quality Check</option>
              <option value="Ready">Ready to Pack</option>
            </select>
            <button
              onClick={handleBulkStatusUpdate}
              disabled={!bulkStatus || selectedOrders.size === 0 || processing}
              className="flex items-center gap-2 px-5 py-2 bg-[#2874f0] text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-blue-700 transition-all"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Apply to {selectedOrders.size} order{selectedOrders.size !== 1 ? "s" : ""}
            </button>
          </div>

          {/* Orders table */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {loading ? (
              <div className="p-20 text-center">
                <RefreshCcw className="w-8 h-8 text-slate-300 animate-spin mx-auto" />
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="p-4 w-10">
                      <input type="checkbox" checked={selectedOrders.size === orders.length && orders.length > 0} onChange={selectAll} className="rounded" />
                    </th>
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Order</th>
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Customer</th>
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Status</th>
                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map((order) => (
                    <tr key={order.id} className={`hover:bg-slate-50/50 transition-all ${selectedOrders.has(order.id) ? "bg-blue-50/30" : ""}`}>
                      <td className="p-4">
                        <input type="checkbox" checked={selectedOrders.has(order.id)} onChange={() => toggleSelect(order.id)} className="rounded" />
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs text-slate-600">{order.profile?.full_name || "Guest"}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold text-slate-900">₹{Number(order.total_amount).toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          order.production_status === "New" ? "bg-blue-100 text-blue-700" :
                          order.production_status === "In-Production" ? "bg-orange-100 text-orange-700" :
                          order.production_status === "QC" ? "bg-purple-100 text-purple-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {order.production_status}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs text-slate-400">{new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeSection === "catalog" && (
        <div className="space-y-6">
          {/* Export */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <Download className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">Export Catalog CSV</h3>
                <p className="text-xs text-slate-500 mt-0.5">Download current product catalog with stock thresholds and lead times</p>
              </div>
              <button onClick={exportCatalogCSV} className="px-5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold hover:bg-green-600 transition-all flex items-center gap-2">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>

          {/* Import */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Upload className="w-5 h-5 text-[#2874f0]" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">Import Catalog CSV</h3>
                <p className="text-xs text-slate-500 mt-0.5">Bulk update min_stock_threshold, base_lead_time_days, stock_quantity, and allow_backorder</p>
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-[#2874f0] transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-600">{csvFileName || "Click to upload CSV file"}</p>
                <p className="text-[10px] text-slate-400 mt-1">Required columns: id, min_stock_threshold, base_lead_time_days</p>
              </label>
            </div>

            {/* CSV Preview */}
            {csvPreview && (
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">Preview (first 10 rows)</h4>
                  <div className="flex gap-2">
                    <button onClick={() => { setCsvPreview(null); setCsvFileName(""); }} className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200">
                      Cancel
                    </button>
                    <button
                      onClick={processCatalogCSV}
                      disabled={processing}
                      className="flex items-center gap-2 px-4 py-1.5 bg-[#2874f0] text-white rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50"
                    >
                      {processing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      Import All
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50">
                        {csvPreview[0] && Object.keys(csvPreview[0]).map((key) => (
                          <th key={key} className="p-2 text-left text-[10px] font-black text-slate-500 uppercase">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {csvPreview.map((row: any, i: number) => (
                        <tr key={i}>
                          {Object.values(row).map((val: any, j: number) => (
                            <td key={j} className="p-2 text-slate-600 max-w-[150px] truncate">{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
