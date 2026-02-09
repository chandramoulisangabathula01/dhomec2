import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 font-medium text-slate-500">Name</th>
              <th className="p-4 font-medium text-slate-500">Email</th>
              <th className="p-4 font-medium text-slate-500">Role</th>
              <th className="p-4 font-medium text-slate-500">Joined</th>
              <th className="p-4 font-medium text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {profiles?.map((profile) => (
              <tr key={profile.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium text-slate-900">{profile.full_name || '-'}</td>
                <td className="p-4 text-slate-500">{profile.email}</td>
                <td className="p-4 capitalize">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${profile.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                        {profile.role}
                    </span>
                </td>
                <td className="p-4 text-slate-500">{new Date(profile.created_at).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4 text-slate-500" />
                    </Button>
                </td>
              </tr>
            ))}
            {profiles?.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No users found.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
