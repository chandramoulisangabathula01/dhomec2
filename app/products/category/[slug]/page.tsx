import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";

export const revalidate = 3600;

export async function generateStaticParams() {
  const { data: categories } = await supabase.from('categories').select('slug');
  // Filter out slugs that are too long for the file system
  return categories
    ?.filter(({ slug }) => slug && slug.length < 200)
    .map(({ slug }) => ({ slug })) || [];
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {products && products.length > 0 ? products.map((product) => (
              <ProductCard key={product.id} product={product} />
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
