import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, User, AlertCircle, ArrowUpRight, Check, Search, Filter } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AdminTicketsPage() {
  const supabase = await createClient();
  
  // Get Current User Role
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
  const role = profile?.role || 'GUEST';

  // Fetch Tickets
  let query = supabase
    .from("tickets")
    .select("*, profile:profiles!user_id(username, full_name, email)")
    .order("created_at", { ascending: false });

  // If Support Staff, only show unassigned OR assigned to them
  if (role === 'SUPPORT_STAFF') {
      query = query.or(`assigned_staff_id.is.null,assigned_staff_id.eq.${user?.id}`);
  }

  const { data: tickets, error: ticketsError } = await query;

  // Fetch Website Enquiries (for everyone to see, or maybe just admins/support)
  const { data: enquiries, error: enquiriesError } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50); // Limit for now

  if (ticketsError) console.error(ticketsError);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Support Workspace</h1>
            <p className="text-slate-500 mt-1 font-medium italic">Manage customer issues & measurement requests</p>
        </div>
        <div className="flex gap-3">
             <Button variant="outline" className="gap-2 rounded-xl">
                 <Filter className="w-4 h-4" /> Filter
             </Button>
        </div>
      </div>

      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="bg-white p-1 rounded-xl border border-slate-200 w-full md:w-auto h-auto grid grid-cols-2 md:inline-flex">
          <TabsTrigger value="tickets" className="rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 font-bold px-6 py-2">
             Active Tickets
             <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px]">{tickets?.length || 0}</span>
          </TabsTrigger>
          <TabsTrigger value="enquiries" className="rounded-lg data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 font-bold px-6 py-2">
             Website Enquiries
             <span className="ml-2 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[10px]">{enquiries?.length || 0}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="mt-6">
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                    <th className="p-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Subject & ID</th>
                    <th className="p-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">User Context</th>
                    <th className="p-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Priority</th>
                    <th className="p-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Status</th>
                    <th className="p-6 font-black text-slate-500 uppercase tracking-widest text-[10px] text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {tickets?.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-slate-50/80 group transition-all">
                        <td className="p-6">
                            <div className="flex items-start gap-3">
                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${ticket.status === 'OPEN' ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`} />
                                <div>
                                    <p className="font-bold text-slate-900 mb-1">{ticket.subject}</p>
                                    <p className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md w-fit font-mono">{ticket.id.slice(0,8)}</p>
                                </div>
                            </div>
                        </td>
                        <td className="p-6">
                           <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                   {ticket.profile?.full_name?.[0] || 'U'}
                               </div>
                               <div>
                                   <p className="font-bold text-slate-900 text-xs">{ticket.profile?.full_name || 'Anonymous'}</p>
                                   <p className="text-[10px] text-slate-400">{ticket.profile?.email || 'No Email'}</p>
                               </div>
                           </div>
                        </td>
                        <td className="p-6">
                             {ticket.priority === 'high' || ticket.priority === 'urgent' ? (
                                 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider border border-red-100">
                                     <AlertCircle className="w-3 h-3" /> {ticket.priority}
                                 </span>
                             ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider border border-slate-100">
                                     {ticket.priority}
                                </span>
                             )}
                        </td>
                        <td className="p-6">
                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                                ${ticket.status === 'OPEN' ? 'bg-blue-50 text-blue-600' : 
                                  ticket.status === 'RESOLVED' ? 'bg-green-50 text-green-600' : 
                                  'bg-slate-50 text-slate-500'}`}>
                                {ticket.status}
                            </span>
                        </td>
                        <td className="p-6 text-right">
                            <Link href={`/admin/tickets/${ticket.id}`}>
                                <Button size="sm" className="rounded-xl px-4 font-bold h-9 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm">
                                    Open Ticket
                                </Button>
                            </Link>
                        </td>
                    </tr>
                    ))}
                    {tickets?.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-12 text-center text-slate-400">
                                <MessageSquare className="w-12 h-12 mx-auto opacity-10 mb-3" />
                                <p className="text-sm font-bold opacity-50">No tickets found in your queue.</p>
                                {role === 'SUPPORT_STAFF' && <p className="text-xs mt-1">You are viewing Unassigned tickets and tickets assigned to you.</p>}
                            </td>
                        </tr>
                    )}
                </tbody>
                </table>
            </div>
        </TabsContent>

        <TabsContent value="enquiries" className="mt-6">
            <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                <thead className="bg-amber-50/30 border-b border-amber-100/50">
                    <tr>
                    <th className="p-6 font-black text-amber-900/50 uppercase tracking-widest text-[10px]">Source & Time</th>
                    <th className="p-6 font-black text-amber-900/50 uppercase tracking-widest text-[10px]">Contact Identity</th>
                    <th className="p-6 font-black text-amber-900/50 uppercase tracking-widest text-[10px]">Intent (Product/Msg)</th>
                    <th className="p-6 font-black text-amber-900/50 uppercase tracking-widest text-[10px] text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {enquiries?.map((enq) => (
                    <tr key={enq.id} className="hover:bg-amber-50/30 group transition-all">
                        <td className="p-6">
                            <p className="font-bold text-slate-900 mb-1">Web Form</p>
                            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(enq.created_at).toLocaleDateString()}
                            </span>
                        </td>
                        <td className="p-6">
                            <div className="space-y-0.5">
                                <p className="font-bold text-slate-900">{enq.name}</p>
                                <p className="text-xs text-slate-500">{enq.email || 'No Email'}</p>
                                <p className="text-xs text-slate-500 font-mono">{enq.phone}</p>
                                {enq.company && <p className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded w-fit mt-1 font-bold">{enq.company}</p>}
                            </div>
                        </td>
                        <td className="p-6 max-w-sm">
                            <p className="font-bold text-indigo-600 mb-1">{enq.subject || 'General Enquiry'}</p>
                            <p className="text-xs text-slate-600 line-clamp-2">{enq.message}</p>
                            {enq.product_interest && (
                                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    Interested in: {enq.product_interest}
                                </div>
                            )}
                        </td>
                        <td className="p-6 text-right">
                             <Link href="/admin/enquiries">
                                 <Button variant="outline" size="sm" className="rounded-xl px-4 font-bold h-9 gap-2">
                                     View Details
                                 </Button>
                             </Link>
                        </td>
                    </tr>
                    ))}
                     {enquiries?.length === 0 && (
                        <tr>
                            <td colSpan={4} className="p-12 text-center text-slate-400">
                                <p className="text-sm font-bold opacity-50">No guest enquiries received</p>
                            </td>
                        </tr>
                    )}
                </tbody>
                </table>
            </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
