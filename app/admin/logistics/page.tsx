"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Package,
  Truck,
  FileText,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  Box,
  Tag,
  MapPin,
  ExternalLink,
} from "lucide-react";

type ShipmentStatus = "PENDING_PAYMENT" | "PLACED" | "ACCEPTED" | "PACKED" | "SHIPPED" | "DELIVERED";

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: "bg-slate-100 text-slate-600",
  PLACED: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-amber-100 text-amber-700",
  PACKED: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-emerald-100 text-emerald-700",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-700",
};

const STATUS_STEPS: ShipmentStatus[] = ["PLACED", "ACCEPTED", "PACKED", "SHIPPED", "DELIVERED"];

interface OrderForLogistics {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  shipping_address: any;
  shipping_info: any;
  user?: any;
  order_items: any[];
}

export default function LogisticsPage() {
  const [orders, setOrders] = useState<OrderForLogistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        created_at,
        total_amount,
        status,
        shipping_address,
        shipping_info,
        razorpay_payment_id,
        user_id,
        order_items (
          id,
          quantity,
          price_at_purchase,
          product_id,
          products (name, sku, weight_kg, dimensions, hsn_code)
        )
      `)
      .neq("status", "PENDING_PAYMENT")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      addToast("Failed to load orders", "error");
      console.error(error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "ALL" && order.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(q) ||
        (order.shipping_address?.fullName || "").toLowerCase().includes(q) ||
        (order.shipping_address?.pincode || "").includes(q) ||
        (order.shipping_info?.awb_code || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const advanceStatus = async (orderId: string, currentStatus: string) => {
    const currentIdx = STATUS_STEPS.indexOf(currentStatus as ShipmentStatus);
    if (currentIdx === -1 || currentIdx >= STATUS_STEPS.length - 1) return;

    const nextStatus = STATUS_STEPS[currentIdx + 1];
    setProcessing(orderId);

    const supabase = createClient();

    // If moving to SHIPPED, generate AWB
    let shippingInfo = null;
    if (nextStatus === "SHIPPED") {
      try {
        const res = await fetch("/api/logistics/shipment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create_order",
            order: orders.find((o) => o.id === orderId),
          }),
        });
        const data = await res.json();
        if (data.success) {
          shippingInfo = {
            provider: data.source === "shiprocket" ? "SHIPROCKET" : "MANUAL",
            awb_code: data.awb_code,
            tracking_url: data.tracking_url || null,
            shipped_date: new Date().toISOString(),
          };
        }
      } catch (e) {
        console.error("Logistics API error:", e);
      }
    }

    const updatePayload: any = {
      status: nextStatus,
      updated_at: new Date().toISOString(),
    };

    if (shippingInfo) {
      updatePayload.shipping_info = shippingInfo;
    }

    const { error } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId);

    if (error) {
      addToast(`Failed to update to ${nextStatus}`, "error");
    } else {
      // Add to history
      await supabase.from("order_status_history").insert({
        order_id: orderId,
        status: nextStatus,
        changed_by: null,
      });

      addToast(`Order updated to ${nextStatus}`, "success");
      fetchOrders();
    }
    setProcessing(null);
  };

  const generateLabel = async (orderId: string) => {
    setProcessing(orderId);
    const order = orders.find((o) => o.id === orderId);

    try {
      const res = await fetch("/api/logistics/shipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_label",
          shipment_id: order?.shipping_info?.shipment_id,
        }),
      });
      const data = await res.json();
      if (data.label_url) {
        window.open(data.label_url, "_blank");
      } else {
        addToast(data.message || "Label generated", "info");
      }
    } catch {
      addToast("Failed to generate label", "error");
    }
    setProcessing(null);
  };

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "PLACED" || o.status === "ACCEPTED").length,
    readyToShip: orders.filter((o) => o.status === "PACKED").length,
    shipped: orders.filter((o) => o.status === "SHIPPED").length,
    delivered: orders.filter((o) => o.status === "DELIVERED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Logistics Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Manage orders, shipments, and deliveries</p>
        </div>
        <Button onClick={fetchOrders} variant="outline" className="gap-2 font-bold" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Orders", value: stats.total, icon: Package, color: "bg-slate-100 text-slate-700" },
          { label: "Pending", value: stats.pending, icon: Box, color: "bg-blue-100 text-blue-700" },
          { label: "Ready to Ship", value: stats.readyToShip, icon: Tag, color: "bg-purple-100 text-purple-700" },
          { label: "Shipped", value: stats.shipped, icon: Truck, color: "bg-emerald-100 text-emerald-700" },
          { label: "Delivered", value: stats.delivered, icon: CheckCircle2, color: "bg-green-100 text-green-700" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl border border-slate-200 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer, Pincode, AWB..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["ALL", "PENDING_PAYMENT", ...STATUS_STEPS, "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === status
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status === "PENDING_PAYMENT" ? "PENDING" : status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const currentStatusIdx = STATUS_STEPS.indexOf(order.status as ShipmentStatus);
            const canAdvance = currentStatusIdx >= 0 && currentStatusIdx < STATUS_STEPS.length - 1;
            const nextAction =
              canAdvance
                ? order.status === "PLACED"
                  ? "Accept Order"
                  : order.status === "ACCEPTED"
                  ? "Mark Packed"
                  : order.status === "PACKED"
                  ? "Ship & Generate AWB"
                  : "Mark Delivered"
                : null;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Order Row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2 sm:items-center">
                    <div>
                      <p className="text-sm font-black text-slate-900 truncate">
                        #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(order.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 truncate">
                        {order.shipping_address?.fullName || "—"}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {order.shipping_address?.pincode || "—"}
                      </p>
                    </div>
                    <p className="text-sm font-black text-slate-900">
                      ₹{order.total_amount?.toLocaleString("en-IN")}
                    </p>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold w-fit ${
                        STATUS_COLORS[order.status] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50/50 animate-in slide-in-from-top-2 duration-200 space-y-4">
                    {/* Progress Tracker */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-2">
                      {STATUS_STEPS.map((step, i) => (
                        <div key={step} className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              i <= currentStatusIdx
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-200 text-slate-400"
                            }`}
                          >
                            {i <= currentStatusIdx ? "✓" : i + 1}
                          </div>
                          <span
                            className={`text-[10px] ml-1 mr-2 font-bold whitespace-nowrap ${
                              i <= currentStatusIdx ? "text-emerald-700" : "text-slate-400"
                            }`}
                          >
                            {step}
                          </span>
                          {i < STATUS_STEPS.length - 1 && (
                            <div
                              className={`w-6 h-0.5 ${
                                i < currentStatusIdx ? "bg-emerald-500" : "bg-slate-200"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Items */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-600 uppercase mb-2">Items</h4>
                      <div className="space-y-1">
                        {(order.order_items || []).map((item: any) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm bg-white px-3 py-2 rounded-lg"
                          >
                            <span className="font-medium text-slate-700">
                              {item.products?.name || "Product"}{" "}
                              <span className="text-slate-400">×{item.quantity}</span>
                            </span>
                            <span className="font-bold">
                              ₹{(item.price_at_purchase * item.quantity).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-600 uppercase mb-2">Ship To</h4>
                      <p className="text-sm text-slate-700">
                        {order.shipping_address?.fullName}
                        <br />
                        {order.shipping_address?.address || order.shipping_address?.line1}
                        <br />
                        {order.shipping_address?.city}, {order.shipping_address?.state}{" "}
                        {order.shipping_address?.pincode}
                        <br />
                        📞 {order.shipping_address?.phone || "—"}
                      </p>
                    </div>

                    {/* Shipping Info */}
                    {order.shipping_info?.awb_code && (
                      <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                        <h4 className="text-xs font-bold text-emerald-700 uppercase mb-1">
                          Tracking
                        </h4>
                        <p className="text-sm font-mono font-bold text-emerald-800">
                          AWB: {order.shipping_info.awb_code}
                        </p>
                        {order.shipping_info.tracking_url && (
                          <a
                            href={order.shipping_info.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline mt-1"
                          >
                            Track Shipment <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {canAdvance && (
                        <Button
                          onClick={() => advanceStatus(order.id, order.status)}
                          disabled={processing === order.id}
                          className="gap-2 bg-slate-900 hover:bg-slate-800 font-bold"
                        >
                          {processing === order.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Truck className="w-4 h-4" />
                          )}
                          {nextAction}
                        </Button>
                      )}

                      {order.status === "SHIPPED" && (
                        <Button
                          variant="outline"
                          onClick={() => generateLabel(order.id)}
                          disabled={processing === order.id}
                          className="gap-2 font-bold"
                        >
                          <FileText className="w-4 h-4" />
                          Print Label
                        </Button>
                      )}

                      {order.status === "DELIVERED" && (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
