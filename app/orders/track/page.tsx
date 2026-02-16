"use client";

import { useSearchParams } from "next/navigation";
import { Package, Truck, CheckCircle2, MapPin, Clock } from "lucide-react";

export default function TrackingPage() {
  const searchParams = useSearchParams();
  const awb = searchParams.get("awb");

  if (!awb) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full">
          <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900 mb-2">Tracking Number Required</h1>
          <p className="text-slate-500 text-sm">Please provide a valid AWB number to track your shipment.</p>
        </div>
      </div>
    );
  }

  // Simulated events for demo
  const events = [
    { status: "Manifested", location: "Warehouse, Bangalore", time: "Today, 09:00 AM", done: true },
    { status: "Picked Up", location: "Bangalore Hub", time: "Today, 11:30 AM", done: true },
    { status: "In Transit", location: "En Route to Destination", time: "Today, 02:15 PM", done: true },
    { status: "Out for Delivery", location: "Local Hub", time: "Expected Tomorrow", done: false },
    { status: "Delivered", location: "Customer Address", time: "Expected Tomorrow", done: false },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">In Transit</span>
              <span className="text-xs text-slate-400 font-medium">via Dhomec Logistics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">#{awb}</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Expected Delivery: <span className="text-slate-900 font-bold">Tomorrow, by 6 PM</span></p>
          </div>
          <Truck className="w-12 h-12 text-blue-500 opacity-20 hidden sm:block" />
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Shipment Progress
          </h2>

          <div className="relative pl-4 space-y-8 before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
            {events.map((event, index) => (
              <div key={index} className="relative flex gap-6 group">
                {/* Dot */}
                <div className={`relative z-10 w-6 h-6 rounded-full border-[3px] shrink-0 flex items-center justify-center bg-white transition-all ${event.done ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-slate-200'}`}>
                  {event.done && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                </div>
                
                {/* Content */}
                <div className={`flex-1 transition-opacity ${event.done ? 'opacity-100' : 'opacity-40'}`}>
                  <p className="font-bold text-slate-900 text-sm">{event.status}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-wider">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Footer */}
        <div className="text-center">
            <p className="text-xs text-slate-400 font-medium">
                This is a simulated tracking page for demonstration purposes.
                <br />
                Real tracking would redirect to the carrier's official website.
            </p>
        </div>
      </div>
    </div>
  );
}
