"use client";

import { useState, useRef } from "react";
import { X, MapPin, Calendar, Camera, Loader2, CheckCircle2, Upload, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/utils/supabase/client";

interface BookMeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId?: string;
}

export function BookMeasurementModal({ isOpen, onClose, productName, productId }: BookMeasurementModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    siteAddress: "",
    pincode: "",
    city: "",
    state: "",
    preferredDate: "",
    preferredTime: "MORNING",
    notes: "",
  });
  const [sitePhoto, setSitePhoto] = useState<File | null>(null);
  const [sitePhotoPreview, setSitePhotoPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  if (!isOpen) return null;

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Disable Sundays
  const isSunday = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getDay() === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast("File must be under 5MB", "error");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      addToast("Only JPG, PNG, WEBP allowed", "error");
      return;
    }

    setSitePhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setSitePhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      addToast("Please enter a valid 10-digit Indian mobile number", "error");
      return;
    }

    // Validate date is not Sunday
    if (isSunday(formData.preferredDate)) {
      addToast("Sundays are not available. Please select another day.", "error");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();

      // Upload site photo if provided
      let sitePhotoUrl = "";
      if (sitePhoto) {
        setUploading(true);
        const fileName = `site-photos/${Date.now()}_${sitePhoto.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, sitePhoto);

        if (uploadError) {
          console.error("Upload error:", uploadError);
          // Continue without photo
        } else {
          const { data: urlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(uploadData.path);
          sitePhotoUrl = urlData.publicUrl;
        }
        setUploading(false);
      }

      // Get current user (optional - might be guest)
      const { data: { user } } = await supabase.auth.getUser();

      // Create ticket
      const { error: ticketError } = await supabase.from("tickets").insert({
        user_id: user?.id || null,
        subject: `Measurement Visit: ${productName}`,
        type: "MEASUREMENT_REQ",
        status: "OPEN",
        priority: "normal",
        metadata: {
          product_name: productName,
          product_id: productId,
          customer_name: formData.name,
          customer_phone: formData.phone,
          site_address: formData.siteAddress,
          pincode: formData.pincode,
          city: formData.city,
          state: formData.state,
          preferred_date: formData.preferredDate,
          preferred_time: formData.preferredTime,
          site_photo_url: sitePhotoUrl,
          notes: formData.notes,
        },
      });

      if (ticketError) throw ticketError;

      setSuccess(true);
      addToast("Measurement visit booked successfully!", "success");
    } catch (err: any) {
      console.error("Booking error:", err);
      addToast(err.message || "Failed to book measurement visit", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Success View
  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center animate-in zoom-in-95 duration-300 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Visit Booked!</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Our measurement specialist will contact you within 24 hours to confirm the visit for{" "}
            <strong className="text-slate-700">{productName}</strong>.
          </p>
          <p className="text-xs text-slate-400 mb-6">A WhatsApp confirmation will follow shortly.</p>
          <Button onClick={onClose} className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 font-bold">
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-slate-100 px-6 py-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Book Site Measurement</h2>
              <p className="text-xs text-slate-500 font-medium">{productName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Your Name *
              </label>
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium"
                placeholder="Full Name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Phone Number *
              </label>
              <input
                required
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })
                }
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium"
                placeholder="10-digit mobile number"
              />
              {formData.phone.length > 0 && !/^[6-9]\d{0,9}$/.test(formData.phone) && (
                <p className="text-xs text-red-500 mt-1 font-medium">Must start with 6-9</p>
              )}
            </div>
          </div>

          {/* Site Address */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              <MapPin className="w-3 h-3 inline mr-1" />
              Site Location *
            </label>
            <textarea
              required
              rows={2}
              value={formData.siteAddress}
              onChange={(e) => setFormData({ ...formData, siteAddress: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium resize-none"
              placeholder="Full site address"
            />
          </div>

          {/* Pincode / City / State */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Pincode *
              </label>
              <input
                required
                maxLength={6}
                inputMode="numeric"
                value={formData.pincode}
                onChange={(e) =>
                  setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "") })
                }
                className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium"
                placeholder="110001"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                City *
              </label>
              <input
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                State *
              </label>
              <input
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium"
                placeholder="State"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                <Calendar className="w-3 h-3 inline mr-1" />
                Preferred Date *
              </label>
              <input
                required
                type="date"
                min={minDate}
                value={formData.preferredDate}
                onChange={(e) => {
                  if (isSunday(e.target.value)) {
                    addToast("Sundays not available", "error");
                    return;
                  }
                  setFormData({ ...formData, preferredDate: e.target.value });
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Preferred Time *
              </label>
              <select
                required
                value={formData.preferredTime}
                onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium bg-white"
              >
                <option value="MORNING">Morning (9 AM - 12 PM)</option>
                <option value="AFTERNOON">Afternoon (12 PM - 3 PM)</option>
                <option value="EVENING">Evening (3 PM - 6 PM)</option>
              </select>
            </div>
          </div>

          {/* Site Photo Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              <Camera className="w-3 h-3 inline mr-1" />
              Site Photo (Recommended)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            {sitePhotoPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img src={sitePhotoPreview} alt="Site" className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setSitePhoto(null);
                    setSitePhotoPreview("");
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
                <div className="absolute bottom-2 left-2 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Photo Ready
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group"
              >
                <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2 group-hover:text-indigo-400 transition-colors" />
                <p className="text-sm font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">
                  Upload site photo
                </p>
                <p className="text-xs text-slate-400 mt-1">JPG, PNG, WEBP — Max 5MB</p>
              </button>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Additional Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all font-medium resize-none"
              placeholder="Any specific requirements or details..."
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={submitting || uploading}
            className="w-full h-14 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-black text-base shadow-xl shadow-indigo-500/20 gap-2 transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {uploading ? "Uploading Photo..." : "Booking..."}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Confirm Measurement Visit
              </>
            )}
          </Button>

          <p className="text-xs text-center text-slate-400">
            Free of charge • Our expert will visit within the selected slot
          </p>
        </form>
      </div>
    </div>
  );
}
