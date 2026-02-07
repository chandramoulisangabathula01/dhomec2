"use client";

import { useState, useEffect, Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

function EnquiryContent() {
  const searchParams = useSearchParams();
// ... existing imports

  const productName = searchParams.get('product') || "";
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
      name: "",
      phone: "",
      company: "",
      message: productName ? `I'm interested in ${productName}` : ""
  });

  // Focus name on mount
  useEffect(() => {
     const input = document.getElementById("name");
     if (input) input.focus();
  }, []);

  useEffect(() => {
    if (productName) {
        setFormData(prev => ({ ...prev, message: `I'm interested in ${productName}` }));
    }
  }, [productName]);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
          const { error: insertError } = await supabase
              .from('enquiries')
              .insert([{
                  name: formData.name,
                  phone: formData.phone,
                  company: formData.company || null,
                  message: formData.message || null,
                  product_interest: productName || null,
                  status: 'new'
              }]);

          if (insertError) throw insertError;

          setSuccess(true);
          // Reset form
          setFormData({
              name: "",
              phone: "",
              company: "",
              message: ""
          });

          // Auto-hide success message after 5 seconds
          setTimeout(() => setSuccess(false), 5000);

      } catch (err: any) {
          console.error("Error submitting enquiry:", err);
          setError(err.message || "Failed to submit enquiry. Please try again.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="md:hidden p-4 border-b bg-white sticky top-0 z-40 flex items-center gap-4 shadow-sm">
         <Link href="/"><ArrowLeft className="h-6 w-6 text-slate-600" /></Link>
         <span className="font-bold text-lg text-[var(--color-brand-dark)]">Request Enquiry</span>
      </div>
      
      <div className="hidden md:block">
         <Header />
      </div>

      <main className="flex-1 container-width py-8 md:py-16">
         <div className="max-w-xl mx-auto bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-slate-100">
             <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-brand-dark)] mb-2">Get a Quote</h1>
             <p className="text-slate-500 mb-8">Tell us about your requirement. Usually responds in 2 hours.</p>

             {error && (
                 <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                     <span className="font-bold">⚠️ Error:</span> {error}
                 </div>
             )}

             {success && (
                 <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-lg text-sm border border-green-100 font-bold">
                     ✅ Thank you! Your enquiry has been submitted. We'll contact you within 2 hours.
                 </div>
             )}

             <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="name">Full Name</label>
                   <input
                       id="name" 
                       required 
                       type="text" 
                       className="block w-full rounded-lg border-slate-300 py-3 px-4 text-base focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-slate-50 outline-none border hover:border-[var(--color-primary)] transition-colors"
                       placeholder="e.g. Rahul Sharma"
                       value={formData.name}
                       onChange={e => setFormData({...formData, name: e.target.value})}
                   />
                </div>
                
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="phone">Phone Number</label>
                   <input 
                       id="phone"
                       required 
                       type="tel" 
                       className="block w-full rounded-lg border-slate-300 py-3 px-4 text-base focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-slate-50 outline-none border hover:border-[var(--color-primary)] transition-colors"
                       placeholder="+91 98765 43210"
                       value={formData.phone}
                       onChange={e => setFormData({...formData, phone: e.target.value})}
                   />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="company">Company Name</label>
                   <input 
                       id="company"
                       type="text" 
                       className="block w-full rounded-lg border-slate-300 py-3 px-4 text-base focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-slate-50 outline-none border hover:border-[var(--color-primary)] transition-colors"
                       placeholder="Your Company"
                       value={formData.company}
                       onChange={e => setFormData({...formData, company: e.target.value})}
                   />
                </div>
                
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="message">Requirements</label>
                   <textarea 
                       id="message"
                       rows={3} 
                       className="block w-full rounded-lg border-slate-300 py-3 px-4 text-base focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] bg-slate-50 outline-none border hover:border-[var(--color-primary)] transition-colors resize-none"
                       placeholder="I'm interested in..."
                       value={formData.message}
                       onChange={e => setFormData({...formData, message: e.target.value})}
                   />
                </div>

                <div className="pt-4">
                   <Button size="lg" className="w-full text-lg h-14 font-bold" type="submit" disabled={loading}>
                      {loading ? (
                          <>
                              <Loader2 className="h-5 w-5 animate-spin mr-2" />
                              Submitting...
                          </>
                      ) : (
                          "Send Enquiry"
                      )}
                   </Button>
                   <p className="text-xs text-center text-slate-400 mt-4">
                      By submitting, you agree to our privacy policy.
                   </p>
                </div>
             </form>
         </div>
      </main>
      
      <div className="hidden md:block">
         <Footer />
      </div>
    </div>
  );
}

export default function Enquiry() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <EnquiryContent />
    </Suspense>
  );
}
