"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Ruler, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/ui/toast";

interface StickyMobileBarProps {
  product: {
    id: string;
    name: string;
    price: number;
    slug: string;
    image_url?: string;
    type?: string;
  };
  onBookMeasurement?: () => void;
}

export function StickyMobileBar({ product, onBookMeasurement }: StickyMobileBarProps) {
  const [visible, setVisible] = useState(false);
  const { addItem } = useCart();
  const { addToast } = useToast();
  const isConsultation = product.type === "CONSULTATION_ONLY";

  useEffect(() => {
    const handleScroll = () => {
      // Show bar when scrolled past 400px (when main CTA is out of view)
      setVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price || 0,
      quantity: 1,
      image_url: product.image_url || "",
      slug: product.slug,
    });
    addToast(`Added ${product.name} to cart`, "success");
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden animate-in slide-in-from-bottom duration-300">
      <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-black text-slate-900 truncate">{product.name}</p>
            {!isConsultation && product.price > 0 && (
              <p className="text-base font-black text-slate-900">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
            )}
            {isConsultation && (
              <p className="text-xs font-bold text-amber-600 italic">Custom Quote</p>
            )}
          </div>

          {/* CTA Button */}
          {isConsultation ? (
            <Button
              onClick={onBookMeasurement}
              className="gap-2 h-12 px-6 bg-indigo-600 hover:bg-indigo-700 font-black rounded-xl shadow-lg shadow-indigo-500/20 text-sm whitespace-nowrap"
            >
              <Ruler className="w-4 h-4" />
              Book Visit
            </Button>
          ) : product.price > 0 ? (
            <Button
              onClick={handleAddToCart}
              className="gap-2 h-12 px-6 bg-slate-900 hover:bg-slate-800 font-black rounded-xl shadow-lg text-sm whitespace-nowrap"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </Button>
          ) : (
            <a href={`/enquiry?product=${encodeURIComponent(product.name)}`}>
              <Button className="gap-2 h-12 px-6 bg-indigo-600 hover:bg-indigo-700 font-black rounded-xl shadow-lg text-sm whitespace-nowrap">
                <MessageCircle className="w-4 h-4" />
                Get Quote
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
