import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function Products() {
  // Fetch categories with product IDs to count them
  let { data: categories, error } = await supabase
    .from('categories')
    .select(`
        *,
        products (id)
    `)
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return <div className="p-4 text-red-500">Error loading categories: {error.message}</div>;
  }

  // Manual image overrides
  const categoryImages: Record<string, string> = {
    "Door Closer": "/images/moterline-kapvsp-anti-panic-telescopic-automatic-sliding-glass-door-500x500.webp",
    "Infrared Detection Radar": "/images/motorline-ms01-traffic-control-traffic-lights-500x500.webp",
    "Swing Shutter": "/images/moterline-rosso-evo-motor-sectional-door-500x500.webp",
    "Microwave Sensor": "/images/motorline-traffic-control-traffic-lights-500x500.webp",
    "Mild Steel Gate": "/images/motorline-jag-automate-swing-gates-500x500.webp",
    "Fire Curtains": "/images/moterline-fix-roll-up-rapid-door-500x500.webp",
    "Gate Automation": "/images/motorline-lince-automate-swing-gates-500x500.webp",
    "Road Traffic Control": "/images/moterline-sigma-x-electromechanical-barrier-500x500.webp",
    "Rapid Doors": "/images/moterline-fix-roll-up-rapid-door-500x500.webp",
    "Glass Doors": "/images/moterline-kapvsp-anti-panic-telescopic-automatic-sliding-glass-door-500x500.webp",
    "Sectional Doors": "/images/moterline-rosso-evo-motor-sectional-door-500x500.webp",
    "Sensors & Accessories": "/images/motorline-ms01-traffic-control-traffic-lights-500x500.webp"
  };

   const displayCategories = categories?.map((cat: any) => ({
      ...cat,
      image_url: categoryImages[cat.name] || cat.image_url,
      count: cat.products?.length || 0
  })) || [];

  return (
    <div>
        <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">Product Categories</h2>
            <p className="text-muted-foreground">Select a category to view models.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {displayCategories.length > 0 ? displayCategories.map((cat) => (
              <Link href={`/products/category/${cat.slug}`} key={cat.id} className="block group">
                 <div className="bg-card rounded-xl border border-border p-4 shadow-sm group-hover:shadow-md transition-all hover:border-primary h-full flex flex-col">
                    <div className="bg-white rounded-lg h-40 mb-4 relative overflow-hidden">
                        {cat.image_url ? (
                             <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                             <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted group-hover:scale-105 transition-transform duration-500"></div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-foreground shadow-sm z-10">
                           {cat.count} Models
                        </div>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{cat.name}</h2>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{cat.description || 'Industrial standard solutions'}</p>
                    </div>
                    <div className="mt-4 text-primary text-sm font-medium flex items-center">
                        View Products <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                 </div>
              </Link>
           )) : (
              <div className="col-span-3 text-center py-12 bg-muted/30 rounded-lg border border-dashed border-border">
                 <p className="text-muted-foreground">No product categories available yet.</p>
              </div>
           )}
        </div>
    </div>
  )
}
