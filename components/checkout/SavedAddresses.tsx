"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Trash2, Check, Loader2, Home, Building2 } from "lucide-react";
import type { Address } from "@/types";

interface SavedAddressesProps {
  onSelect: (address: Address) => void;
  selectedAddress?: Address | null;
}

export function SavedAddresses({ onSelect, selectedAddress }: SavedAddressesProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();
  const [newAddress, setNewAddress] = useState<Address>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    type: "HOME",
  });

  const fetchAddresses = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("addresses")
      .eq("id", user.id)
      .single();

    if (data?.addresses && Array.isArray(data.addresses)) {
      setAddresses(data.addresses);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const saveAddress = async () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.pincode || !newAddress.city) {
      addToast("Please fill all required fields", "error");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      addToast("Please login to save addresses", "error");
      setSaving(false);
      return;
    }

    const updatedAddresses = [...addresses, newAddress];

    const { error } = await supabase
      .from("profiles")
      .update({ addresses: updatedAddresses })
      .eq("id", user.id);

    if (error) {
      addToast("Failed to save address", "error");
    } else {
      setAddresses(updatedAddresses);
      setShowForm(false);
      setNewAddress({ fullName: "", phone: "", address: "", city: "", state: "", pincode: "", type: "HOME" });
      addToast("Address saved!", "success");
    }
    setSaving(false);
  };

  const deleteAddress = async (index: number) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const updatedAddresses = addresses.filter((_, i) => i !== index);
    const { error } = await supabase
      .from("profiles")
      .update({ addresses: updatedAddresses })
      .eq("id", user.id);

    if (!error) {
      setAddresses(updatedAddresses);
      addToast("Address removed", "info");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Saved Addresses
        </h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add New
          </button>
        )}
      </div>

      {/* Saved Address Cards */}
      {addresses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((addr, index) => {
            const isSelected =
              selectedAddress?.pincode === addr.pincode &&
              selectedAddress?.fullName === addr.fullName;

            return (
              <div
                key={index}
                onClick={() => onSelect(addr)}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/50 shadow-md"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  {addr.type === "OFFICE" ? (
                    <Building2 className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Home className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    {addr.type || "Home"}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900">{addr.fullName}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {addr.address}
                  <br />
                  {addr.city}, {addr.state} {addr.pincode}
                </p>
                <p className="text-xs text-slate-400 mt-1">📞 {addr.phone}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAddress(index);
                  }}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {addresses.length === 0 && !showForm && (
        <p className="text-sm text-slate-400 text-center py-4">No saved addresses yet</p>
      )}

      {/* New Address Form */}
      {showForm && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex gap-2 mb-3">
            {["HOME", "OFFICE"].map((type) => (
              <button
                key={type}
                onClick={() => setNewAddress({ ...newAddress, type })}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  newAddress.type === type
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {type === "HOME" ? "🏠" : "🏢"} {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Full Name *"
              value={newAddress.fullName}
              onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <input
              placeholder="Phone *"
              maxLength={10}
              inputMode="numeric"
              value={newAddress.phone}
              onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value?.replace(/\D/g, "") })}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <textarea
            placeholder="Full Address *"
            rows={2}
            value={newAddress.address}
            onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              placeholder="City *"
              value={newAddress.city}
              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <input
              placeholder="State"
              value={newAddress.state}
              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <input
              placeholder="Pincode *"
              maxLength={6}
              inputMode="numeric"
              value={newAddress.pincode}
              onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value?.replace(/\D/g, "") })}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={saveAddress} disabled={saving} className="gap-1 font-bold text-sm h-10">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Address
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="font-bold text-sm h-10">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
