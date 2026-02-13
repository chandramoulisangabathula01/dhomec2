"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Shield, User as UserIcon, Copy, Trash2, CheckCircle2, Loader2, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { changeUserRole, deleteUserProfile } from "./actions";
import { UserRole } from "@/types";

export function UserActions({ user }: { user: any }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateRole = (newRole: UserRole) => {
    startTransition(async () => {
        try {
            await changeUserRole(user.id, newRole);
            setIsOpen(false);
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        }
    });
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this user's profile? This action cannot be undone.")) return;
    
    startTransition(async () => {
        try {
            await deleteUserProfile(user.id);
            setIsOpen(false);
            router.refresh();
        } catch (error: any) {
            alert(error.message);
        }
    });
  };

  const roles: { label: string, value: UserRole, class: string }[] = [
    { label: 'Super Admin', value: 'SUPER_ADMIN', class: 'text-indigo-600 hover:bg-indigo-50' },
    { label: 'Support Staff', value: 'SUPPORT_STAFF', class: 'text-emerald-600 hover:bg-emerald-50' },
    { label: 'Logistics Staff', value: 'LOGISTICS_STAFF', class: 'text-orange-600 hover:bg-orange-50' },
    { label: 'Customer', value: 'CUSTOMER', class: 'text-blue-600 hover:bg-blue-50' },
  ];

  return (
    <div className={`relative ${isOpen ? 'z-[100]' : ''}`}>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={isOpen ? "bg-slate-100" : ""}
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4 text-slate-500" />}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[40]" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-[110] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2 border-b border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1 tracking-widest">Metadata</p>
                <button 
                    onClick={handleCopyId}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg transition-colors group"
                >
                    {copied ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-green-600">Copied ID!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                            <span>Copy Unique ID</span>
                        </>
                    )}
                </button>
            </div>
            
            <div className="p-2 border-b border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1 tracking-widest">Update Authorization</p>
                <div className="space-y-1 mt-1">
                    {roles.map((role) => (
                        <button 
                            key={role.value}
                            onClick={() => handleUpdateRole(role.value)}
                            disabled={isPending || user.role === role.value}
                            className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold rounded-lg transition-colors group ${role.class} ${user.role === role.value ? 'opacity-40 cursor-default bg-slate-50' : ''}`}
                        >
                            <span>{role.label}</span>
                            {user.role === role.value && <CheckCircle2 className="w-3 h-3" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-2">
                <button 
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    <span>User Activity Log</span>
                </button>
                <button 
                    onClick={handleDelete}
                    disabled={isPending}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                >
                    <Trash2 className="w-4 h-4 opacity-70" />
                    <span className="font-bold">Terminate Session</span>
                </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
