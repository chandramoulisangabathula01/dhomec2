import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { getOrderById } from "@/app/actions/orders";

export default async function OrderInvoice({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // 1. Validate Auth & Role
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return notFound();

  // 2. Fetch Order
  const order = await getOrderById(id);
  if (!order) return notFound();

  // 3. Render Clean HTML for Print
  const invoiceDate = new Date(order.created_at).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
  });

  const subtotal = order.total_amount / 1.18;
  const taxes = (order as any).tax_breakdown || {
    cgst: (order.total_amount - subtotal) / 2,
    sgst: (order.total_amount - subtotal) / 2
  };

  return (
    <div className="bg-white min-h-screen p-8 md:p-16 text-slate-900 font-sans print:p-0 relative">
       <style>{`
          @media print {
            @page { margin: 2cm; }
            body { -webkit-print-color-adjust: exact; }
          }
       `}</style>
       
       <div className="max-w-3xl mx-auto border border-slate-200 p-8 md:p-12 shadow-sm print:shadow-none print:border-0">
           
           {/* Header */}
           <div className="flex justify-between items-start mb-12">
               <div>
                   <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">INVOICE</h1>
                   <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">#{order.id.slice(0,8).toUpperCase()}</p>
                   <p className="text-xs text-slate-400 mt-1">{invoiceDate}</p>
               </div>
               <div className="text-right">
                   <h2 className="text-2xl font-bold text-slate-900">Dhomec Industries</h2>
                   <p className="text-xs text-slate-500 mt-1">123 Industrial Area, Phase 2</p>
                   <p className="text-xs text-slate-500">Bangalore, KA 560001</p>
                   <p className="text-xs text-slate-500">GSTIN: 29ABCDE1234F1Z5</p>
               </div>
           </div>

           {/* Bill To / Ship To */}
           <div className="grid grid-cols-2 gap-12 mb-12">
               <div>
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-2">Billed To</h3>
                   <div className="text-sm font-medium text-slate-700 space-y-1">
                       <p className="font-bold text-slate-900 text-base">{order.billing_address?.fullName || order.profile?.full_name}</p>
                       <p>{order.billing_address?.company}</p>
                       <p>{order.billing_address?.address}</p>
                       <p>{order.billing_address?.city}, {order.billing_address?.state} - {order.billing_address?.pincode}</p>
                       <p>{order.billing_address?.phone}</p>
                       {order.billing_address?.gstin && <p className="font-mono text-[10px] mt-1 text-slate-500 font-bold uppercase">GSTIN: {order.billing_address.gstin}</p>}
                   </div>
               </div>
               <div>
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-2">Shipped To</h3>
                    <div className="text-sm font-medium text-slate-700 space-y-1">
                       <p className="font-bold text-slate-900 text-base">{order.shipping_address?.fullName}</p>
                       <p>{order.shipping_address?.company}</p>
                       <p>{order.shipping_address?.address}</p>
                       <p>{order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}</p>
                       <p>{order.shipping_address?.phone}</p>
                   </div>
               </div>
           </div>

           {/* Line Items */}
           <div className="mb-12">
               <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b border-slate-200">
                       <tr>
                           <th className="py-3 px-4 font-black text-[10px] uppercase tracking-widest text-slate-500">Item Description</th>
                           <th className="py-3 px-4 font-black text-[10px] uppercase tracking-widest text-slate-500 text-right">HSN</th>
                           <th className="py-3 px-4 font-black text-[10px] uppercase tracking-widest text-slate-500 text-right">Qty</th>
                           <th className="py-3 px-4 font-black text-[10px] uppercase tracking-widest text-slate-500 text-right">Unit Price</th>
                           <th className="py-3 px-4 font-black text-[10px] uppercase tracking-widest text-slate-500 text-right">Total</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 text-sm">
                       {order.order_items.map((item: any, idx: number) => (
                           <tr key={idx}>
                               <td className="py-4 px-4 font-bold text-slate-700">
                                   {item.products?.name}
                                   <div className="text-xs font-normal text-slate-400 mt-0.5">{item.products?.slug?.toUpperCase()}</div>
                               </td>
                               <td className="py-4 px-4 text-slate-500 text-right font-mono text-xs">{(item.products as any)?.hsn_code || '8428'}</td>
                               <td className="py-4 px-4 text-slate-700 text-right">{item.quantity}</td>
                               <td className="py-4 px-4 text-slate-700 text-right">₹{(item.price_at_purchase / 1.18).toFixed(2)}</td>
                               <td className="py-4 px-4 font-bold text-slate-900 text-right">₹{((item.price_at_purchase / 1.18) * item.quantity).toFixed(2)}</td>
                           </tr>
                       ))}
                   </tbody>
               </table>
           </div>

           {/* Totals */}
           <div className="flex justify-end mb-12">
               <div className="w-64 space-y-3">
                   <div className="flex justify-between text-sm text-slate-500">
                       <span>Subtotal (Excl. Tax)</span>
                       <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-sm text-slate-500">
                       <span>CGST (9%)</span>
                       <span className="font-medium">₹{taxes.cgst.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-sm text-slate-500">
                       <span>SGST (9%)</span>
                       <span className="font-medium">₹{taxes.sgst.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-base font-black text-slate-900 pt-4 border-t border-slate-200 border-dashed">
                       <span>Grand Total</span>
                       <span>₹{order.total_amount.toFixed(2)}</span>
                   </div>
               </div>
           </div>

           {/* Footer */}
           <div className="border-t border-slate-200 pt-8 text-center text-xs text-slate-400">
               <p className="font-bold text-slate-500 uppercase tracking-widest mb-2">Thank you for your business</p>
               <p>This is a computer generated invoice and does not require a signature.</p>
               <p className="mt-1">Dhomec Industries &copy; {new Date().getFullYear()}</p>
           </div>
       </div>
       
       <div className="fixed bottom-8 right-8 print:hidden">
           <button 
             id="print-btn"
             className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all cursor-pointer"
           >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Invoice
           </button>
       </div>
       <script dangerouslySetInnerHTML={{__html: `
          document.getElementById('print-btn').addEventListener('click', () => window.print());
       `}} />
    </div>
  );
}
