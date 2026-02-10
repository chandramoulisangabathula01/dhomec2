"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Shield, User as UserIcon, Copy, Trash2, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toggleAdminRole, deleteUserProfile } from "./actions";

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

  const handleToggleAdmin = () => {
    startTransition(async () => {
        try {
            await toggleAdminRole(user.id, user.role);
            setIsOpen(false);
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
        } catch (error: any) {
            alert(error.message);
        }
    });
  };

  return (
    <div className={`relative ${isOpen ? 'z-[30]' : ''}`}>
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
          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-[50] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-2 border-b border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1">Management</p>
                <button 
                    onClick={handleCopyId}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors group"
                >
                    {copied ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-green-600">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                            <span>Copy User ID</span>
                        </>
                    )}
                </button>
                <button 
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors group"
                >
                    <UserIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                    <span>View Activity</span>
                </button>

            </div>
            
            <div className="p-2">
                <button 
                    onClick={handleToggleAdmin}
                    disabled={isPending}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                >
                    <Shield className="w-4 h-4 opacity-70" />
                    <span className="font-medium">{user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}</span>
                </button>
                <button 
                    onClick={handleDelete}
                    disabled={isPending}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                >
                    <Trash2 className="w-4 h-4 opacity-70" />
                    <span className="font-medium">Delete Profile</span>
                </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

