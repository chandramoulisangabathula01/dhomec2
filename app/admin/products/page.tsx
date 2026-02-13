import { createClient } from "@/utils/supabase/server";
import { Plus, CloudUpload } from "lucide-react";
import Link from "next/link";
import ProductListClient from "./ProductListClient";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = params.search as string || "";
  const sort = params.sort as string || "newest";
  const limitParam = params.limit as string;
  
  // Logic for "View All"
  const isViewAll = limitParam === "1000";
  const pageSize = isViewAll ? 1000 : 10;
  const page = isViewAll ? 1 : (Number(params.page) || 1);
  const offset = (page - 1) * pageSize;

  const supabase = await createClient();

  // Parallel Data Fetching
  const [categoriesResponse, productsResponse] = await Promise.all([
    supabase.from("categories").select("id, name"),
    (() => {
        let q = supabase
          .from("products")
          .select("*, categories(name)", { count: "exact" })
          .range(offset, offset + pageSize - 1);
        
        // Sorting
        if (sort === "price_asc") q = q.order("price", { ascending: true });
        else if (sort === "name_asc") q = q.order("name", { ascending: true });
        else q = q.order("created_at", { ascending: false });

        if (search) q = q.ilike("name", `%${search}%`);
        return q;
    })()
  ]);

  const categories = categoriesResponse.data || [];
  const products = productsResponse.data || [];
  const totalCount = productsResponse.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Products</h1>
          <p className="text-xs font-bold text-slate-400 mt-1">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-3">
            <Link href="/admin/products/import">
                <button className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl shadow-sm text-sm font-bold hover:bg-slate-50 transition-colors">
                    <CloudUpload className="w-4 h-4" />
                    <span>Import</span>
                </button>
            </Link>
            <Link href="/admin/products/new">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#4C63FC] text-white rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                </button>
            </Link>
        </div>
      </div>

      {/* Client Component for Interactive Table */}
      <ProductListClient 
        products={products}
        categories={categories}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={page}
        currentSort={sort}
        currentSearch={search}
      />

    </div>
  );
}
