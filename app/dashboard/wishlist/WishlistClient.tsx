"use client";

import { removeFromWishlist } from "@/app/actions/wishlist";
import { useCart } from "@/context/CartContext";
import { Heart, ShoppingCart, Trash2, Package } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

export function WishlistClient({ items }: { items: any[] }) {
  const { addItem } = useCart();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRemove = (productId: string) => {
    setRemovingId(productId);
    startTransition(async () => {
      try {
        await removeFromWishlist(productId);
      } catch (e) {
        console.error(e);
      }
      setRemovingId(null);
    });
  };

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price || 0,
      quantity: 1,
      image_url: product.image_url,
      slug: product.slug,
    });
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
        <div className="w-16 h-16 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">Your wishlist is empty</h3>
        <p className="text-slate-500 text-sm mb-6">Save products you like for later</p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item: any) => {
        const product = item.products;
        if (!product) return null;

        return (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all group"
          >
            <Link href={`/products/${product.slug}`}>
              <div className="h-48 bg-slate-50 relative overflow-hidden">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-slate-200" />
                  </div>
                )}
              </div>
            </Link>

            <div className="p-5">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">
                {product.categories?.name || product.brand || "Product"}
              </p>
              <Link href={`/products/${product.slug}`}>
                <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              {product.price && (
                <p className="text-lg font-extrabold text-slate-900 mt-2">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </p>
              )}

              <div className="flex gap-2 mt-4">
                {product.price && (
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                )}
                <button
                  onClick={() => handleRemove(product.id)}
                  disabled={removingId === product.id}
                  className="px-3 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
