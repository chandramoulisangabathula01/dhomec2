"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, TrendingUp } from "lucide-react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

import { topSellers, featuredItems } from "@/lib/data/featured";

export function FeaturedProductsModern() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-slate-50 to-white border-y border-slate-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-red-50/30 to-transparent rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      
      <div className="container-width relative">
        
        {/* Top Sellers Section */}
        <div className="mb-24">
            <motion.div 
              className="flex items-center justify-between mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
                <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-amber-50">
                        <TrendingUp className="h-4 w-4 text-amber-600" />
                      </div>
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Trending</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Top Sellers</h2>
                    <p className="text-slate-500 mt-2 text-lg">Our most popular automation solutions.</p>
                </div>
                <Link href="/products">
                    <Button variant="outline" className="hidden md:flex gap-2 rounded-xl border-slate-200 hover:border-red-200 hover:text-red-600 transition-all">
                        View All <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {topSellers.map((product, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 30 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                    >
                      <Link href={`/products/${product.slug}`} className="block group">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-400 overflow-hidden h-full flex flex-col">
                            <div className="aspect-square bg-slate-50 relative overflow-hidden">
                                <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
                                />
                                <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-current" /> Best Seller
                                </div>
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-2">{product.category}</div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">{product.name}</h3>
                                <div className="mt-auto pt-4 flex items-center justify-between">
                                    <span className="text-slate-500 text-sm font-medium">{product.price}</span>
                                    <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                      </Link>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* Featured Products Section */}
        <div>
            <motion.div 
              className="flex items-center justify-between mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
                <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-blue-50">
                        <Star className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Curated</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Featured Products</h2>
                    <p className="text-slate-500 mt-2 text-lg">Latest innovations in access control.</p>
                </div>
                <Link href="/products">
                    <Button variant="outline" className="hidden md:flex gap-2 rounded-xl border-slate-200 hover:border-red-200 hover:text-red-600 transition-all">
                        View All <ArrowRight className="h-4 w-4" />
                    </Button>
                </Link>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {featuredItems.map((product, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 30 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                    >
                      <Link href={`/products/${product.slug}`} className="block group">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-400 overflow-hidden h-full flex flex-col">
                            <div className="aspect-square bg-slate-50 relative overflow-hidden">
                                <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600"
                                />
                                {product.badge && (
                                    <div className={`absolute top-3 right-3 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg ${
                                        product.badge === 'New' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 
                                        product.badge === 'Featured' ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                        product.badge === 'Popular' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-slate-700 to-slate-800'
                                    }`}>
                                        {product.badge}
                                    </div>
                                )}
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-2">{product.category}</div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-red-600 transition-colors">{product.name}</h3>
                                <div className="mt-auto pt-4 flex items-center justify-between">
                                    <span className="text-slate-500 text-sm font-medium">View Details</span>
                                    <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                      </Link>
                    </motion.div>
                ))}
            </div>
        </div>
        
        {/* Bottom CTA */}
        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
            <Link href="/products">
                <Button className="bg-slate-900 text-white hover:bg-slate-800 px-10 py-7 text-lg rounded-2xl shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:-translate-y-0.5 transition-all">
                    View Full Catalog <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </Link>
        </motion.div>
      </div>
    </section>
  );
}
