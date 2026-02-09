import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ProductGallery from "@/components/products/ProductGallery";
import { ProductInfo } from "@/components/products/ProductInfo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const { data: products } = await supabase.from('products').select('slug');
  return products?.map(({ slug }) => ({ slug })) || [];
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch Product Details
  const { data: product, error } = await supabase
    .from('products')
    .select(`
        *,
        categories (name, slug)
    `)
    .eq('slug', slug)
    .single();

  if (error || !product) {
      return (
          <div className="py-20 text-center bg-card rounded-xl border border-border">
              <h1 className="text-2xl font-bold mb-4 text-foreground">Product Not Found</h1>
              <Link href="/products" className="text-primary hover:underline">Back to products</Link>
          </div>
      );
  }

  // Parse images array (multiple images support)
  const images = product.images || [product.image_url].filter(Boolean);

  return (
    <div className="animate-in fade-in duration-500">
        
        {/* Detailed Breadcrumb */}
        {/* Mobile Back Button & Desktop Breadcrumb */}
        <div className="flex flex-col gap-4 mb-6">
            <Link 
                href={`/products/category/${product.categories?.slug}`} 
                className="lg:hidden inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-2"
            >
                <div className="bg-secondary/50 p-2 rounded-full mr-2">
                    <ArrowLeft className="h-4 w-4" />
                </div>
                Back to {product.categories?.name}
            </Link>

            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/products" className="hover:text-primary transition-colors">Products</Link> 
                <span>/</span>
                <Link href={`/products/category/${product.categories?.slug}`} className="hover:text-primary transition-colors">
                    {product.categories?.name}
                </Link> 
                <span>/</span>
                <span className="text-foreground font-medium truncate">{product.name}</span>
            </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left: Image Gallery */}
                <div className="lg:col-span-12 xl:col-span-5">
                    <ProductGallery 
                        images={images} 
                        productName={product.name} 
                        modelName={product.model_name}
                    />

                    {/* Interest Box Mobile/Desktop */}
                    <div className="mt-6">
                         <Link href={`/enquiry?product=${encodeURIComponent(product.name)}`}>
                            <Button size="lg" className="w-full font-bold text-base h-12 shadow-lg hover:shadow-primary/25 transition-all">
                                Get Best Quote
                            </Button>
                        </Link>
                        <p className="text-xs text-center text-muted-foreground mt-2">Response within 24 hours</p>
                    </div>
                </div>

                {/* Right: Product Details */}
                <ProductInfo product={product} className="lg:col-span-12 xl:col-span-7" />
            </div>
        </div>
    </div>
  )
}
