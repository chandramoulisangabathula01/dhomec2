"use client";

import { useState } from "react";
import { Search, Settings } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Smart search: redirect based on what they might be looking for
    // or default to products if unspecified
    let targetPath = "/admin/products";
    if (pathname.includes("/orders")) targetPath = "/admin/orders";
    if (pathname.includes("/users")) targetPath = "/admin/users";
    if (pathname.includes("/tickets")) targetPath = "/admin/tickets";

    router.push(`${targetPath}?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-20">
      <form onSubmit={handleSearch} className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 w-96 group focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
        <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
        <input 
          type="text" 
          placeholder="Search products, orders, or users..." 
          className="bg-transparent border-none focus:outline-none text-xs w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-[10px] font-black tracking-widest uppercase">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Live Infrastructure
        </div>
        <Link href="/admin/settings">
          <div className="p-2 hover:bg-slate-100 rounded-full transition-all group">
            <Settings className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:rotate-45 transition-all" />
          </div>
        </Link>
      </div>
    </header>
  );
}
