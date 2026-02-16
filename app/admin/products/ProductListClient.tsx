"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { 
  Search, 
  Filter, 
  RotateCw, 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Package, 
  Edit, 
  Trash2,
  List,
  Grid
} from "lucide-react";

export default function ProductListClient({ 
  products, 
  categories, 
  totalCount, 
  totalPages, 
  currentPage: page, 
  currentSort: sort,
  currentSearch: search 
}: any) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) return;
    setDeleting(productId);
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      
      if (error) {
        // Handle Foreign Key Constraint Violation (product used in orders)
        if (error.code === '23503') { 
            if (confirm(`Cannot delete "${productName}" because it is part of existing orders/carts. \n\nWould you like to mark it as "Closed" (Hidden) instead?`)) {
                const { error: updateError } = await supabase
                    .from('products')
                    .update({ status: 'closed' })
                    .eq('id', productId);
                
                if (updateError) throw updateError;
                alert("Product marked as Closed.");
                router.refresh();
            }
        } else {
            throw error;
        }
      } else {
        router.refresh();
      }
    } catch (err: any) {
      alert('Failed to delete product: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  // Toggle Selection
  const handleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p: any) => p.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleViewAll = () => {
    const params = new URLSearchParams(searchParams);
    if (params.get("limit") === "1000") {
        params.delete("limit"); // Back to pagination
    } else {
        params.set("limit", "1000"); // Show all (max 1000)
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSort = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", newSort);
    router.push(`${pathname}?${params.toString()}`);
  }

  const isViewAll = searchParams.get("limit") === "1000";

  return (
    <div className="space-y-6">
      
      {/* Filters & Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative w-full md:w-96">
             <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
                defaultValue={search}
                placeholder="Search products..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-medium text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4C63FC]/10 focus:border-[#4C63FC]"
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        const params = new URLSearchParams(searchParams);
                        params.set("search", e.currentTarget.value);
                        params.delete("page");
                        router.push(`${pathname}?${params.toString()}`);
                    }
                }}
             />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
             <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100 shrink-0">
                 <button onClick={() => handleSort('newest')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${sort === 'newest' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}>Newest</button>
                 <button onClick={() => handleSort('price_asc')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${sort === 'price_asc' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}>Price</button>
                 <button onClick={() => handleSort('name_asc')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${sort === 'name_asc' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}>Name</button>
             </div>
             
             {/* View All Toggle */}
             <button 
                onClick={handleViewAll}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-colors shrink-0 ${isViewAll ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                title="Toggle View All"
             >
                {isViewAll ? <List className="w-4 h-4" /> : <List className="w-4 h-4" />}
                {isViewAll ? "Paged View" : "View All"}
             </button>

             <button 
                onClick={handleRefresh} 
                className={`p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition-colors hidden md:block ${isRefreshing ? 'animate-spin text-blue-500' : ''}`}
             >
                <RotateCw className="w-4 h-4" />
             </button>
          </div>
      </div>

      {/* Product Table */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
             <thead>
              <tr className="text-xs text-slate-400 border-b border-slate-50">
                <th className="pb-3 pl-4 font-bold w-10">
                    <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-[#4C63FC] focus:ring-[#4C63FC] cursor-pointer"
                        checked={selectedIds.size === products.length && products.length > 0}
                        onChange={handleSelectAll}    
                    />
                </th>
                <th className="pb-3 font-bold uppercase tracking-wider">Product</th>
                <th className="pb-3 font-bold uppercase tracking-wider">Category</th>
                <th className="pb-3 font-bold uppercase tracking-wider">Type</th>
                <th className="pb-3 font-bold uppercase tracking-wider">Price</th>
                <th className="pb-3 font-bold uppercase tracking-wider">Stock</th>
                <th className="pb-3 font-bold uppercase tracking-wider">Status</th>
                <th className="pb-3 font-bold w-10"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {products.length > 0 ? products.map((product: any) => (
                <tr key={product.id} className={`group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0 ${selectedIds.has(product.id) ? 'bg-blue-50/30' : ''}`}>
                  <td className="py-4 pl-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-[#4C63FC] focus:ring-[#4C63FC] cursor-pointer" 
                        checked={selectedIds.has(product.id)}
                        onChange={() => handleSelectOne(product.id)}
                      />
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {product.image_url ? (
                              <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                              <Package className="w-5 h-5 text-slate-300" />
                          )}
                       </div>
                       <div>
                          <p className="font-bold text-slate-700 truncate max-w-[200px] hover:text-[#4C63FC] cursor-pointer transition-colors" onClick={() => router.push(`/admin/products/edit/${product.id}`)}>
                            {product.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">#{product.slug?.slice(0,6)}</p>
                       </div>
                    </div>
                  </td>
                  <td className="py-4">
                     <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                        {(product.categories as any)?.name || 'Uncategorized'}
                     </span>
                  </td>
                  <td className="py-4">
                     <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                        product.type === 'CONSULTATION_ONLY' 
                        ? 'bg-purple-50 text-purple-600 border-purple-100' 
                        : 'bg-blue-50 text-blue-600 border-blue-100'
                     }`}>
                        {product.type === 'CONSULTATION_ONLY' ? 'Consultation' : 'Direct Sale'}
                     </span>
                  </td>
                  <td className="py-4 font-black text-slate-900 border-dashed border-b border-slate-200 w-fit">
                    ₹{product.price?.toLocaleString()}
                  </td>
                  <td className="py-4">
                    <span className={`text-xs font-bold ${product.stock_quantity > 0 ? 'text-slate-600' : 'text-red-500'}`}>
                        {product.stock_quantity || 0} units
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                      product.stock_quantity > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    }`}>
                       {product.stock_quantity > 0 ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                       {product.stock_quantity > 0 ? "Active" : "Out of Stock"}
                    </span>
                  </td>
                  <td className="py-4 text-right pr-4">
                     <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/products/edit/${product.id}`}>
                            <button className="p-1.5 text-slate-400 hover:text-[#4C63FC] hover:bg-blue-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                        </Link>
                        <button 
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={deleting === product.id}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <Trash2 className={`w-4 h-4 ${deleting === product.id ? 'animate-pulse' : ''}`} />
                        </button>
                     </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                     <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                            <Search className="w-5 h-5 text-slate-300" />
                        </div>
                        <p>No products found matching your search.</p>
                     </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination - Only show if NOT viewing all */}
        {!isViewAll && totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-2">
                <p className="text-xs font-bold text-slate-400">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                    <Link href={`${pathname}?page=${page - 1}${search ? `&search=${search}` : ''}${sort ? `&sort=${sort}` : ''}`} className={`px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 transition-colors ${page <= 1 ? 'pointer-events-none opacity-50 bg-slate-50 text-slate-400' : 'text-slate-600 hover:bg-slate-50'}`}>Previous</Link>
                    <Link href={`${pathname}?page=${page + 1}${search ? `&search=${search}` : ''}${sort ? `&sort=${sort}` : ''}`} className={`px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 transition-colors ${page >= totalPages ? 'pointer-events-none opacity-50 bg-slate-50 text-slate-400' : 'text-slate-600 hover:bg-slate-50'}`}>Next</Link>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
