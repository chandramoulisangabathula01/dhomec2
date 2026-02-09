import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const revalidate = 3600;

export async function generateStaticParams() {
  const { data: categories } = await supabase.from('categories').select('slug');
  return categories?.map(({ slug }) => ({ slug })) || [];
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. Fetch Category Details
  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !category) {
      return (
          <div className="py-20 text-center bg-card rounded-xl border border-border">
              <h1 className="text-2xl font-bold mb-4 text-foreground">Category Not Found</h1>
              <Link href="/products" className="text-primary hover:underline">Back to products</Link>
          </div>
      );
  }

  // 2. Fetch Products in this Category
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', category.id)
    .order('is_featured', { ascending: false });

  return (
    <div>
        <div className="mb-8">
            <Link href="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Categories
            </Link>
            <h1 className="text-3xl font-bold text-foreground">{category.name}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">{category.description}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           {products && products.length > 0 ? products.map((product) => (
              <div key={product.id} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                  <div className="h-56 bg-white relative overflow-hidden flex items-center justify-center p-4">
                      {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name} 
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                          />
                      ) : (
                          <div className="text-muted-foreground text-sm">
                             No Image
                          </div>
                      )}
                      {product.is_featured && (
                          <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded shadow-sm">
                              Featured
                          </div>
                      )}
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                      <h2 className="text-xl font-bold text-foreground mb-2 line-clamp-2">{product.name}</h2>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">{product.description}</p>
                      
                      <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-border">
                          <Link href={`/products/${product.slug}`} className="flex-1">
                             <Button variant="outline" className="w-full text-xs h-9">View Details</Button>
                          </Link>
                          <Link href={`/enquiry?product=${encodeURIComponent(product.name)}`} className="flex-1">
                             <Button className="w-full text-xs h-9 font-bold bg-primary hover:bg-primary/90">
                                 Get Quote
                             </Button>
                          </Link>
                      </div>
                  </div>
              </div>
           )) : (
              <div className="col-span-3 text-center py-16 bg-muted/30 rounded-xl border border-dashed border-border">
                  <p className="text-muted-foreground mb-2">No products available in this category yet.</p>
                  <p className="text-sm text-muted-foreground/60">Please check back soon.</p>
              </div>
           )}
        </div>
    </div>
  )
}
