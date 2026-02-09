import { getUserTickets } from "@/app/actions/tickets";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, ExternalLink } from "lucide-react";

export default async function TicketsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const tickets = await getUserTickets();

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Support Tickets</h1>
            <Link href="/contact/support">
                <Button className="gap-2">
                    <Plus className="w-4 h-4" /> New Ticket
                </Button>
            </Link>
        </div>

        {tickets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
                <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">No tickets found</h3>
                <p className="text-slate-500 mb-6">Need help? Create a new support ticket.</p>
                <Link href="/contact/support">
                    <Button variant="outline">Create Ticket</Button>
                </Link>
            </div>
        ) : (
            <div className="space-y-4">
                {tickets.map((ticket: any) => (
                    <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`} className="block">
                        <div className="bg-white p-6 rounded-lg shadow-sm border hover:border-primary transition-colors flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-lg text-slate-900 mb-1">{ticket.subject}</h3>
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <span>#{ticket.id.slice(0, 8)}</span>
                                    <span>•</span>
                                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span className={`capitalize ${
                                        ticket.status === 'open' ? 'text-green-600' : 'text-slate-600'
                                    }`}>{ticket.status}</span>
                                </div>
                            </div>
                            <ExternalLink className="w-5 h-5 text-slate-300" />
                        </div>
                    </Link>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
