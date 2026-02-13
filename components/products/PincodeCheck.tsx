"use client";

import { useState } from "react";
import { MapPin, Truck, Loader2, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourierOption {
  name: string;
  rate: number;
  etd: string;
}

interface ServiceabilityResult {
  serviceable: boolean;
  message: string;
  estimated_days?: number;
  couriers: CourierOption[];
  source?: string;
}

export function PincodeCheck({ weight = 1 }: { weight?: number }) {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ServiceabilityResult | null>(null);
  const [showCouriers, setShowCouriers] = useState(false);
  const [error, setError] = useState("");

  const checkServiceability = async () => {
    if (!/^\d{6}$/.test(pincode)) {
      setError("Please enter a valid 6-digit pincode");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/logistics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          delivery_pincode: pincode,
          weight,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to check serviceability");
        return;
      }

      setResult(data);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
          <Truck className="w-4 h-4" />
        </div>
        <span className="text-sm font-bold text-slate-700">Check Delivery Availability</span>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter Pincode"
            value={pincode}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setPincode(val);
              if (result) setResult(null);
              if (error) setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && checkServiceability()}
            className="w-full pl-9 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium"
          />
        </div>
        <Button
          onClick={checkServiceability}
          disabled={loading || pincode.length !== 6}
          className="px-5 rounded-xl h-auto bg-slate-900 hover:bg-slate-800 font-bold text-sm"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-2 duration-200">
          <XCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {result.serviceable ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-sm font-bold">{result.message}</span>
              </div>

              {result.couriers.length > 0 && (
                <button
                  onClick={() => setShowCouriers(!showCouriers)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors px-2 py-1"
                >
                  <span>
                    {showCouriers ? "Hide" : "View"} shipping options ({result.couriers.length})
                  </span>
                  {showCouriers ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}

              {showCouriers && result.couriers.length > 0 && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {result.couriers.map((courier, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-3 bg-white rounded-xl border border-slate-100 text-sm"
                    >
                      <div>
                        <span className="font-bold text-slate-800">{courier.name}</span>
                        <span className="text-slate-400 ml-2">({courier.etd})</span>
                      </div>
                      <span className="font-black text-slate-900">₹{courier.rate}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-700 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
              <XCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-bold">{result.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
