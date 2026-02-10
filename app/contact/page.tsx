"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { FooterModern } from "@/components/landing/FooterModern";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { companyInfo } from "@/lib/data/footer";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "Sales Enquiry",
    message: ""
  });

  const supabase = createClient();

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
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          status: 'new'
        }]);

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData({
        name: "",
        phone: "",
        email: "",
        subject: "Sales Enquiry",
        message: ""
      });
    } catch (err: any) {
      console.error("Contact form error:", err);
      setError(err.message || "Failed to transmit message. Technical interference detected.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 -z-0 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="container-width relative z-10 text-center">
                <span className="text-red-500 font-bold tracking-widest uppercase text-sm mb-4 block">Get in Touch</span>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                    Have a project in mind or need technical support? Reach out to our team of experts.
                </p>
            </div>
        </section>

        <section className="py-20">
            <div className="container-width grid lg:grid-cols-3 gap-12">
                
                {/* Contact Information */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-lg">
                        <h3 className="text-xl font-bold mb-6">Contact Information</h3>
                        
                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="bg-red-50 p-3 rounded-lg mr-4">
                                    <MapPin className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Our Office</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        {companyInfo.address.line1}<br />
                                        {companyInfo.address.line2}<br />
                                        {companyInfo.address.line3}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-red-50 p-3 rounded-lg mr-4">
                                    <Phone className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Phone</h4>
                                    <p className="text-slate-600 text-sm">
                                        {companyInfo.contact.phone}<br />
                                        +91 40 1234 5678
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-red-50 p-3 rounded-lg mr-4">
                                    <Mail className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Email</h4>
                                    <p className="text-slate-600 text-sm">
                                        {companyInfo.contact.email}<br />
                                        support@dhomec.com
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-red-50 p-3 rounded-lg mr-4">
                                    <Clock className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 mb-1">Business Hours</h4>
                                    <p className="text-slate-600 text-sm">
                                        Mon - Sat: 9:00 AM - 7:00 PM<br />
                                        Sunday: Closed
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Google Map */}
                    <div className="bg-slate-100 w-full h-64 rounded-xl overflow-hidden border border-slate-200 relative">
                        {/* Placeholder for Map - In production use an iframe */}
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
                             <span className="text-slate-500 font-medium flex items-center">
                                <MapPin className="h-5 w-5 mr-2" /> Google Map Embed
                             </span>
                        </div>
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15224.997576269!2d78.4027781!3d17.4482935!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9158f201b205%3A0x11bbe7be7792411b!2sJubilee%20Hills%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            className="grayscale hover:grayscale-0 transition-all duration-500 opacity-80 hover:opacity-100"
                        ></iframe>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-8 md:p-10 rounded-xl border border-slate-100 shadow-xl">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a Message</h2>
                        
                        {success && (
                            <div className="mb-8 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 animate-in fade-in zoom-in">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                <div>
                                    <h4 className="font-bold text-emerald-900">Message Transmitted</h4>
                                    <p className="text-sm text-emerald-700">Protocol successful. Our agents will synchronize with you shortly.</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-8 p-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 animate-in fade-in zoom-in">
                                <AlertCircle className="w-8 h-8 text-rose-600" />
                                <div>
                                    <h4 className="font-bold text-rose-900">Transmission Error</h4>
                                    <p className="text-sm text-rose-700">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Full Name</label>
                                    <input 
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        placeholder="John Doe" 
                                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Phone Number</label>
                                    <input 
                                        required
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({...formData, phone: e.target.value})}
                                        placeholder="+91 98765 43210" 
                                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Email Address</label>
                                    <input 
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        placeholder="john@example.com" 
                                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Subject</label>
                                    <select 
                                        value={formData.subject}
                                        onChange={e => setFormData({...formData, subject: e.target.value})}
                                        className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                    >
                                        <option>Sales Enquiry</option>
                                        <option>Technical Support</option>
                                        <option>Partnership</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Message</label>
                                <textarea 
                                    required
                                    value={formData.message}
                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                    placeholder="How can we help you?" 
                                    className="flex min-h-[120px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none" 
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#D92D20] hover:bg-[#b02419] text-white h-14 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg shadow-red-600/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                {loading ? "Transmitting..." : "Send Message"}
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </section>

        {/* Support Banner */}
        <section className="bg-red-600 py-16 text-white">
            <div className="container-width flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div>
                     <h2 className="text-2xl font-bold mb-2">Need Immediate Support?</h2>
                     <p className="text-red-100 max-w-xl">
                        Our technical team is available for emergency breakdown support. 
                        Contact our dedicated support line.
                     </p>
                </div>
                <button className="bg-white text-red-600 px-8 py-4 rounded-sm font-bold hover:bg-red-50 transition-colors shadow-lg flex items-center">
                    <Phone className="h-5 w-5 mr-2" /> Call Support Now
                </button>
            </div>
        </section>
      </main>
      
      <FooterModern />
    </div>
  );
}
