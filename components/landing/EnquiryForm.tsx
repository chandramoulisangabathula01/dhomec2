"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function EnquiryForm({ className }: { className?: string }) {
  const [formData, setFormData] = useState({
    name: "", phone: "", company: "", email: "", message: ""
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const { error } = await supabase.from('enquiries').insert({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        subject: `Company: ${formData.company}`,
        message: formData.message,
        source: 'landing_page'
      });
      if (error) throw error;
      setStatus('success');
      setFormData({ name: "", phone: "", company: "", email: "", message: "" });
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const inputClasses = "flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20 focus-visible:border-red-300 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200";

  return (
    <section ref={ref} id="contact" className={cn("py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden", className)}>
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-red-50/50 to-transparent rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      
      <div className="container-width max-w-4xl relative">
        <motion.div 
          className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
            {/* Background accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-red-50/50 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div className="text-center mb-10 relative">
                <span className="inline-block px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider mb-4">
                  Get In Touch
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Request an Enquiry</h2>
                <p className="text-slate-500 text-lg">
                    Fill out the form below and our engineering team will get back to you within 24 hours.
                </p>
            </div>

            {status === 'success' ? (
              <motion.div 
                className="py-16 flex flex-col items-center gap-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Thank You!</h3>
                <p className="text-slate-500 text-center max-w-md">Your enquiry has been submitted successfully. We&apos;ll get back to you within 24 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Full Name</label>
                        <input 
                          placeholder="John Doe" 
                          className={inputClasses}
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                        <input 
                          placeholder="+91 98765 43210" 
                          className={inputClasses}
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Company Name</label>
                        <input 
                          placeholder="Your Company Ltd" 
                          className={inputClasses}
                          value={formData.company}
                          onChange={(e) => setFormData({...formData, company: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Email Address</label>
                        <input 
                          placeholder="john@example.com" 
                          type="email" 
                          className={inputClasses}
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Requirement Details</label>
                    <textarea 
                        placeholder="Please describe your project requirements..." 
                        className={cn(inputClasses, "min-h-[130px] py-3")}
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        required
                    />
                </div>

                <Button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full h-14 bg-[#D92D20] hover:bg-[#b02419] text-white text-lg font-semibold rounded-xl shadow-lg shadow-red-600/20 transition-all hover:shadow-xl hover:shadow-red-600/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                    {status === 'loading' ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</>
                    ) : status === 'error' ? (
                      'Something went wrong. Try again.'
                    ) : (
                      <><Send className="mr-2 h-5 w-5" /> Send Enquiry</>
                    )}
                </Button>
              </form>
            )}
        </motion.div>
      </div>
    </section>
  );
}
