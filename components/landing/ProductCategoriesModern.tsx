"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { categoryData } from "@/lib/data/categories";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  href?: string; 
};

function CategoryCard({ category }: { category: Category }) {
    return (
        <Link 
          href={`/products/category/${category.slug}`}
          className="group bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
        >
          <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
             {category.image_url ? (
                 <Image 
                    src={category.image_url} 
                    alt={category.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                 />
             ) : (
                 <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                     <span className="text-4xl font-bold opacity-20">{category.name.charAt(0)}</span>
                 </div>
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
          </div>
          
          <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                 <h3 className="text-xl font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                    {category.name}
                 </h3>
                 <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-red-600 transition-colors transform group-hover:translate-x-1" />
              </div>
              
              <p className="text-slate-600 leading-relaxed text-sm">
                {category.description}
              </p>
          </div>
        </Link>
    );
}

export function ProductCategoriesModern() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const isDemo = localStorage.getItem("dhomec_demo_auth") === "true";
        if (isDemo) {
            setCategories(categoryData);
            setLoading(false);
            return;
        }

        // Fetch categories, prioritizing featured ones
        let query = supabase
          .from('categories')
          .select('*')
          .order('is_featured', { ascending: false }) // Featured first
          .order('created_at', { ascending: false }); // Then newest

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching categories:", error.message || JSON.stringify(error) || error);
          setCategories(categoryData);
        } else if (data && data.length > 0) {
          setCategories(data);
        } else {
            setCategories(categoryData);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        setCategories(categoryData);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Manual image overrides for categories missing images in DB
  const categoryImages: Record<string, string> = {
    "Door Closer": "/images/moterline-kapvsp-anti-panic-telescopic-automatic-sliding-glass-door-500x500.webp",
    "Infrared Detection Radar": "/images/motorline-ms01-traffic-control-traffic-lights-500x500.webp",
    "Swing Shutter": "/images/moterline-rosso-evo-motor-sectional-door-500x500.webp",
    "Microwave Sensor": "/images/motorline-traffic-control-traffic-lights-500x500.webp",
    "Mild Steel Gate": "/images/motorline-jag-automate-swing-gates-500x500.webp",
    "Fire Curtains": "/images/moterline-fix-roll-up-rapid-door-500x500.webp"
  };

  const processedCategories = categories.map(cat => ({
    ...cat,
    image_url: categoryImages[cat.name] || cat.image_url
  }));

  if (loading) {
      return (
        <section className="py-20 bg-slate-50">
            <div className="container-width">
                <div className="flex justify-between items-end mb-12">
                    <div className="h-8 w-64 bg-slate-200 animate-pulse rounded mb-4"></div>
                    <div className="h-4 w-32 bg-slate-200 animate-pulse rounded hidden md:block"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1,2,3].map(i => (
                        <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-xl"></div>
                    ))}
                </div>
            </div>
        </section>
      );
  }

  return (
    <section id="categories" className="py-20 bg-slate-50">
      <div className="container-width">
        <div className="flex justify-between items-end mb-12">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Product Categories</h2>
                <p className="text-slate-600 max-w-2xl">
                    Comprehensive automation and security solutions for every requirement.
                </p>
            </div>
            <Link href="/products" className="hidden md:flex items-center text-red-600 font-semibold hover:text-red-700 transition-colors">
                View All Categories <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {processedCategories.slice(0, 6).map((cat, idx) => (
            <CategoryCard key={cat.id || idx} category={cat} />
          ))}
        </div>
        
        <div className="mt-10 md:hidden text-center">
            <Link href="/products" className="inline-flex items-center text-red-600 font-semibold hover:text-red-700 transition-colors">
                View All Categories <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </div>
      </div>
    </section>
  );
}
