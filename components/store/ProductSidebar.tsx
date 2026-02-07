import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";

export async function ProductSidebar() {
    // Fetch categories and their products
    // Fetch categories and their products
    const { data: categories, error } = await supabase
        .from('categories')
        .select(`
            id, 
            name, 
            slug,
            products (id, name, slug)
        `)
        .order('name');
    
    if (error) {
        console.error('Error fetching categories for sidebar:', error);
        return <div className="p-4 text-red-500 text-sm">Error loading sidebar: {error.message}</div>;
    }
    
    return (
        <aside className="w-full bg-white rounded-xl border border-slate-200 shadow-sm sticky top-24 flex flex-col max-h-[calc(100vh-8rem)]">
             <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-2 flex-shrink-0 rounded-t-xl">
                 <Package className="h-5 w-5 text-red-600" />
                 <h2 className="font-bold text-lg text-red-800">Our Products</h2>
             </div>
             
             {/* Scrollable Content Area */}
             <div className="divide-y divide-slate-100 overflow-y-auto custom-scrollbar rounded-b-xl">
                 {categories?.map((cat) => (
                     <div key={cat.id} className="group">
                         {/* Category Title */}
                         <Link href={`/products/category/${cat.slug}`} className="block">
                            <div className="p-3 bg-slate-50 hover:bg-slate-100 font-semibold text-slate-800 flex justify-between items-center cursor-pointer transition-colors text-sm sticky top-0 z-10 backdrop-blur-sm">
                                {cat.name}
                                <ChevronRight className="h-4 w-4 text-slate-400 opacity-50 group-hover:opacity-100" />
                            </div>
                         </Link>
                         {/* Sub-Items (Products) */}
                         <div className="bg-white py-1">
                             {cat.products && cat.products.length > 0 ? (
                                 cat.products.map((p: any) => (
                                     <Link 
                                        href={`/products/${p.slug}`} 
                                        key={p.id} 
                                        className="block px-4 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 border-l-2 border-transparent hover:border-red-600 transition-all truncate"
                                        title={p.name}
                                     >
                                         {p.name}
                                     </Link>
                                 ))
                             ) : (
                                 <div className="px-4 py-2 text-xs text-slate-400 italic">No products</div>
                             )}
                         </div>
                     </div>
                 ))}
                 
                 {(!categories || categories.length === 0) && (
                     <div className="p-4 text-sm text-slate-500">Loading categories...</div>
                 )}
             </div>
        </aside>
    )
}
