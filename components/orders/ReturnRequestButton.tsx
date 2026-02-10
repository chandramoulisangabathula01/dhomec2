"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { requestOrderReturn } from "@/app/actions/orders";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCcw } from "lucide-react";

interface ReturnRequestButtonProps {
    orderId: string;
    variant?: "default" | "destructive" | "outline" | "subtle" | "ghost" | "link";
    className?: string;
}

export default function ReturnRequestButton({ orderId, variant = "outline", className }: ReturnRequestButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleReturnRequest = async () => {
        if (!confirm("Are you sure you want to request a return for this order? Our team will review your request.")) {
            return;
        }

        setLoading(true);
        try {
            const result = await requestOrderReturn(orderId);
            if (result.success) {
                alert("Return request submitted successfully. We will contact you soon.");
                router.refresh();
            }
        } catch (error: any) {
            alert(error.message || "Failed to submit return request");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button 
            onClick={handleReturnRequest}
            disabled={loading}
            variant={variant as any}
            className={className || "w-full bg-white/10 hover:bg-white/20 border-white/20 text-white font-bold rounded-xl gap-2 h-12"}
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            Request Return
        </Button>
    );
}
