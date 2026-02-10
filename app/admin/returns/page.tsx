import { getAllReturns } from "@/app/actions/returns";
import { ReturnsAdminClient } from "./ReturnsAdminClient";

export default async function AdminReturnsPage() {
  const returns = await getAllReturns();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Returns Management</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage customer return and refund requests</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-500">
            {returns.length} Total
          </span>
        </div>
      </div>

      <ReturnsAdminClient returns={returns} />
    </div>
  );
}
