import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "./ProfileForm";
import { User, ShieldCheck } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in duration-500">
      {/* Header Area */}
      <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personal Details</h1>
          </div>
          <p className="text-slate-500 font-medium ml-12">Manage your system identity and communication preferences</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
            {/* The interactive client form */}
            <ProfileForm profile={profile} user={user} />
        </div>

        {/* Info Card */}
        <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
                <ShieldCheck className="w-10 h-10 text-blue-400 mb-6" />
                <h3 className="text-lg font-bold mb-3">Data Integrity</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    Your profile data is encrypted at rest and only accessible via authenticated B2B sequences. Changes are recorded in our secure audit logs.
                </p>
                <div className="mt-8 pt-8 border-t border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Account Authority</p>
                    <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-[10px] font-black inline-block uppercase">
                        {profile?.role || 'Standard Access'}
                    </div>
                </div>
            </div>
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>
      </div>
    </div>
  );
}

