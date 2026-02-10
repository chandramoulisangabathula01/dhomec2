import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

export default async function AdminTicketsPage() {
  const supabase = await createClient();
  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("*, profile:profiles(username, full_name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tickets:", error);
  }


  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-medium text-slate-500">Subject</th>
              <th className="p-4 font-medium text-slate-500">User</th>
              <th className="p-4 font-medium text-slate-500">Priority</th>
              <th className="p-4 font-medium text-slate-500">Status</th>
              <th className="p-4 font-medium text-slate-500">Date</th>
              <th className="p-4 font-medium text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tickets?.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-900">{ticket.subject}</td>
                <td className="p-4">
                  <div className="text-slate-900 font-medium">{ticket.profile?.full_name || ticket.profile?.username || 'Guest'}</div>
                  <div className="text-xs text-slate-500">@{ticket.profile?.username || 'no-username'}</div>
                </td>
                <td className="p-4 capitalize">{ticket.priority}</td>
                <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize 
                        ${ticket.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                        {ticket.status}
                    </span>
                </td>
                <td className="p-4 text-slate-500">{new Date(ticket.created_at).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                    <Link href={`/admin/tickets/${ticket.id}`}>
                        <Button variant="ghost" size="icon">
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                        </Button>
                    </Link>
                </td>

              </tr>
            ))}
            {tickets?.length === 0 && (
                <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No tickets found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
