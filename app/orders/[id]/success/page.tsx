"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, Truck, ArrowRight } from "lucide-react";

export default function OrderSuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id;
  const paymentId = searchParams.get("payment_id");

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-12">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8" />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
            <p className="text-slate-600 mb-8">Thank you for your purchase. Your order has been placed successfully.</p>

            <div className="bg-slate-50 rounded-xl p-6 text-left mb-8 space-y-3">
                <div className="flex justify-between">
                    <span className="text-slate-500">Order ID</span>
                    <span className="font-mono font-medium text-slate-900">{orderId}</span>
                </div>
                {paymentId && (
                    <div className="flex justify-between">
                        <span className="text-slate-500">Payment ID</span>
                        <span className="font-mono font-medium text-slate-900">{paymentId}</span>
                    </div>
                )}
                <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Processing
                    </span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/dashboard/orders">
                    <Button variant="outline" className="w-full sm:w-auto gap-2">
                        <Package className="w-4 h-4" /> View My Orders
                    </Button>
                </Link>
                <Link href="/products">
                    <Button className="w-full sm:w-auto gap-2">
                        Continue Shopping <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
