"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowRight, Layers } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { categoryData } from "@/lib/data/categories";
import { motion, useInView } from "framer-motion";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  href?: string; 
};

function CategoryCard({ category, idx }: { category: Category; idx: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });
    
    return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: idx * 0.08 }}
        >
          <Link 
            href={`/products/category/${category.slug}`}
            className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-400 flex flex-col h-full"
          >
            <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
               {category.image_url ? (
                   <Image 
                      src={category.image_url} 
                      alt={category.name} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-600" 
                   />
               ) : (
                   <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-300">
                       <span className="text-5xl font-extrabold opacity-30">{category.name.charAt(0)}</span>
                   </div>
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
               
               {/* Category name overlay on image */}
               <div className="absolute bottom-4 left-5 z-10">
                  <h3 className="text-xl font-bold text-white drop-shadow-lg">
                    {category.name}
                  </h3>
               </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
                <p className="text-slate-500 leading-relaxed text-sm flex-1 line-clamp-2">
                  {category.description}
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                   <span className="text-xs font-bold text-red-600 uppercase tracking-wider group-hover:tracking-widest transition-all">
                     Explore
                   </span>
                   <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-600 group-hover:text-white transition-all">
                     <ArrowRight className="h-4 w-4" />
                   </div>
                </div>
            </div>
          </Link>
        </motion.div>
    );
}

export function ProductCategoriesModern() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const isDemo = localStorage.getItem("dhomec_demo_auth") === "true";
        if (isDemo) {
            setCategories(categoryData);
            setLoading(false);
            return;
        }

        let query = supabase
          .from('categories')
          .select('*')
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false });

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
        <section className="py-24 bg-slate-50">
            <div className="container-width">
                <div className="flex justify-between items-end mb-12">
                    <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-lg mb-4"></div>
                    <div className="h-4 w-32 bg-slate-200 animate-pulse rounded-lg hidden md:block"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100">
                          <div className="h-56 bg-slate-100 animate-pulse" />
                          <div className="p-5 space-y-3">
                            <div className="h-4 w-3/4 bg-slate-100 animate-pulse rounded" />
                            <div className="h-3 w-full bg-slate-100 animate-pulse rounded" />
                          </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
      );
  }

  return (
    <section ref={sectionRef} id="categories" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-red-50/50 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
      
      <div className="container-width relative">
        <div className="flex justify-between items-end mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-red-50">
                    <Layers className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Categories</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Our Product Categories</h2>
                <p className="text-slate-500 max-w-2xl text-lg">
                    Comprehensive automation and security solutions for every requirement.
                </p>
            </motion.div>
            <Link href="/products" className="hidden md:flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 transition-colors group">
                View All Categories 
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedCategories.slice(0, 6).map((cat, idx) => (
            <CategoryCard key={cat.id || idx} category={cat} idx={idx} />
          ))}
        </div>
        
        <div className="mt-10 md:hidden text-center">
            <Link href="/products" className="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 transition-colors">
                View All Categories <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
        </div>
      </div>
    </section>
  );
}
