import { getEnquiries } from "@/app/actions/enquiries";
import { EnquiriesClient } from "./EnquiriesClient";

export default async function AdminEnquiriesPage() {
  const enquiries = await getEnquiries();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enquiries</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage customer enquiries and consultation requests</p>
        </div>
        <span className="text-sm font-bold text-slate-500">{enquiries.length} Total</span>
      </div>
      <EnquiriesClient enquiries={enquiries} />
    </div>
  );
}
