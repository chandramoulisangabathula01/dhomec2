"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateProfile } from "./actions";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";

interface ProfileFormProps {
  profile: any;
  user: any;
}

export default function ProfileForm({ profile, user }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result?.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: "Profile updated successfully!" });
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      }
    });
  }

  return (
    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
      <form action={handleSubmit} className="space-y-6">
        {message && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="text-sm font-bold">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Identity & Email</label>
            <input 
              type="email" 
              disabled 
              value={user.email} 
              className="w-full rounded-2xl border-none bg-slate-50 p-4 text-slate-400 font-medium cursor-not-allowed"
            />
            <p className="text-[9px] text-slate-400 ml-1 font-medium">Unique identifier associated with this sequence.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="full_name" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Full Legal Name</label>
            <input 
              id="full_name"
              name="full_name"
              type="text" 
              defaultValue={profile?.full_name || ""} 
              className="w-full rounded-2xl border border-slate-100 bg-white p-4 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              placeholder="e.g., John Doe"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="username" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">System Alias</label>
            <input 
              id="username"
              name="username"
              type="text" 
              defaultValue={profile?.username || ""} 
              className="w-full rounded-2xl border border-slate-100 bg-white p-4 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              placeholder="@username"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="website" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Portal/Website (Optional)</label>
            <input 
              id="website"
              name="website"
              type="url" 
              defaultValue={profile?.website || ""} 
              className="w-full rounded-2xl border border-slate-100 bg-white p-4 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
              placeholder="https://your-domain.com"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-50">
          <Button 
            disabled={isPending}
            type="submit" 
            className="w-full lg:w-fit h-14 bg-slate-900 hover:bg-slate-800 text-white px-10 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-all active:scale-95 disabled:opacity-50 gap-3"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Commit Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
