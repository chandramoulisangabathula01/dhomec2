"use client";

import { useState, useEffect, Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Loader2, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  Briefcase, 
  Contact, 
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Globe
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";

function EnquiryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const productName = searchParams.get('product') || "";
  const enquiryType = searchParams.get('type') || "";
  const isMeasurement = enquiryType === 'measurement';
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
      name: "",
      phone: "",
      company: "",
      preferred_date: "",
      site_photos: [] as File[],
      message: isMeasurement 
        ? `I would like to book a professional measurement for ${productName || 'this product'}. Please contact me to schedule a visit.`
        : (productName ? `Consultation regarding ${productName}` : "")
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (productName || enquiryType) {
        setFormData(prev => ({ 
            ...prev, 
            message: isMeasurement 
                ? `I would like to book a professional measurement for ${productName || 'this product'}. Please contact me to schedule a visit.`
                : (productName ? `Consultation regarding ${productName}` : prev.message)
        }));
    }
  }, [productName, enquiryType, isMeasurement]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          setFormData(prev => ({ ...prev, site_photos: Array.from(e.target.files!) }));
      }
  };

  const uploadFiles = async (files: File[]) => {
      const urls: string[] = [];
      for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${fileName}`;
          
          const { error: uploadError } = await supabase.storage
              .from('enquiry-attachments')
              .upload(filePath, file);

          if (uploadError) {
              console.error("Error uploading file:", uploadError);
              continue; 
          }

          const { data: { publicUrl } } = supabase.storage.from('enquiry-attachments').getPublicUrl(filePath);
          urls.push(publicUrl);
      }
      return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
          // Upload Files First
          setUploading(true);
          const photoUrls = await uploadFiles(formData.site_photos);
          setUploading(false);

          // Check if user is logged in to associate user_id if possible
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
             // Authenticated: Create a Support Ticket directly
             const { error: ticketError } = await supabase
              .from('tickets')
              .insert([{
                  user_id: user.id,
                  type: isMeasurement ? 'MEASUREMENT_REQ' : 'GENERAL_QUERY',
                  subject: isMeasurement ? `Measurement Request: ${productName}` : (formData.company ? `B2B Enquiry from ${formData.company}` : `Enquiry: ${formData.name}`),
                  status: 'OPEN',
                  priority: isMeasurement ? 'high' : 'normal',
                  metadata: {
                      phone: formData.phone,
                      company: formData.company,
                      product_interest: productName,
                      initial_message: formData.message,
                      preferred_date: formData.preferred_date,
                      site_photos: photoUrls
                  }
              }]);
             if (ticketError) throw ticketError;
          } else {
             // Guest: Create standard enquiry
             // Append metadata to message for Guest Enquiries as schema might not support metadata column yet
             let enhancedMessage = formData.message || "";
             if (formData.preferred_date) enhancedMessage += `\n\n[Preferred Date: ${formData.preferred_date}]`;
             if (photoUrls.length > 0) enhancedMessage += `\n\n[Site Photos]:\n${photoUrls.join('\n')}`;

             const { error: insertError } = await supabase
              .from('enquiries')
              .insert([{
                  user_id: null,
                  name: formData.name,
                  phone: formData.phone,
                  company: formData.company || null,
                  message: enhancedMessage,
                  product_interest: productName || null,
                  status: 'new',
                  subject: isMeasurement ? `[MEASUREMENT] ${productName}` : `[WEB] ${formData.name}`
              }]);
             if (insertError) throw insertError;
          }



          setSuccess(true);
          setFormData({ name: "", phone: "", company: "", message: "", preferred_date: "", site_photos: [] });
          
          // Smooth scroll to top to see success message
          window.scrollTo({ top: 0, behavior: 'smooth' });

          // Redirect to dashboard after a delay if logged in
          if (user) {
              setTimeout(() => {
                  router.push('/dashboard');
              }, 6000);
          }

      } catch (err: any) {
          console.error("Error submitting enquiry:", err);
          setError(err.message || "Protocol communication failure. Please retry.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header />

      <main className="flex-1 overflow-hidden">
         {/* Hero Section */}
         <section className="relative py-20 bg-slate-900 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -mr-64 -mt-64" />
            
            <div className="container-width relative z-10 px-4">
                <div className="max-w-3xl">
                     <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
                        <Sparkles className="w-3 h-3" />
                        Professional Consultation
                     </div>
                     <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {isMeasurement ? 'Precision' : 'Strategic'} <span className="text-blue-500 italic">{isMeasurement ? 'Fitting.' : 'Excellence.'}</span><br/>
                        {isMeasurement ? 'Book Measurement.' : 'Request Consultation.'}
                     </h1>
                     <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
                        Connect with our engineering team for high-level infrastructure solutions and product specifications. Most sequences are processed within 120 minutes.
                     </p>
                </div>
            </div>
         </section>

         <div className="container-width px-4 py-20 -mt-12 relative z-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                
                {/* Information Sidebar */}
                <div className="space-y-8">
                    <div className="bg-slate-50 p-10 rounded-[40px] border border-slate-100 space-y-10 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-blue-500" />
                            CONSULTATION PROTOCOLS
                        </h3>
                        
                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                                    <Clock className="w-5 h-5 text-slate-900" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Response Latency</p>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Average confirmation window is 2.4 hours during standard operational cycles.</p>
                                </div>
                            </div>
                            
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                                    <Briefcase className="w-5 h-5 text-slate-900" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Corporate Triage</p>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Bulk procurement and B2B requirements receive high-priority routing.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                                    <Globe className="w-5 h-5 text-slate-900" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Global Coverage</p>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Providing consultation for infrastructure projects across the region.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-10 border-t border-slate-200">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Current Interest</p>
                             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                                    <MessageSquare className="w-4 h-4 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-black text-slate-900 mb-0.5 uppercase tracking-tighter truncate">
                                        {productName || "General Consultation"}
                                    </p>
                                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Active Selector</p>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="lg:col-span-2 bg-white p-8 md:p-16 rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-100">
                    {success ? (
                         <div className="text-center py-20 space-y-6 animate-in fade-in zoom-in duration-700">
                            <div className="w-24 h-24 bg-green-50 rounded-[32px] flex items-center justify-center mx-auto border border-green-100 shadow-lg shadow-green-50">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-slate-900">Enquiry Transmitted.</h2>
                                <p className="text-slate-500 font-medium">Your sequence has been logged in our central register. Stay alert for a communication ping.</p>
                            </div>
                            <Link href="/">
                                <Button className="mt-8 rounded-2xl bg-slate-900 text-white h-14 px-10 font-black uppercase tracking-widest text-xs">
                                    Return to Home <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                         </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-12">
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Full Identity Vector</label>
                                        <div className="relative group">
                                            <Contact className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                            <input 
                                                required
                                                type="text"
                                                placeholder="e.g. Victor Engineering"
                                                value={formData.name}
                                                onChange={e => setFormData({...formData, name: e.target.value})}
                                                className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-3xl pl-14 pr-6 font-bold text-slate-900 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Secure Contact Sequence</label>
                                        <div className="relative group">
                                            <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                            <input 
                                                required
                                                type="tel"
                                                placeholder="+91 000 000 0000"
                                                value={formData.phone}
                                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                                className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-3xl pl-14 pr-6 font-bold text-slate-900 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="relative group">
                                        <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                                        <input 
                                            type="text"
                                            placeholder="Company Name"
                                            value={formData.company}
                                            onChange={e => setFormData({...formData, company: e.target.value})}
                                            className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-3xl pl-14 pr-6 font-bold text-slate-900 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Preferred Date</label>
                                        <div className="relative group">
                                            <input 
                                                type="date"
                                                value={formData.preferred_date}
                                                onChange={e => setFormData({...formData, preferred_date: e.target.value})}
                                                className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-3xl px-6 font-bold text-slate-900 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Site Photos (Optional)</label>
                                        <div className="relative group">
                                            <input 
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="w-full h-16 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-3xl px-6 py-4 font-bold text-slate-900 transition-all outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                            {formData.site_photos.length > 0 && (
                                                <p className="absolute -bottom-6 left-2 text-[10px] text-slate-400 font-bold">{formData.site_photos.length} files selected</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Consultation Requirements</label>
                                    <textarea 
                                        rows={4}
                                        required
                                        placeholder="Outline your strategic requirements here..."
                                        value={formData.message}
                                        onChange={e => setFormData({...formData, message: e.target.value})}
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-3xl p-6 font-bold text-slate-900 transition-all outline-none resize-none"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
                                    <ShieldCheck className="w-5 h-5" />
                                    <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
                                </div>
                            )}

                            <div className="pt-6 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4 text-slate-400">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Gateway Verified</span>
                                </div>
                                <Button 
                                    disabled={loading}
                                    className="w-full md:w-auto h-16 px-12 bg-slate-900 hover:bg-black text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 gap-3"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    {loading ? "Transmitting..." : "Initiate Consultation"}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
         </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function Enquiry() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6 text-white font-black uppercase tracking-[0.3em] text-xs">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            Authenticating Environment...
        </div>
    }>
      <EnquiryContent />
    </Suspense>
  );
}

