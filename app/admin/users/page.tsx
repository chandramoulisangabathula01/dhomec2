import { createClient } from "@/utils/supabase/server";
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  UserPlus,
  ArrowUpRight
} from "lucide-react";
import { UserActions } from "./UserActions";
import { Button } from "@/components/ui/button";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, full_name, username, role, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching profiles:", error);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Stats Banner */}
      <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">Access Management</h1>
             <p className="text-slate-500 mt-1 font-medium italic">Overseeing {profiles?.length || 0} authenticated profiles</p>
          </div>
          <div className="bg-blue-600 p-8 rounded-[32px] text-white flex items-center gap-8 shadow-xl shadow-blue-500/20 relative overflow-hidden shrink-0">
             <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Active Accounts</p>
                <h2 className="text-3xl font-black">{profiles?.length || 0}</h2>
             </div>
             <div className="h-10 w-px bg-white/20 relative z-10" />
             <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Admins</p>
                <h2 className="text-3xl font-black">{profiles?.filter(p => p.role === 'admin').length || 0}</h2>
             </div>
             <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
          </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                  placeholder="Query profiles by name or ID..." 
                  className="w-full bg-white border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium border"
              />
          </div>
          <Button variant="ghost" className="rounded-2xl border border-slate-200 bg-white shadow-sm font-bold text-xs gap-2 h-12 px-6">
              <Filter className="w-4 h-4" />
              System Filters
          </Button>
      </div>

      {/* Users Table-List */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Identity & Account</th>
              <th className="p-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Credentials</th>
              <th className="p-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Authorization</th>
              <th className="p-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Last Sync</th>
              <th className="p-6 font-black text-slate-500 uppercase tracking-widest text-[10px] text-right">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {profiles?.map((profile) => (
              <tr key={profile.id} className="hover:bg-slate-50/80 transition-all group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0
                        ${profile.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                        {profile.full_name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{profile.full_name || 'Anonymous User'}</p>
                      <p className="text-[10px] text-slate-400 font-mono italic truncate">{profile.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <div className="text-slate-600 font-bold text-xs truncate">@{profile.username || 'not-assigned'}</div>
                </td>
                <td className="p-6">
                    <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest
                        ${profile.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-600'}`}>
                        {profile.role}
                    </span>
                </td>
                <td className="p-6">
                  <p className="text-xs font-medium text-slate-500">
                    {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
                  </p>
                </td>
                <td className="p-6 text-right">
                    <UserActions user={profile} />
                </td>
              </tr>
            ))}
            {(!profiles || profiles.length === 0) && (
              <tr>
                <td colSpan={5} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                        <Users className="w-16 h-16 opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-widest">No profiles detected in current cluster</p>
                    </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

