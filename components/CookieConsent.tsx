"use client";

import { useState, useEffect } from "react";
import { X, Cookie, Shield } from "lucide-react";
import Link from "next/link";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const acceptEssential = () => {
    localStorage.setItem("cookie-consent", "essential");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[150] p-4 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0">
            <Cookie className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              We value your privacy
              <Shield className="w-4 h-4 text-blue-600" />
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
              By clicking &quot;Accept All&quot;, you consent to our use of cookies. Read our{" "}
              <Link href="/privacy-policy" className="text-blue-600 font-semibold hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="text-blue-600 font-semibold hover:underline">
                Terms &amp; Conditions
              </Link>
              .
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={acceptAll}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                Accept All
              </button>
              <button
                onClick={acceptEssential}
                className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                Essential Only
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
