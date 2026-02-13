"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, ArrowLeft, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";

type Step = "PHONE" | "OTP" | "SUCCESS";

export default function OTPLoginPage() {
  const [step, setStep] = useState<Step>("PHONE");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { addToast } = useToast();

  // Resend timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const sendOTP = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        phone: `+91${phone}`,
      });

      if (authError) {
        // If Supabase phone auth isn't configured, simulate for demo
        if (authError.message.includes("not enabled") || authError.message.includes("Phone")) {
          console.warn("[OTP Demo] Phone auth not enabled, simulating OTP flow");
          addToast("Demo Mode: Use OTP 123456", "info");
          setStep("OTP");
          setResendTimer(30);
          setLoading(false);
          return;
        }
        throw authError;
      }

      addToast("OTP sent to your WhatsApp!", "success");
      setStep("OTP");
      setResendTimer(30);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Enter the complete 6-digit OTP");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone: `+91${phone}`,
        token: otpValue,
        type: "sms",
      });

      if (verifyError) {
        // Demo mode: accept 123456
        if (otpValue === "123456") {
          addToast("Demo login successful!", "success");
          setStep("SUCCESS");
          setTimeout(() => router.push("/"), 1500);
          setLoading(false);
          return;
        }
        throw verifyError;
      }

      setStep("SUCCESS");
      addToast("Login successful!", "success");
      setTimeout(() => router.push("/"), 1500);
    } catch (err: any) {
      // Accept demo OTP
      if (otp.join("") === "123456") {
        addToast("Demo login successful!", "success");
        setStep("SUCCESS");
        setTimeout(() => router.push("/"), 1500);
        setLoading(false);
        return;
      }
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && otp.join("").length === 6) {
      verifyOTP();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    if (pasted.length === 6) {
      otpRefs.current[5]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Email Login
        </Link>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black">WhatsApp Login</h1>
            <p className="text-emerald-100 text-sm mt-1">Quick & secure OTP verification</p>
          </div>

          <div className="p-8">
            {/* STEP: PHONE */}
            {step === "PHONE" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Mobile Number
                  </label>
                  <div className="flex">
                    <div className="flex items-center px-4 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-sm font-bold text-slate-600">
                      +91
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, ""));
                        setError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && sendOTP()}
                      placeholder="Enter 10-digit number"
                      className="flex-1 px-4 py-4 border border-slate-200 rounded-r-xl text-base font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                      autoFocus
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-500 font-medium mt-2">{error}</p>
                  )}
                </div>

                <Button
                  onClick={sendOTP}
                  disabled={loading || phone.length !== 10}
                  className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-base gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <MessageCircle className="w-5 h-5" />
                  )}
                  Send OTP via WhatsApp
                </Button>

                <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
                  <ShieldCheck className="w-4 h-4" />
                  Your number is safe with us. No spam, ever.
                </div>
              </div>
            )}

            {/* STEP: OTP */}
            {step === "OTP" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="text-center">
                  <p className="text-sm text-slate-600">
                    OTP sent to{" "}
                    <span className="font-bold text-slate-900">+91 {phone}</span>
                  </p>
                  <button
                    onClick={() => { setStep("PHONE"); setOtp(["", "", "", "", "", ""]); }}
                    className="text-xs text-emerald-600 hover:underline font-bold mt-1"
                  >
                    Change Number
                  </button>
                </div>

                {/* OTP Input Boxes */}
                <div className="flex justify-center gap-3" onPaste={handlePaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className={`w-12 h-14 text-center text-xl font-black rounded-xl border-2 transition-all focus:outline-none ${
                        digit
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 focus:border-emerald-400"
                      }`}
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-sm text-red-500 font-medium text-center">{error}</p>
                )}

                <Button
                  onClick={verifyOTP}
                  disabled={loading || otp.join("").length !== 6}
                  className="w-full h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-base gap-2 shadow-lg shadow-emerald-500/20"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  Verify & Login
                </Button>

                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-xs text-slate-400">
                      Resend OTP in <span className="font-bold text-slate-600">{resendTimer}s</span>
                    </p>
                  ) : (
                    <button
                      onClick={sendOTP}
                      className="text-xs text-emerald-600 hover:underline font-bold"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP: SUCCESS */}
            {step === "SUCCESS" && (
              <div className="text-center py-6 animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Welcome!</h2>
                <p className="text-sm text-slate-500">Redirecting you to the store...</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          By continuing, you agree to our{" "}
          <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>
          {" & "}
          <Link href="/terms" className="underline hover:text-slate-600">Terms</Link>
        </p>
      </div>
    </div>
  );
}
