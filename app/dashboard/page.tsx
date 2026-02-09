import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome back, {profile?.full_name || user?.email}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-slate-500 mb-2">Total Orders</h3>
            <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-slate-500 mb-2">Open Tickets</h3>
            <p className="text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
}
