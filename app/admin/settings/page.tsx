"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  Lock, 
  Loader2, 
  ShieldCheck, 
  Fingerprint, 
  Clock, 
  ShieldAlert,
  Save,
  KeyRound,
  History
} from "lucide-react";

export default function AdminProfile() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (user) {
          setUser(user);
        } else {
            router.push('/login');
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router, supabase]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccess(false);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match");
      setUpdating(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setUpdating(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) throw updateError;

      setSuccess(true);
      setPasswordData({ newPassword: "", confirmPassword: "" });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to update security credentials");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Authenticating Session...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header Banner */}
      <div className="bg-white p-8 sm:p-12 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 z-0 opacity-50" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Security & Identity</h1>
                </div>
                <p className="text-slate-500 font-medium text-lg max-w-xl leading-relaxed">
                    Manage your administrative credentials and secure your access to the core commerce infrastructure.
                </p>
            </div>
            <div className="flex flex-col items-end gap-2 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Auth Tier</p>
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span className="text-xl font-black text-slate-900">SYSTEM ADMIN</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Identity Information */}
        <div className="bg-white rounded-[40px] border border-slate-200 p-10 shadow-sm space-y-10 group relative overflow-hidden">
            <div className="absolute bottom-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                <Fingerprint className="w-48 h-48" />
            </div>
            
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                <User className="w-4 h-4" />
                Identity Parameters
            </h2>
            
            <div className="space-y-8 relative z-10">
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Verified Email Vector</p>
                    <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-[24px] border border-slate-100 group-hover:bg-blue-50/30 transition-colors duration-500">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                            <Mail className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="font-bold text-slate-900 truncate flex-1">{user?.email || "NOT_DEFINED"}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">System UUID (Non-Mutable)</p>
                    <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-100 font-mono text-[11px] text-slate-500 tracking-tight leading-loose select-all break-all">
                        {user?.id || "NULL_UUID"}
                    </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Session Chronology</p>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-700 mt-2">
                        <History className="w-4 h-4 text-slate-300" />
                        Last Sequence Activation: 
                    </div>
                    <p className="text-xs font-medium text-slate-400 ml-7 italic">
                        {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' }) : "N/A"}
                    </p>
                </div>
            </div>

            <div className="bg-indigo-50/50 p-6 rounded-[28px] border border-indigo-100/50">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Security Notice
                </p>
                <p className="text-xs font-medium text-indigo-900 leading-relaxed">
                    Identity changes require direct database interrogation or high-level auth migrations. Contact system architects for email updates.
                </p>
            </div>
        </div>

        {/* Security Credentials Modification */}
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-200 p-10 sm:p-12 shadow-sm space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5">
                <KeyRound className="w-24 h-24" />
            </div>

            <div>
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 mb-6">
                    <KeyRound className="w-4 h-4 text-blue-400" />
                    Credential Re-Sync
                </h2>
                <p className="text-slate-500 font-medium">Update your administrative password to maintain security standards.</p>
            </div>

            {success && (
                <div className="p-6 bg-emerald-50 text-emerald-700 rounded-3xl border border-emerald-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                    <CheckCircle2 className="w-6 h-6" />
                    <p className="font-black text-sm uppercase tracking-widest">Security credentials updated successfully</p>
                </div>
            )}

            {error && (
                <div className="p-6 bg-rose-50 text-rose-700 rounded-3xl border border-rose-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                    <ShieldAlert className="w-6 h-6" />
                    <p className="font-bold text-sm">{error}</p>
                </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Secure Cipher</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="w-full h-16 px-6 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-[24px] font-bold text-slate-900 transition-all outline-none placeholder:text-slate-300"
                            placeholder="Min. 6 high-entropy chars"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Cipher</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className="w-full h-16 px-6 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-[24px] font-bold text-slate-900 transition-all outline-none placeholder:text-slate-300"
                            placeholder="Repeat for validation"
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="hidden sm:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol Version: 2.1.0-SEC</p>
                    </div>
                    <Button 
                        disabled={updating} 
                        type="submit"
                        className="h-16 px-12 bg-slate-900 hover:bg-black text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 gap-3"
                    >
                        {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {updating ? "Re-Authorizing..." : "Update Credentials"}
                    </Button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}
