"use client";

import { updateReturnStatus } from "@/app/actions/returns";
import { useState, useTransition } from "react";
import { Package, Clock, CheckCircle2, XCircle, RefreshCw, ArrowRight } from "lucide-react";

const statusColors: Record<string, string> = {
  requested: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  refund_initiated: "bg-indigo-100 text-indigo-700",
  refund_completed: "bg-emerald-100 text-emerald-700",
  pickup_scheduled: "bg-purple-100 text-purple-700",
};

const statusOptions = [
  { value: "approved", label: "Approve" },
  { value: "rejected", label: "Reject" },
  { value: "refund_initiated", label: "Initiate Refund" },
  { value: "refund_completed", label: "Refund Completed" },
  { value: "pickup_scheduled", label: "Schedule Pickup" },
];

export function ReturnsAdminClient({ returns }: { returns: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusUpdate = (returnId: string, newStatus: string) => {
    setUpdatingId(returnId);
    startTransition(async () => {
      try {
        await updateReturnStatus(returnId, newStatus);
      } catch (e) {
        console.error(e);
      }
      setUpdatingId(null);
    });
  };

  if (returns.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
        <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800">No returns yet</h3>
        <p className="text-sm text-slate-500 mt-1">Return requests will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {returns.map((ret: any) => (
        <div key={ret.id} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[ret.status] || "bg-slate-100 text-slate-600"}`}>
                  {ret.status?.replace(/_/g, " ").toUpperCase()}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(ret.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800 mb-1">
                Return #{ret.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-sm text-slate-500">
                Customer: {ret.profiles?.full_name || "N/A"} • Order #{ret.orders?.id?.slice(0, 8).toUpperCase()}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                <span className="font-medium">Reason:</span> {ret.reason}
              </p>
              {ret.refund_amount && (
                <p className="text-sm font-bold text-slate-800 mt-2">
                  Refund Amount: ₹{Number(ret.refund_amount).toLocaleString("en-IN")}
                </p>
              )}
            </div>

            {/* Status Actions */}
            {ret.status !== "refund_completed" && ret.status !== "rejected" && (
              <div className="flex flex-wrap gap-2">
                {statusOptions
                  .filter((opt) => opt.value !== ret.status)
                  .map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleStatusUpdate(ret.id, opt.value)}
                      disabled={updatingId === ret.id}
                      className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      {updatingId === ret.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        opt.label
                      )}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
