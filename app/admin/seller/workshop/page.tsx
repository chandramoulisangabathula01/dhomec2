"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Settings,
  Gauge,
  Zap,
  Save,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Truck,
  Factory,
  Info,
} from "lucide-react";

export default function WorkshopSettingsPage() {
  const [workshopLoad, setWorkshopLoad] = useState("normal");
  const [extraLeadDays, setExtraLeadDays] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("seller_settings").select("*");
    if (data) {
      const load = data.find((s: any) => s.setting_key === "workshop_load");
      const days = data.find((s: any) => s.setting_key === "extra_lead_days");
      if (load) setWorkshopLoad(load.setting_value);
      if (days) setExtraLeadDays(Number(days.setting_value) || 0);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    await supabase
      .from("seller_settings")
      .update({ setting_value: workshopLoad, updated_at: new Date().toISOString() })
      .eq("setting_key", "workshop_load");

    await supabase
      .from("seller_settings")
      .update({ setting_value: String(extraLeadDays), updated_at: new Date().toISOString() })
      .eq("setting_key", "extra_lead_days");

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const loadPresets = [
    { key: "normal", label: "Normal", description: "Standard production capacity. No extra lead time added.", icon: Factory, color: "green", extraDays: 0 },
    { key: "medium", label: "Medium Load", description: "Moderate backlog. +2 days added to new order SLAs.", icon: Clock, color: "amber", extraDays: 2 },
    { key: "high", label: "High Load", description: "Workshop is at capacity. +3 days globally added to all new SLAs.", icon: AlertTriangle, color: "red", extraDays: 3 },
  ];

  const selectPreset = (preset: typeof loadPresets[0]) => {
    setWorkshopLoad(preset.key);
    setExtraLeadDays(preset.extraDays);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Settings className="w-8 h-8 text-slate-300 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Workshop Settings</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Configure production capacity and lead time adjustments</p>
      </div>

      {/* Success Toast */}
      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <p className="text-sm font-medium text-green-700">Settings saved successfully!</p>
        </div>
      )}

      {/* Workshop Load Slider-Presets */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#2874f0]/10 rounded-xl">
            <Gauge className="w-5 h-5 text-[#2874f0]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Workshop Load Level</h2>
            <p className="text-xs text-slate-500">Adjust global lead time based on current workshop capacity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loadPresets.map((preset) => {
            const isActive = workshopLoad === preset.key;
            return (
              <button
                key={preset.key}
                onClick={() => selectPreset(preset)}
                className={`p-5 rounded-2xl border-2 text-left transition-all ${
                  isActive
                    ? preset.color === "green"
                      ? "border-green-400 bg-green-50 shadow-lg shadow-green-500/10"
                      : preset.color === "amber"
                      ? "border-amber-400 bg-amber-50 shadow-lg shadow-amber-500/10"
                      : "border-red-400 bg-red-50 shadow-lg shadow-red-500/10"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-xl ${
                    isActive
                      ? preset.color === "green" ? "bg-green-500 text-white" :
                        preset.color === "amber" ? "bg-amber-500 text-white" : "bg-red-500 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}>
                    <preset.icon className="w-4 h-4" />
                  </div>
                  <h3 className={`text-sm font-bold ${isActive ? "text-slate-900" : "text-slate-600"}`}>{preset.label}</h3>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{preset.description}</p>
                <div className={`mt-3 text-xs font-black ${
                  preset.color === "green" ? "text-green-600" :
                  preset.color === "amber" ? "text-amber-600" : "text-red-600"
                }`}>
                  {preset.extraDays === 0 ? "No extra days" : `+${preset.extraDays} days to all SLAs`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Lead Time Adjustment */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-50 rounded-xl">
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Custom Lead Time Adjuster</h2>
            <p className="text-xs text-slate-500">Fine-tune the extra days added to all new order SLAs</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-2 block">Extra Lead Days: {extraLeadDays}</label>
            <input
              type="range"
              min={0}
              max={14}
              value={extraLeadDays}
              onChange={(e) => setExtraLeadDays(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-[#2874f0]"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
              <span>0 days</span>
              <span>7 days</span>
              <span>14 days</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-[#2874f0] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-[#2874f0]">Effect Preview</p>
              <p className="text-[11px] text-slate-600 mt-1">
                {extraLeadDays === 0
                  ? "No additional lead time. Orders will use the product's base_lead_time_days only."
                  : `All new orders will have +${extraLeadDays} days added to their target ship date. A product with 5-day base lead time will show ${5 + extraLeadDays} days to the customer.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Info Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-50 rounded-xl">
            <Truck className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Backorder Buffer System</h2>
            <p className="text-xs text-slate-500">When a product is out of stock with backorder enabled</p>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Zap className="w-3.5 h-3.5 text-[#2874f0]" />
            <span><strong>Manufacturing Buffer:</strong> +7 days automatically added to delivery date when Stock = 0</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Zap className="w-3.5 h-3.5 text-[#2874f0]" />
            <span><strong>Dynamic Lead Time:</strong> base_lead_time + workshop_extra + manufacturing_buffer = customer delivery date</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Zap className="w-3.5 h-3.5 text-[#2874f0]" />
            <span><strong>Toggle per product:</strong> Enable/disable backorder individually in Capacity & Stock page</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-[#2874f0] text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          {saving ? (
            <Settings className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Settings
        </button>
      </div>
    </div>
  );
}
