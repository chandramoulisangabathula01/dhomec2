"use client";

import { useState } from "react";
import { createTicket } from "@/app/actions/tickets";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateTicketPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;
    const priority = formData.get("priority") as string;

    try {
        await createTicket(subject, message, priority);
        router.push("/dashboard/tickets");
    } catch (error) {
        alert("Failed to create ticket");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link href="/dashboard/tickets" className="inline-flex items-center text-slate-500 hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Tickets
        </Link>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border">
            <h1 className="text-2xl font-bold mb-6">Create New Ticket</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
                    <input 
                        name="subject" 
                        required 
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                        placeholder="Brief summary of your issue"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                    <select 
                        name="priority" 
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                    >
                        <option value="low">Low</option>
                        <option value="normal" selected>Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                    <textarea 
                        name="message" 
                        required 
                        rows={6}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                        placeholder="Describe your issue in detail..."
                    />
                </div>

                <Button disabled={loading} className="w-full">
                    {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                    Submit Ticket
                </Button>
            </form>
        </div>
      </div>
    </div>
  );
}
