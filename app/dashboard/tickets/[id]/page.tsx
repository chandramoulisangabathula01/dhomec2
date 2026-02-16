"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { getTicketDetails, addMessage } from "@/app/actions/tickets";
import { Button } from "@/components/ui/button";
import { Loader2, Send, ArrowLeft, Phone, MoreVertical, Paperclip, Smile, CheckCheck } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const fetchTicket = useCallback(async () => {
    const data = await getTicketDetails(id as string);
    setTicket(data);
    setLoading(false);
    scrollToBottom();
  }, [id, scrollToBottom]);

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    getUser();

    fetchTicket();

    // Realtime subscription for instant messaging
    const channel = supabase
      .channel(`ticket_messages:${id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'ticket_messages',
        filter: `ticket_id=eq.${id}`
      }, (payload) => {
        // Optimistic update: add new message immediately
        setTicket((prev: any) => {
          if (!prev) return prev;
          const newMsg = payload.new;
          // Check if message already exists (to avoid dups)
          const exists = prev.ticket_messages?.some((m: any) => m.id === newMsg.id);
          if (exists) return prev;
          return {
            ...prev,
            ticket_messages: [...(prev.ticket_messages || []), {
              ...newMsg,
              profiles: newMsg.user_id === currentUserId 
                ? { full_name: "You", role: "user" }
                : { full_name: "Support", role: "admin" }
            }]
          };
        });
        scrollToBottom();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Re-fetch when currentUserId changes (to get proper profile names)
  useEffect(() => {
    if (currentUserId && ticket) {
      fetchTicket();
    }
  }, [currentUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Optimistic: add message immediately for instant feel
    setTicket((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        ticket_messages: [...(prev.ticket_messages || []), {
          id: `temp-${Date.now()}`,
          message: messageText,
          created_at: new Date().toISOString(),
          user_id: currentUserId,
          profiles: { full_name: "You", role: "user" }
        }]
      };
    });
    scrollToBottom();

    try {
      await addMessage(id as string, messageText);
      // Re-fetch to get the actual message with proper data
      fetchTicket();
    } catch (error) {
      console.error(error);
      // Roll back optimistic update
      fetchTicket();
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const isMyMessage = (msg: any) => {
    return msg.user_id === currentUserId;
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  // Group messages by date
  const groupedMessages = ticket?.ticket_messages?.reduce((groups: any, msg: any) => {
    const dateKey = new Date(msg.created_at).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(msg);
    return groups;
  }, {} as Record<string, any[]>) || {};

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#4C63FC]" />
          <p className="text-sm text-slate-500 font-medium">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900 mb-2">Ticket not found</p>
          <Link href="/dashboard/tickets" className="text-sm text-[#4C63FC] font-medium hover:underline">
            ← Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="container mx-auto px-0 md:px-4 pt-20 pb-0 md:pb-6 max-w-3xl">
        <div className="bg-white md:rounded-2xl shadow-xl overflow-hidden flex flex-col" style={{ height: "calc(100vh - 5rem)" }}>
          
          {/* Chat Header - WhatsApp style */}
          <div className="bg-gradient-to-r from-[#4C63FC] to-[#6366f1] px-4 py-3 flex items-center gap-3 shadow-lg">
            <Link href="/dashboard/tickets" className="text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm">
              CS
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-bold text-sm truncate">{ticket.subject}</h1>
              <p className="text-white/70 text-xs flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'open' || ticket.status === 'OPEN' ? 'bg-green-400 animate-pulse' : 'bg-white/40'}`} />
                {ticket.status === 'open' || ticket.status === 'OPEN' ? 'Active' : ticket.status}
                <span className="mx-1">•</span>
                Ticket #{ticket.id?.slice(0, 8)}
              </p>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundColor: '#f0f2f5'
            }}
          >
            {Object.keys(groupedMessages).length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-6 bg-white/80 rounded-2xl backdrop-blur-sm">
                  <p className="text-sm text-slate-500 font-medium">No messages yet. Start the conversation!</p>
                </div>
              </div>
            ) : (
              Object.entries(groupedMessages).map(([dateKey, messages]: [string, any]) => (
                <div key={dateKey}>
                  {/* Date Separator */}
                  <div className="flex items-center justify-center my-4">
                    <span className="px-3 py-1 bg-white rounded-lg text-[11px] font-bold text-slate-500 shadow-sm">
                      {formatDate(dateKey)}
                    </span>
                  </div>

                  {/* Messages for this date */}
                  {messages.map((msg: any, idx: number) => {
                    const mine = isMyMessage(msg);
                    const isTemp = msg.id?.startsWith('temp-');
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex mb-1.5 ${mine ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-3.5 py-2 shadow-sm relative ${
                            mine
                              ? 'bg-[#DCF8C6] text-slate-800 rounded-tr-sm'
                              : 'bg-white text-slate-800 rounded-tl-sm'
                          } ${isTemp ? 'opacity-70' : ''}`}
                        >
                          {!mine && (
                            <p className="text-[11px] font-bold text-[#4C63FC] mb-0.5">
                              {msg.profiles?.full_name || 'Support'}
                            </p>
                          )}
                          <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>
                          <div className={`flex items-center gap-1 mt-0.5 ${mine ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[10px] text-slate-500">
                              {formatTime(msg.created_at)}
                            </span>
                            {mine && !isTemp && (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                            )}
                            {isTemp && (
                              <Loader2 className="w-3 h-3 text-slate-400 animate-spin" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input - WhatsApp style */}
          <div className="bg-[#f0f2f5] px-3 py-2 border-t border-slate-200">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-white rounded-full px-4 py-1 shadow-sm border border-slate-100">
                <input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 py-2 text-sm outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
                  autoComplete="off"
                />
              </div>
              <Button 
                type="submit"
                disabled={sending || !newMessage.trim()}
                className={`w-11 h-11 rounded-full p-0 flex items-center justify-center shadow-md transition-all duration-200 ${
                  newMessage.trim() 
                    ? 'bg-[#4C63FC] hover:bg-[#3b4fd4] scale-100 hover:scale-105' 
                    : 'bg-slate-300 cursor-not-allowed'
                }`}
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </Button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
