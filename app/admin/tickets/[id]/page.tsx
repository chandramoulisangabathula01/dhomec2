"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTicketDetails, addMessage, updateTicketStatus } from "@/app/actions/tickets";
import { Button } from "@/components/ui/button";
import { Loader2, Send, ArrowLeft, User, Clock, MessageSquare, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  user_id: string;
  ticket_messages?: any[];
  [key: string]: any;
}

export default function AdminTicketDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const supabase = createClient();

  const fetchTicket = async () => {
      const data = await getTicketDetails(id as string);
      setTicket(data);
      setLoading(false);
  };

  useEffect(() => {
      fetchTicket();

      const channel = supabase
        .channel(`ticket_status:${id}`)
        .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'tickets',
            filter: `id=eq.${id}`
        }, (payload) => {
            setTicket((prev: Ticket | null) => prev ? { ...prev, status: payload.new.status } : null);
        })
        .subscribe();

      const msgChannel = supabase
        .channel(`ticket_messages:${id}`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'ticket_messages',
            filter: `ticket_id=eq.${id}`
        }, (payload) => {
            fetchTicket(); 
        })
        .subscribe();

      return () => {
          supabase.removeChannel(channel);
          supabase.removeChannel(msgChannel);
      }
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    setStatusUpdating(true);
    try {
        await updateTicketStatus(id as string, newStatus);
        setTicket(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (error) {
        console.error(error);
        alert("Failed to update status");
    } finally {
        setStatusUpdating(false);
    }
  };

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

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium animate-pulse">Loading ticket details...</p>
    </div>
  );
  
  if (!ticket) return (
    <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Ticket not found</h2>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => router.push('/admin/tickets')}
                className="p-2 hover:bg-white rounded-full transition-colors group"
            >
                <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
                <h1 className="text-2xl font-bold text-slate-900">{ticket.subject}</h1>
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Opened {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                        ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                        {ticket.status}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider
                        ${ticket.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {ticket.priority} priority
                    </span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Section */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-200 flex flex-col h-[600px] overflow-hidden">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
                    {ticket.ticket_messages?.map((msg: any) => (
                    <div key={msg.id} className={`flex ${msg.is_staff_reply ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-[20px] p-4 shadow-sm ${
                            msg.is_staff_reply 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-slate-100 text-slate-800 rounded-tl-none'
                        }`}>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${msg.is_staff_reply ? 'text-blue-100' : 'text-slate-500'}`}>
                                    {msg.profiles?.full_name || (msg.is_staff_reply ? 'Support Staff' : 'User')}
                                </span>
                                {msg.is_staff_reply && <span className="text-[10px] bg-blue-500 px-1.5 rounded-sm font-bold">STAFF</span>}
                            </div>
                            <p className="text-sm leading-relaxed">{msg.message}</p>
                            <p className={`text-[9px] mt-2 text-right ${msg.is_staff_reply ? 'text-blue-200' : 'text-slate-400'}`}>
                                {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                    </div>
                    ))}
                </div>

                {/* Reply Box */}
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                        <textarea 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message to the user..."
                            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none h-12"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e);
                                }
                            }}
                        />
                        <Button 
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            className="bg-blue-600 hover:bg-blue-700 h-12 w-12 rounded-xl flex items-center justify-center p-0 shrink-0"
                        >
                            {sending ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                        </Button>
                    </form>
                    <p className="text-[10px] text-slate-400 mt-2 text-center">
                        Press Enter to send. Shift+Enter for new line.
                    </p>
                </div>
            </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Requester Information
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                            {ticket.user_id?.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">
                                {ticket.profile?.full_name || (ticket.user_id ? `User #${ticket.user_id.slice(0, 4)}` : 'Loading...')}
                            </p>
                            <p className="text-xs text-slate-500 font-mono">ID: {ticket.user_id?.slice(0, 8)}</p>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Management Status</label>
                            {statusUpdating && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
                        </div>
                        <div className="relative">
                            <select 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer disabled:opacity-50 transition-all"
                                value={ticket.status}
                                disabled={statusUpdating}
                                onChange={(e) => handleUpdateStatus(e.target.value)}
                            >
                                <option value="open">🟢 Open & Active</option>
                                <option value="pending">🟡 Pending Input</option>
                                <option value="resolved">🔵 Issue Resolved</option>
                                <option value="closed">⚪ Case Closed</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <Clock className="w-3 h-3" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            
            {/* Consultation Data (Metadata) */}
            {(ticket.metadata?.preferred_date || ticket.metadata?.site_photos?.length > 0) && (
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        Consultation Data
                    </h3>
                    <div className="space-y-4">
                        {ticket.metadata?.preferred_date && (
                            <div>
                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Preferred Date</p>
                                <p className="text-sm font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                    {new Date(ticket.metadata.preferred_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        )}
                        
                        {ticket.metadata?.site_photos && ticket.metadata.site_photos.length > 0 && (
                            <div>
                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Site Photos ({ticket.metadata.site_photos.length})</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {ticket.metadata.site_photos.map((url: string, idx: number) => (
                                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-lg overflow-hidden border border-slate-200 relative group">
                                            <img src={url} alt={`Site ${idx}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[10px] text-white font-bold uppercase tracking-wider">View</span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-blue-600 rounded-[24px] p-6 text-white shadow-lg shadow-blue-200">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Staff Quick Tips
                </h3>
                <ul className="text-xs space-y-2 text-blue-50 opacity-90 leading-relaxed">
                    <li>• Be professional and helpful.</li>
                    <li>• If you need more info, set status to "Pending".</li>
                    <li>• Mark as "Resolved" only when confirmed.</li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
}
