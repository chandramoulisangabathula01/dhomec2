"use client";

import { useState, useEffect } from "react";
import { updateOrderStatus } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Package, 
  MapPin, 
  CreditCard, 
  ArrowLeft, 
  Loader2, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  ChevronRight,
  ExternalLink,
  Printer,
  ChevronDown
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Order, OrderStatus, OrderItem } from "@/types";

interface OrderDetailsProps {
  order: Order;
  history: any[]; // order_status_history entries
}

const STATUS_CONFIG: Record<OrderStatus, { label: string, color: string, icon: any }> = {
  PENDING_PAYMENT: { label: 'Payment Pending', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  PLACED: { label: 'New Order', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Package },
  ACCEPTED: { label: 'In Processing', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: CheckCircle2 },
  PACKED: { label: 'Ready for Dispatch', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Package },
  SHIPPED: { label: 'In Transit', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Truck },
  DELIVERED: { label: 'Fulfilled', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: AlertCircle },
  RETURN_REQUESTED: { label: 'Return Req', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertCircle },
  RETURN_APPROVED: { label: 'Return Auth', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: CheckCircle2 },
  RETURN_REJECTED: { label: 'Return Denied', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: AlertCircle },
  REFUNDED: { label: 'Refunded', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: CreditCard }
};

const validTransitions: Record<OrderStatus, { next: OrderStatus | null, label: string }[]> = {
  PENDING_PAYMENT: [{ next: 'PLACED', label: 'Manual Confirm Payment' }, { next: 'CANCELLED', label: 'Void Order' }],
  PLACED: [{ next: 'ACCEPTED', label: 'Accept & Process' }, { next: 'CANCELLED', label: 'Cancel Order' }],
  ACCEPTED: [{ next: 'PACKED', label: 'Mark as Ready/Packed' }, { next: 'CANCELLED', label: 'Cancel Order' }],
  PACKED: [{ next: 'SHIPPED', label: 'Dispatch/Ship' }, { next: 'CANCELLED', label: 'Cancel Order' }],
  SHIPPED: [{ next: 'DELIVERED', label: 'Confirm Delivery' }],
  DELIVERED: [{ next: 'RETURN_REQUESTED', label: 'Authorize Return' }],
  CANCELLED: [],
  RETURN_REQUESTED: [{ next: 'RETURN_APPROVED', label: 'Approve Return' }, { next: 'RETURN_REJECTED', label: 'Reject Return' }, { next: 'REFUNDED', label: 'Issue Refund' }],
  RETURN_APPROVED: [{ next: 'REFUNDED', label: 'Issue Refund' }],
  RETURN_REJECTED: [],
  REFUNDED: []
};

export default function OrderDetails({ order: initialOrder, history }: OrderDetailsProps) {
  const router = useRouter();
  const [order, setOrder] = useState<Order>(initialOrder);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  const currentStatus = order.status;
  const config = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.PLACED;
  const StatusIcon = config.icon;

  /* Shipping Logic */
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [shippingDetails, setShippingDetails] = useState({
      provider: 'MANUAL',
      awb_code: '',
      tracking_url: '',
      shipped_date: new Date().toISOString().split('T')[0]
  });

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    // Intercept Shipping
    if (newStatus === 'SHIPPED') {
        setShowShippingModal(true);
        return;
    }

    if (!confirm(`Switch order status to ${newStatus}?`)) return;
    performUpdate(newStatus);
  };

  const performUpdate = async (newStatus: OrderStatus, extraData?: any) => {
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus, extraData);
      setOrder(prev => ({ 
          ...prev, 
          status: newStatus, 
          updated_at: new Date().toISOString(),
          shipping_info: extraData || prev.shipping_info
      }));
      setShowShippingModal(false);
      router.refresh(); 
    } catch (error: any) {
      alert(error.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const submitShipping = (e: React.FormEvent) => {
      e.preventDefault();
      performUpdate('SHIPPED', shippingDetails);
  };

  const shippingAddress = order.shipping_address;
  const items = order.order_items || order.items || [];
  const nextActions = validTransitions[currentStatus] || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-in fade-in duration-700 relative">
      
      {/* Shipping Modal Overlay */}
      {showShippingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5">
                      <Truck className="w-32 h-32" />
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1 relative z-10">Dispatch Order</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 relative z-10">Enter Logistics Details</p>

                  <form onSubmit={submitShipping} className="space-y-4 relative z-10">
                      <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Logistics Provider</label>
                          <select 
                            className="w-full h-10 rounded-xl border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 focus:ring-blue-500 focus:border-blue-500"
                            value={shippingDetails.provider}
                            onChange={(e) => setShippingDetails({...shippingDetails, provider: e.target.value})}
                          >
                              <option value="MANUAL">Manual / Private Courier</option>
                              <option value="DELHIVERY">Delhivery</option>
                              <option value="SHIPROCKET">Shiprocket</option>
                              <option value="DTDC">DTDC</option>
                              <option value="BLUEDART">Blue Dart</option>
                          </select>
                      </div>

                      <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">AWB / Tracking Number</label>
                          <input 
                              required
                              type="text"
                              className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-bold text-slate-900 placeholder:font-medium placeholder:text-slate-300"
                              placeholder="e.g. 1234567890"
                              value={shippingDetails.awb_code}
                              onChange={(e) => setShippingDetails({...shippingDetails, awb_code: e.target.value})}
                          />
                      </div>

                      <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Tracking URL (Optional)</label>
                          <input 
                              type="url"
                              className="w-full h-10 px-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-bold text-slate-900 placeholder:font-medium placeholder:text-slate-300"
                              placeholder="https://track.courier.com/..."
                              value={shippingDetails.tracking_url}
                              onChange={(e) => setShippingDetails({...shippingDetails, tracking_url: e.target.value})}
                          />
                      </div>

                      <div className="pt-4 flex gap-3">
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="flex-1 rounded-xl font-bold h-11"
                            onClick={() => setShowShippingModal(false)}
                          >
                              Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={updating}
                            className="flex-1 rounded-xl font-bold h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                          >
                              {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Truck className="w-4 h-4 mr-2" />}
                              Confirm Dispatch
                          </Button>
                      </div>
                  </form>
              </div>
          </div>
      )}
      
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 z-0" />
        
        <div className="relative z-10 flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl bg-slate-50 hover:bg-slate-100 h-14 w-14 shrink-0 border border-slate-100 transition-all">
                <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">#{order.id.slice(0, 8).toUpperCase()}</h1>
                <div className={`px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest flex items-center gap-2 ${config.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {config.label}
                </div>
            </div>
            <div className="flex items-center gap-3 text-slate-400 font-bold text-[11px] uppercase tracking-wider">
               <Calendar className="w-3.5 h-3.5" />
               {new Date(order.created_at).toLocaleString('en-IN', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
             <Link href={`/orders/${order.id}/invoice`} target="_blank">
               <Button variant="outline" className="rounded-2xl font-black text-[11px] uppercase tracking-widest h-14 px-6 border-2 border-slate-100 hover:bg-slate-50 gap-2">
                   <Printer className="w-4 h-4" />
                   Invoicing
               </Button>
             </Link>
             
             <div className="flex gap-2 p-1.5 bg-slate-900 rounded-[22px] shadow-lg shadow-slate-200">
                {nextActions.map((action, idx) => (
                    <Button 
                        key={idx}
                        onClick={() => handleStatusUpdate(action.next as OrderStatus)}
                        disabled={updating}
                        className={`rounded-[18px] font-black text-[11px] uppercase tracking-widest h-11 px-6 transition-all ${
                            action.next === 'CANCELLED' ? 'bg-transparent text-rose-400 hover:bg-rose-500/10' : 'bg-blue-600 text-white hover:bg-blue-500'
                        }`}
                    >
                        {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : null}
                        {action.label}
                    </Button>
                ))}
                {nextActions.length === 0 && (
                     <div className="px-6 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Process Concluded
                     </div>
                )}
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main Operational Data */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Fulfillment Progress */}
            <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin-slow" />
                        Fulfillment Sequence
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Active Thread</span>
                    </div>
                </div>

                <div className="relative pt-2 pb-6">
                    {/* Background line */}
                    <div className="absolute top-[37px] left-0 w-full h-[3px] bg-slate-100 z-0 rounded-full" />
                    
                    {/* Progress line */}
                    <div 
                        className="absolute top-[37px] left-0 h-[3px] bg-blue-500 z-10 rounded-full transition-all duration-[1200ms] shadow-sm shadow-blue-200"
                        style={{ width: `${Math.min((['PLACED', 'ACCEPTED', 'PACKED', 'SHIPPED', 'DELIVERED'].indexOf(order.status) / 4) * 100, 100)}%` }}
                    />

                    <div className="relative z-20 flex justify-between">
                        {['PLACED', 'ACCEPTED', 'PACKED', 'SHIPPED', 'DELIVERED'].map((s, idx) => {
                            const stepIdx = ['PLACED', 'ACCEPTED', 'PACKED', 'SHIPPED', 'DELIVERED'].indexOf(s);
                            const currentIdx = ['PENDING_PAYMENT', 'PLACED', 'ACCEPTED', 'PACKED', 'SHIPPED', 'DELIVERED'].indexOf(order.status);
                            const isCompleted = currentIdx > ['PENDING_PAYMENT', 'PLACED', 'ACCEPTED', 'PACKED', 'SHIPPED', 'DELIVERED'].indexOf(s);
                            const isCurrent = order.status === s;
                            
                            return (
                                <div key={s} className="flex flex-col items-center gap-5">
                                    <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center transition-all duration-700 ${
                                        isCurrent ? 'bg-white border-blue-500 ring-8 ring-blue-50 scale-110' :
                                        isCompleted ? 'bg-blue-500 border-blue-500' : 
                                        'bg-white border-slate-50'
                                    }`}>
                                        {isCompleted ? <CheckCircle2 className="w-4 h-4 text-white" /> : <div className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-blue-500 animate-pulse' : 'bg-slate-200'}`} />}
                                    </div>
                                    <div className="text-center w-0">
                                        <p className={`whitespace-nowrap -translate-x-1/2 text-[9px] font-black uppercase tracking-tighter ${isCurrent ? 'text-blue-600 scale-110 opacity-100' : isCompleted ? 'text-slate-900' : 'text-slate-300'}`}>
                                            {STATUS_CONFIG[s as OrderStatus]?.label || s}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Merchantable Items */}
            <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Package Contents
                    </h3>
                    <div className="bg-white px-3 py-1 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-400 uppercase tracking-tighter">
                        Qty Aggregate: {items.reduce((acc, curr: any) => acc + (curr.quantity || 1), 0)}
                    </div>
                </div>
                <div className="divide-y divide-slate-100">
                    {items.map((item: any) => {
                        const product = item.products || item.product;
                        return (
                            <div key={item.id} className="p-10 flex gap-8 items-center bg-white hover:bg-slate-50/50 transition-colors group">
                                <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden shrink-0 border border-slate-100 relative shadow-inner">
                                    {product?.image_url ? (
                                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                                    ) : <div className="w-full h-full flex items-center justify-center text-slate-200"><Package className="w-8 h-8" /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-black text-slate-900 text-lg mb-1 truncate">{product?.name || 'Unknown Unit'}</h4>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded">Quantity: {item.quantity}</span>
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest select-all">SKU: {product?.slug?.slice(0, 12).toUpperCase() || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-black text-slate-900 text-xl tracking-tighter">
                                        ₹{((item.price_at_purchase || 0) * (item.quantity || 1)).toLocaleString()}
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Line Total</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="bg-slate-900 p-10 flex justify-between items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 to-slate-900">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Total Transaction Value</p>
                        <p className="text-xs text-slate-500 font-medium italic">Net including all applied logistics</p>
                        
                        {(order.tax_breakdown || true) && (
                           <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-1">
                               <div className="flex gap-4 text-[10px] uppercase tracking-widest text-slate-500">
                                   <span>CGST (9%): <span className="text-slate-300">₹{(order.tax_breakdown?.cgst || ((order.total_amount - (order.total_amount/1.18))/2)).toFixed(2)}</span></span>
                                   <span>SGST (9%): <span className="text-slate-300">₹{(order.tax_breakdown?.sgst || ((order.total_amount - (order.total_amount/1.18))/2)).toFixed(2)}</span></span>
                               </div>
                           </div>
                        )}
                    </div>
                    <span className="text-4xl font-black text-blue-400 tracking-tighter italic">₹{Number(order.total_amount).toLocaleString()}</span>
                </div>
            </div>

            {/* Event Log */}
            <div className="bg-white rounded-[32px] border border-slate-200 p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Clock className="w-24 h-24" />
                </div>
                <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-10 flex items-center gap-2 relative z-10">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Operational Trail
                </h3>
                <div className="relative z-10 pl-8 space-y-10 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                    {history?.map((entry, index) => (
                        <div key={entry.id} className="relative group">
                            <div className={`absolute -left-[31px] top-1.5 w-7 h-7 rounded-full border-[6px] transition-all duration-500 bg-white ${index === 0 ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-slate-50'}`} />
                            <div className={`bg-slate-50 rounded-2xl p-6 border transition-all ${index === 0 ? 'border-blue-100 bg-white shadow-md' : 'border-slate-100 opacity-60'}`}>
                                <div className="flex items-center justify-between mb-4">
                                     <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                         entry.status === 'PLACED' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                                     }`}>
                                         {entry.status}
                                     </div>
                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                         {new Date(entry.changed_at).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: 'short' })}
                                     </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-white">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Transition Agent</p>
                                        <p className="text-sm font-black text-slate-900">{entry.changer?.full_name || 'System / Controller'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="space-y-8">
            {/* Requester Profile */}
            <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
                <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-400" />
                    Requester Identity
                </h3>
                
                <div className="space-y-8">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-100">
                            {(order.user?.full_name || shippingAddress?.fullName)?.charAt(0) || <User className="w-6 h-6"/>}
                        </div>
                        <div className="min-w-0">
                            <p className="font-black text-slate-900 truncate leading-tight">{order.user?.full_name || shippingAddress?.fullName || 'Anonymous Unit'}</p>
                            <p className="text-[10px] font-bold text-slate-400 truncate uppercase mt-0.5">{order.user?.email || shippingAddress?.email}</p>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-slate-100">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">Drop-off Destination</p>
                            {shippingAddress ? (
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-4 -translate-y-4 transition-transform group-hover:translate-x-0 group-hover:translate-y-0">
                                        <MapPin className="w-16 h-16" />
                                    </div>
                                    <div className="relative z-10 space-y-2 text-sm font-medium text-slate-600 leading-relaxed">
                                        <p className="text-slate-900 font-black mb-2 flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-blue-500" /> 
                                            {shippingAddress.fullName}
                                        </p>
                                        <p className="text-xs leading-loose">{shippingAddress.address}</p>
                                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200/50">
                                            <span className="px-2 py-0.5 bg-white rounded border border-slate-200 text-[10px] font-black text-slate-500 uppercase">{shippingAddress.city}</span>
                                            <span className="px-2 py-0.5 bg-white rounded border border-slate-200 text-[10px] font-black text-slate-500 uppercase">{shippingAddress.state}</span>
                                            <span className="px-2 py-0.5 bg-blue-50 rounded border border-blue-100 text-[10px] font-black text-blue-600 uppercase tracking-tighter">{shippingAddress.pincode}</span>
                                        </div>
                                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <span>Contact Vector:</span>
                                            <span className="text-slate-900 underline select-all">{shippingAddress.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : <p className="text-sm text-slate-400 italic bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200">Terminal Address Not Defined</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Logistics Manifest */}
            {order.shipping_info && (
                <div className="bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
                    <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                        <Truck className="w-4 h-4 text-orange-500" />
                        Logistics Manifest
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="flex justify-between items-center p-4 bg-orange-50 rounded-2xl border border-orange-100">
                            <span className="text-[10px] font-black uppercase text-orange-400">Carrier</span>
                            <span className="font-black text-xs text-slate-900 uppercase">
                                {order.shipping_info.provider}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Waybill Reference</p>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                <span className="font-mono text-sm font-bold text-slate-900 select-all tracking-tight">
                                    {order.shipping_info.awb_code || 'N/A'}
                                </span>
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            </div>
                        </div>

                        {order.shipping_info.tracking_url && (
                            <a 
                                href={order.shipping_info.tracking_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full h-12 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                            >
                                Track Consignment
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        )}

                        {order.shipping_info.label_url && (
                            <a 
                                href={order.shipping_info.label_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full h-12 bg-white text-slate-900 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors shadow-sm"
                            >
                                Download Label
                                <Printer className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                </div>
            )}

            {/* Financial Metadata */}
             <div className="bg-slate-900 rounded-[32px] p-8 shadow-xl text-white relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl" />
                
                <h3 className="font-black text-slate-500 text-[10px] uppercase tracking-[0.2em] mb-8 flex items-center gap-2 relative z-10">
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    Financial Intelligence
                </h3>
                
                <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                        <span className="text-[10px] font-black uppercase text-slate-400">Processor</span>
                        <span className="font-black text-xs text-blue-400 flex items-center gap-2 uppercase tracking-wide">
                            Razorpay 
                            <CheckCircle2 className="w-3 h-3" />
                        </span>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Network Identifier</p>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors cursor-help">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">Payment_ID</span>
                                <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white/60 transition-colors" />
                            </div>
                            <p className="font-mono text-[10px] text-blue-300 break-all select-all tracking-tight leading-relaxed">
                                {order.razorpay_payment_id || 'NULL_REFERENCE'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Gateway Reference</p>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors cursor-help">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">Razorpay_Order_ID</span>
                            </div>
                            <p className="font-mono text-[10px] text-slate-400 break-all select-all tracking-tight">
                                {order.razorpay_order_id || 'NULL_REFERENCE'}
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 mt-2">
                         <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500 w-full animate-pulse opacity-20" />
                         </div>
                         <p className="text-[8px] font-bold text-center mt-3 text-slate-600 uppercase tracking-widest group">
                             Security Protocol Active // 256-bit Encrypted Session
                         </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
