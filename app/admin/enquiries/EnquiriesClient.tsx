"use client";

import { updateEnquiryStatus, deleteEnquiry } from "@/app/actions/enquiries";
import { useState, useTransition } from "react";
import { Mail, Phone, Building2, Package, Clock, CheckCircle2, Trash2, MessageSquare, RefreshCw } from "lucide-react";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  in_progress: "bg-purple-100 text-purple-700",
  resolved: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-100 text-slate-600",
};

export function EnquiriesClient({ enquiries }: { enquiries: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" 
    ? enquiries 
    : enquiries.filter((e) => e.status === filter);

  const handleStatusChange = (id: string, status: string) => {
    startTransition(async () => {
      try {
        await updateEnquiryStatus(id, status);
      } catch (e) {
        console.error(e);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;
    startTransition(async () => {
      try {
        await deleteEnquiry(id);
      } catch (e) {
        console.error(e);
      }
    });
  };

  if (enquiries.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
        <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800">No enquiries yet</h3>
        <p className="text-sm text-slate-500 mt-1">Customer enquiries will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["all", "new", "contacted", "in_progress", "resolved", "closed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              filter === status
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {status === "all" ? "All" : status.replace(/_/g, " ").toUpperCase()}
            {status !== "all" && (
              <span className="ml-1.5 opacity-70">
                ({enquiries.filter((e) => e.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Enquiry Cards */}
      <div className="space-y-4">
        {filtered.map((enquiry: any) => (
          <div key={enquiry.id} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[enquiry.status] || statusColors.new}`}>
                    {(enquiry.status || "new").replace(/_/g, " ").toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(enquiry.created_at).toLocaleDateString("en-IN", { 
                      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" 
                    })}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-800 mb-2">{enquiry.name}</h3>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-3">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {enquiry.phone}
                  </span>
                  {enquiry.company && (
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> {enquiry.company}
                    </span>
                  )}
                  {enquiry.product_interest && (
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" /> {enquiry.product_interest}
                    </span>
                  )}
                </div>

                {enquiry.message && (
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">
                    {enquiry.message}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={enquiry.status || "new"}
                  onChange={(e) => handleStatusChange(enquiry.id, e.target.value)}
                  disabled={isPending}
                  className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 cursor-pointer disabled:opacity-50"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <a
                  href={`https://wa.me/91${enquiry.phone?.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                  title="WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleDelete(enquiry.id)}
                  disabled={isPending}
                  className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
