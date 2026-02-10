import { createClient } from "@/utils/supabase/server";
import { 
  Plus, 
  Edit, 
  Trash2, 
  SortAsc, 
  Package, 
  Star,
  ExternalLink,
  Search
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductFilters from "./ProductFilters";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search = params.search as string || "";
  const category = params.category as string || "";
  const sort = params.sort as string || "newest";
  const page = Number(params.page) || 1;
  const pageSize = 8;
  const offset = (page - 1) * pageSize;

  const supabase = await createClient();

  // Parallel Data Fetching for Optimization
  const [categoriesResponse, productsResponse] = await Promise.all([
    supabase.from("categories").select("id, name"),
    (() => {
        let q = supabase
          .from("products")
          .select("*, categories(name)", { count: "exact" })
          .range(offset, offset + pageSize - 1);
        
        // Dynamic Sorting Logic
        if (sort === "price_asc") q = q.order("price", { ascending: true });
        else if (sort === "price_desc") q = q.order("price", { ascending: false });
        else if (sort === "name_asc") q = q.order("name", { ascending: true });
        else q = q.order("created_at", { ascending: false });

        if (search) q = q.ilike("name", `%${search}%`);
        if (category) q = q.eq("category_id", category);
        return q;
    })()
  ]);

  const categories = categoriesResponse.data;
  const products = productsResponse.data;
  const totalCount = productsResponse.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Product Inventory</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Overseeing {totalCount} assets across your store taxonomy</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 font-bold gap-2">
            <Plus className="w-5 h-5" />
            Launch New Product
          </Button>
        </Link>
      </div>

      {/* Filter Bar - Client Component */}
      <div className="flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
            <ProductFilters 
                categories={categories} 
                currentSearch={search} 
                currentCategory={category} 
            />
        </div>
        <div className="flex gap-2">
            {[
                { label: "Newest", value: "newest" },
                { label: "Price ↑", value: "price_asc" },
                { label: "Name", value: "name_asc" }
            ].map((opt) => (
                <Link 
                    key={opt.value}
                    href={`/admin/products?sort=${opt.value}${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}`}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        sort === opt.value ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                >
                    {opt.label}
                </Link>
            ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse table-fixed min-w-[1000px] lg:min-w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 font-black text-slate-500 uppercase tracking-widest text-[10px] w-5/12">Reference & Name</th>
                <th className="p-6 font-black text-slate-500 uppercase tracking-widest text-[10px] w-2/12">Financials</th>
                <th className="p-6 font-black text-slate-500 uppercase tracking-widest text-[10px] w-2/12">Classification</th>
                <th className="p-6 font-black text-slate-500 uppercase tracking-widest text-[10px] w-2/12">Status</th>
                <th className="p-6 font-black text-slate-500 uppercase tracking-widest text-[10px] text-right w-1/12">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products?.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="p-6 overflow-hidden">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105 relative">
                          {product.image_url ? (
                              <img src={product.image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <Package className="w-6 h-6" />
                              </div>
                          )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900 text-base leading-tight block truncate w-full" title={product.name}>
                            {product.name}
                          </span>
                          {product.is_featured && (
                              <Star className="w-4 h-4 fill-blue-500 text-blue-500 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 shrink-0">#{product.slug?.toUpperCase()}</span>
                          <Link href={`/product/${product.slug}`} target="_blank" className="text-slate-400 hover:text-blue-600 shrink-0">
                              <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </td>
                <td className="p-6">
                  <div className="font-black text-slate-900 text-lg">₹ {product.price?.toLocaleString()}</div>
                  <div className="text-[9px] font-bold text-green-600 uppercase tracking-widest">+ Tax Applicable</div>
                </td>
                <td className="p-6">
                    <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase px-3 py-1.5 bg-slate-100 rounded-full">
                        {(product.categories as any)?.name || 'Uncategorized'}
                    </span>
                </td> 
                <td className="p-6">
                    <div className="flex flex-col gap-1.5">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-green-700">
                           <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                           Active in Market
                        </span>
                        {product.is_featured && (
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter bg-blue-50 px-2 py-0.5 rounded border border-blue-100 w-fit">Featured Highlight</span>
                        )}
                    </div>
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/admin/products/edit/${product.id}`}>
                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-white hover:shadow-md hover:text-blue-600">
                          <Edit className="w-4 h-4" />
                        </Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-white hover:shadow-md hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
                <tr>
                    <td colSpan={5} className="p-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-6 bg-slate-50 rounded-full border border-dashed border-slate-200">
                                <Search className="w-8 h-8 text-slate-300" />
                            </div>
                            <div className="max-w-xs mx-auto">
                                <h3 className="text-lg font-bold text-slate-900">Search Yielded No Results</h3>
                                <p className="text-sm text-slate-500 mt-1">We couldn't find any products matching your deep search parameters.</p>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
          </table>
        </div>

        {/* Optimized Pagination Controls */}
        {totalPages > 1 && (
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Cluster {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                    <Link href={`/admin/products?page=${page - 1}${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}${sort ? `&sort=${sort}` : ''}`} 
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${page <= 1 ? 'pointer-events-none opacity-30 text-slate-300' : 'bg-white border border-slate-200 text-slate-600 hover:bg-white hover:shadow-sm'}`}>
                        Previous Sequence
                    </Link>
                    <Link href={`/admin/products?page=${page + 1}${search ? `&search=${search}` : ''}${category ? `&category=${category}` : ''}${sort ? `&sort=${sort}` : ''}`} 
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${page >= totalPages ? 'pointer-events-none opacity-30 text-slate-300' : 'bg-slate-900 text-white shadow-lg'}`}>
                        Next Sequence
                    </Link>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}



