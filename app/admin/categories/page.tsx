import { createClient } from "@/utils/supabase/server";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Layers, 
  Image as ImageIcon,
  Tag,
  ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  
  const { data: categories } = await supabase
    .from("categories")
    .select("*, products(count)")
    .order("name", { ascending: true });

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Taxonomy & Categories</h1>
          <p className="text-slate-500 mt-2 font-medium">Organize your global product distribution hierarchy</p>
        </div>
        <Button className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 shadow-2xl shadow-slate-900/20 font-bold gap-3 group">
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Create New Category
        </Button>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-600 rounded-[32px] p-8 text-white shadow-xl shadow-blue-200/50 relative overflow-hidden group">
              <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Total Logic Groups</p>
                  <h3 className="text-4xl font-black">{categories?.length || 0}</h3>
              </div>
              <Layers className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
          </div>
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Featured Categories</p>
                <h3 className="text-4xl font-black text-slate-900">
                    {categories?.filter(c => c.is_featured).length || 0}
                </h3>
          </div>
          <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer hover:border-blue-200 transition-colors">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Navigation Health</p>
                    <h3 className="text-xl font-bold text-slate-900">100% Optimized</h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-all">
                    <ArrowUpRight className="w-6 h-6" />
                </div>
          </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories?.map((category) => (
          <div key={category.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group flex flex-col">
            <div className="h-48 bg-slate-50 relative overflow-hidden group-hover:bg-slate-100 transition-colors">
                {category.image_url ? (
                    <img src={category.image_url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <ImageIcon className="w-16 h-16" />
                    </div>
                )}
                {category.is_featured && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full shadow-lg">
                        FEATURED
                    </div>
                )}
            </div>
            
            <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{category.name}</h2>
                        <p className="text-xs font-mono text-slate-400 mt-1">/{category.slug}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400 font-black text-xs">
                        {(category.products as any)?.[0]?.count || 0} ITEMS
                    </div>
                </div>
                
                <p className="text-sm text-slate-500 line-clamp-2 font-medium mb-8 leading-relaxed">
                    {category.description || 'No specialized description provided for this business logic category.'}
                </p>

                <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-blue-50 hover:text-blue-600 transition-all">
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-red-50 hover:text-red-600 transition-all">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                    <Link href={`/category/${category.slug}`} target="_blank">
                        <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 gap-2">
                            View Live
                            <ArrowUpRight className="w-3 h-3" />
                        </Button>
                    </Link>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
