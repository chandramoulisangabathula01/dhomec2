import { createTicket } from "../../actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewTicketPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/dashboard/tickets" className="flex items-center text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Back to Tickets
      </Link>
      
      <h1 className="text-2xl font-bold mb-8">Create New Ticket</h1>

      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <form action={createTicket} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Subject
            </label>
            <input
              name="subject"
              required
              className="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of the issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Priority
            </label>
            <select
              name="priority"
              className="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Message
            </label>
            <textarea
              name="message"
              required
              rows={5}
              className="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe your issue in detail..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/dashboard/tickets">
                 <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit">Submit Ticket</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
