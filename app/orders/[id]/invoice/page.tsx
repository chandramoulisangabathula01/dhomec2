"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { notFound, useParams } from "next/navigation";
import { Printer, MapPin, Phone, Mail, Globe, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function InvoicePage() {
  const { id } = useParams() as { id: string };
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchOrder() {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          ),
          user:profiles (
            full_name,
            email,
            phone
          )
        `)
        .eq("id", id)
        .single();
      
      if (data) setOrder(data);
      setLoading(false);
    }
    fetchOrder();
  }, [id, supabase]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
    );
  }

  if (!order) {
    return notFound();
  }

  let shipping = order.shipping_address || {};
  if (typeof shipping === "string") {
    try {
      shipping = JSON.parse(shipping);
    } catch (e) {
      // ignore
    }
  }
  const items = order.order_items || [];
  const date = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 print:bg-white print:py-0 print:px-0">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Actions Bar - Hidden in Print */}
        <div className="flex justify-between items-center print:hidden">
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-widest">Document Portal</h1>
            <div className="flex gap-3">
                <Button 
                    onClick={() => window.print()} 
                    variant="outline" 
                    className="rounded-xl border-2 font-bold gap-2"
                >
                    <Printer className="w-4 h-4" /> Print Document
                </Button>
            </div>
        </div>

        {/* Invoice Page */}
        <div className="bg-white p-12 sm:p-16 rounded-[40px] shadow-2xl shadow-slate-200 border border-slate-200 print:shadow-none print:border-none print:rounded-none">
          
          {/* Brand Header */}
          <div className="flex flex-col md:flex-row justify-between gap-12 mb-16 border-b border-slate-100 pb-16">
            <div>
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Dhomec</span>
               </div>
               <div className="space-y-1 text-sm font-medium text-slate-500">
                  <p className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> www.dhomec.com</p>
                  <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> support@dhomec.com</p>
               </div>
            </div>
            <div className="text-right">
              <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4 opacity-10">INVOICE</h1>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Order Reference</p>
                <p className="text-xl font-black text-slate-900">#INV-{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm font-bold text-slate-500 mt-2">{date}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
            {/* Bill To */}
            <div className="space-y-6">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                 <div className="w-1.5 h-4 bg-blue-500 rounded-full" /> BILLING RECIPIENT
               </h3>
               <div className="space-y-4">
                  <p className="text-2xl font-black text-slate-900 leading-tight">
                    {shipping.fullName || order.user?.full_name}
                  </p>
                  <div className="space-y-1 text-sm font-medium text-slate-600 leading-relaxed">
                    <p className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-300 mt-0.5" />
                        <span>{shipping.address}, {shipping.city},<br/>{shipping.state} - {shipping.pincode}</span>
                    </p>
                    <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-300" />
                        {shipping.phone || order.user?.phone}
                    </p>
                    <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-300" />
                        {shipping.email || order.user?.email}
                    </p>
                  </div>
               </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-6 md:text-right">
               <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center md:justify-end gap-2">
                 TRANSACTION INTELLIGENCE <div className="w-1.5 h-4 bg-slate-900 rounded-full" />
               </h3>
               <div className="space-y-4">
                  <div>
                    <p className="text-xs font-black uppercase text-slate-400 mb-1">Gateway ID</p>
                    <p className="text-sm font-mono font-bold text-slate-800">{order.razorpay_payment_id || 'INTERNAL_TRANS'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-slate-400 mb-1">Payment Protocol</p>
                    <p className="text-sm font-bold text-slate-800">Razorpay Secure Network</p>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-slate-400 mb-1">Session Verified</p>
                    <p className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-md inline-block">AUTHENTICATED</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-16">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Service / Product Description</th>
                  <th className="py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Quantity</th>
                  <th className="py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Unit Price</th>
                  <th className="py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item: any) => (
                  <tr key={item.id} className="group">
                    <td className="py-8">
                       <p className="font-black text-slate-900 mb-1">{item.product?.name || 'Manual Adjustment'}</p>
                       <p className="text-[10px] text-slate-400 font-mono font-medium uppercase">SKU: {item.product?.id.slice(0, 8).toUpperCase()}</p>
                    </td>
                    <td className="py-8 text-center font-bold text-slate-600">{item.quantity}</td>
                    <td className="py-8 text-right font-bold text-slate-600">₹{item.price_at_purchase?.toLocaleString()}</td>
                    <td className="py-8 text-right font-black text-slate-900">₹{(item.price_at_purchase * item.quantity)?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="flex flex-col md:flex-row justify-between gap-12">
             <div className="max-w-xs">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Terms & Conditions</p>
                <p className="text-[9px] text-slate-400 leading-relaxed font-medium italic">
                    This document is a computer-generated transaction record for Dhom-EC Operations. 
                    Standard warranty applies as per technical specifications of individual units. 
                    Grievances: support@dhomec.com
                </p>
             </div>
             <div className="space-y-4 md:text-right min-w-[240px]">
                <div className="flex justify-between items-center text-sm">
                   <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Net Value</span>
                   <span className="font-black text-slate-900">₹{order.total_amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Tax Allocation (GST)</span>
                   <span className="font-black text-slate-900 italic">Inclusive</span>
                </div>
                <div className="h-px bg-slate-900 my-4" />
                <div className="flex justify-between items-center">
                   <span className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Grand Total</span>
                   <span className="text-3xl font-black text-blue-600 tracking-tighter">₹{order.total_amount?.toLocaleString()}</span>
                </div>
             </div>
          </div>

          {/* Footer Signature */}
          <div className="mt-24 pt-12 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8 opacity-50">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Authentic Digital Sequence Record</p>
             <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-900 uppercase mb-1">Generated By</p>
                    <p className="text-[10px] font-mono font-bold text-slate-500 tracking-tighter">DHOMEC_KERNEL_AUTH</p>
                </div>
                <div className="w-12 h-12 border border-slate-200 rounded-lg flex items-center justify-center bg-slate-50">
                    <div className="w-6 h-6 border-4 border-slate-200 rounded-sm rotate-45" />
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
