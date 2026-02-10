"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";

export default function ProductCard({ product }: { product: any }) {
    const { addItem } = useCart();
    const { addToast } = useToast();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); 
        
        addItem({
            id: product.id,
            name: product.name,
            price: product.price || 0,
            quantity: 1,
            image_url: product.image_url,
            slug: product.slug
        });
        
        addToast(`Added ${product.name} to cart`, "success");
    };

    return (
        <div key={product.id} className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            {/* Image Container */}
            <div className="aspect-square bg-slate-100 overflow-hidden relative">
                {product.image_url ? (
                    <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500" 
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                        No Image
                    </div>
                )}
                
                {product.is_featured && (
                    <div className="absolute top-3 right-3 z-10">
                        <Badge variant="secondary" className="font-bold shadow-sm">Featured</Badge>
                    </div>
                )}
                
                {/* Overlay actions (optional) */}
                <Link href={`/products/${product.slug}`} className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <Link href={`/products/${product.slug}`} className="block mb-1">
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-lg">
                        {product.name}
                    </h3>
                </Link>
                {product.model_name && (
                    <p className="text-sm text-slate-500 mb-3 truncate font-medium">{product.model_name}</p>
                )}
                
                <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                    <div>
                        {product.price ? (
                            <p className="text-xl font-extrabold text-slate-900">₹{product.price.toLocaleString('en-IN')}</p>
                        ) : (
                            <Link href={`/enquiry?product=${encodeURIComponent(product.name)}`} className="text-sm font-bold text-blue-600 hover:underline">
                                Request Quote
                            </Link>
                        )}
                    </div>
                    
                    {product.price && (
                        <button 
                            onClick={handleAddToCart}
                            className="bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-900 p-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-sm"
                            aria-label="Add to cart"
                            title="Add to Cart"
                        >
                            <ShoppingCart className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
