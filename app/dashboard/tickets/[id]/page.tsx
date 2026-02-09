"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTicketDetails, addMessage } from "@/app/actions/tickets";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const supabase = createClient();

  const fetchTicket = async () => {
      const data = await getTicketDetails(id as string);
      setTicket(data);
      setLoading(false);
  };

  useEffect(() => {
      fetchTicket();

      // Realtime subscription could go here
      const channel = supabase
        .channel(`ticket_messages:${id}`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'ticket_messages',
            filter: `ticket_id=eq.${id}`
        }, (payload) => {
            fetchTicket(); // Simple re-fetch on new message
        })
        .subscribe();

      return () => {
          supabase.removeChannel(channel);
      }
  }, [id]);

  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim()) return;

      setSending(true);
      try {
          await addMessage(id as string, newMessage);
          setNewMessage("");
          fetchTicket();
      } catch (error) {
          console.error(error);
      } finally {
          setSending(false);
      }
  };

  if (loading) return <div className="min-h-screen pt-24 text-center">Loading...</div>;
  if (!ticket) return <div className="min-h-screen pt-24 text-center">Ticket not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-white p-6 rounded-t-xl border-b flex justify-between items-center shadow-sm">
            <div>
                <h1 className="text-xl font-bold">{ticket.subject}</h1>
                <p className="text-sm text-slate-500">Ticket #{ticket.id.slice(0, 8)}</p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                {ticket.status}
            </span>
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white overflow-y-auto p-6 space-y-6 border-x shadow-sm">
            {ticket.ticket_messages?.map((msg: any) => (
               <div key={msg.id} className={`flex ${msg.profiles?.role === 'admin' ? 'justify-start' : 'justify-end'}`}>
                   <div className={`max-w-[80%] rounded-lg p-4 ${
                       msg.profiles?.role === 'admin' 
                       ? 'bg-slate-100 text-slate-800 rounded-tl-none' 
                       : 'bg-primary text-primary-foreground rounded-tr-none'
                   }`}>
                       <p className="text-sm mb-1 font-semibold opacity-75">{msg.profiles?.full_name || 'User'}</p>
                       <p>{msg.message}</p>
                       <p className="text-xs opacity-50 text-right mt-1">
                           {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </p>
                   </div>
               </div>
            ))}
        </div>

        {/* Input */}
        <div className="bg-white p-4 rounded-b-xl border-t shadow-sm">
            <form onSubmit={handleSendMessage} className="flex gap-4">
                <input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button disabled={sending || !newMessage.trim()}>
                    {sending ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                </Button>
            </form>
        </div>
      </div>
    </div>
  );
}
