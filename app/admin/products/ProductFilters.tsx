"use client";

import { useRouter } from "next/navigation";
import { Search, Filter, ChevronDown } from "lucide-react";

interface ProductFiltersProps {
  categories: { id: string; name: string }[] | null;
  currentSearch: string;
  currentCategory: string;
}

export default function ProductFilters({ categories, currentSearch, currentCategory }: ProductFiltersProps) {
  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    const params = new URLSearchParams(window.location.search);
    if (search) params.set("search", search);
    else params.delete("search");
    params.delete("page"); // Reset to page 1
    router.push(`/admin/products?${params.toString()}`);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(window.location.search);
    if (val) params.set("category", val);
    else params.delete("category");
    params.delete("page"); // Reset to page 1
    router.push(`/admin/products?${params.toString()}`);
  };


  return (
    <div className="bg-white p-4 rounded-[24px] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4">
      <div className="flex-1 relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <form onSubmit={handleSearch}>
          <input
            name="search"
            defaultValue={currentSearch}
            placeholder="Deep search by SKU, name or attributes..."
            className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
          />
        </form>
      </div>
      <div className="flex gap-4">
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            className="bg-slate-50 border-none rounded-xl py-3 pl-12 pr-10 text-sm focus:ring-2 focus:ring-blue-500 appearance-none font-bold outline-none cursor-pointer"
            onChange={handleCategoryChange}
            defaultValue={currentCategory}
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
