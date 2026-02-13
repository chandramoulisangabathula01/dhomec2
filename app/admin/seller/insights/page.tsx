"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  TrendingUp,
  Heart,
  ShoppingCart,
  Star,
  BarChart3,
  RefreshCcw,
  Eye,
  Package,
  ArrowUpRight,
  Flame,
  Award,
  Target,
} from "lucide-react";

type ProductInsight = {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  wishlist_count: number;
  order_count: number;
  review_avg: number;
  revenue: number;
  categories?: { name: string } | null;
};

type CategoryInsight = {
  name: string;
  product_count: number;
  total_wishlist: number;
  total_orders: number;
};

export default function InsightsPage() {
  const [products, setProducts] = useState<ProductInsight[]>([]);
  const [categoryInsights, setCategoryInsights] = useState<CategoryInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"trending" | "revenue" | "engagement">("trending");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    
    // Fetch products with counts
    const { data: productsData } = await supabase
      .from("products")
      .select("id, name, image_url, price, categories(name)");

    if (productsData) {
      // Fetch wishlist counts per product
      const { data: wishlistData } = await supabase
        .from("wishlist")
        .select("product_id");
      
      // Fetch order item counts
      const { data: orderItemsData } = await supabase
        .from("order_items")
        .select("product_id, quantity, price_at_purchase");

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("product_id, rating");

      // Aggregate per product
      const productMap = new Map<string, ProductInsight>();
      productsData.forEach((p: any) => {
        productMap.set(p.id, {
          id: p.id,
          name: p.name,
          image_url: p.image_url,
          price: p.price,
          wishlist_count: 0,
          order_count: 0,
          review_avg: 0,
          revenue: 0,
          categories: p.categories,
        });
      });

      wishlistData?.forEach((w: any) => {
        const prod = productMap.get(w.product_id);
        if (prod) prod.wishlist_count++;
      });

      orderItemsData?.forEach((oi: any) => {
        const prod = productMap.get(oi.product_id);
        if (prod) {
          prod.order_count += oi.quantity || 1;
          prod.revenue += (Number(oi.price_at_purchase) || 0) * (oi.quantity || 1);
        }
      });

      // Calculate review averages
      const reviewBuckets: Record<string, { sum: number; count: number }> = {};
      reviewsData?.forEach((r: any) => {
        if (!reviewBuckets[r.product_id]) reviewBuckets[r.product_id] = { sum: 0, count: 0 };
        reviewBuckets[r.product_id].sum += r.rating;
        reviewBuckets[r.product_id].count++;
      });
      Object.entries(reviewBuckets).forEach(([pid, { sum, count }]) => {
        const prod = productMap.get(pid);
        if (prod) prod.review_avg = Math.round((sum / count) * 10) / 10;
      });

      const productList = Array.from(productMap.values());
      setProducts(productList);

      // Category insights
      const catMap = new Map<string, CategoryInsight>();
      productList.forEach((p) => {
        const catName = (p.categories as any)?.name || "Uncategorized";
        if (!catMap.has(catName)) {
          catMap.set(catName, { name: catName, product_count: 0, total_wishlist: 0, total_orders: 0 });
        }
        const cat = catMap.get(catName)!;
        cat.product_count++;
        cat.total_wishlist += p.wishlist_count;
        cat.total_orders += p.order_count;
      });
      setCategoryInsights(Array.from(catMap.values()).sort((a, b) => b.total_wishlist - a.total_wishlist));
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const getSortedProducts = () => {
    const sorted = [...products];
    if (view === "trending") return sorted.sort((a, b) => b.wishlist_count - a.wishlist_count);
    if (view === "revenue") return sorted.sort((a, b) => b.revenue - a.revenue);
    return sorted.sort((a, b) => (b.wishlist_count + b.order_count) - (a.wishlist_count + a.order_count));
  };

  const totalWishlists = products.reduce((a, p) => a + p.wishlist_count, 0);
  const totalOrders = products.reduce((a, p) => a + p.order_count, 0);
  const totalRevenue = products.reduce((a, p) => a + p.revenue, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Selection Insights</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Trending patterns, wishlist analytics & revenue intelligence</p>
        </div>
        <button onClick={fetchInsights} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
          <RefreshCcw className={`w-5 h-5 text-slate-400 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="relative z-10">
            <Heart className="w-5 h-5 mb-2 text-pink-200" />
            <p className="text-[10px] font-bold text-pink-200 uppercase">Total Wishlists</p>
            <p className="text-3xl font-black">{totalWishlists}</p>
          </div>
          <Heart className="absolute -right-3 -bottom-3 w-20 h-20 text-white/10" />
        </div>
        <div className="bg-gradient-to-br from-[#2874f0] to-blue-600 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="relative z-10">
            <ShoppingCart className="w-5 h-5 mb-2 text-blue-200" />
            <p className="text-[10px] font-bold text-blue-200 uppercase">Total Items Ordered</p>
            <p className="text-3xl font-black">{totalOrders}</p>
          </div>
          <ShoppingCart className="absolute -right-3 -bottom-3 w-20 h-20 text-white/10" />
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="relative z-10">
            <TrendingUp className="w-5 h-5 mb-2 text-green-200" />
            <p className="text-[10px] font-bold text-green-200 uppercase">Product Revenue</p>
            <p className="text-3xl font-black">₹{totalRevenue.toLocaleString()}</p>
          </div>
          <TrendingUp className="absolute -right-3 -bottom-3 w-20 h-20 text-white/10" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Product Rankings */}
        <div className="lg:col-span-2 space-y-4">
          {/* View Tabs */}
          <div className="flex gap-2">
            {([
              { key: "trending" as const, label: "Trending Patterns", icon: Flame },
              { key: "revenue" as const, label: "Top Revenue", icon: TrendingUp },
              { key: "engagement" as const, label: "Engagement", icon: Target },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setView(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  view === tab.key ? "bg-[#2874f0] text-white border-[#2874f0]" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Product List */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {loading ? (
              <div className="p-20 text-center">
                <RefreshCcw className="w-8 h-8 text-slate-300 animate-spin mx-auto" />
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {getSortedProducts().slice(0, 15).map((product, index) => (
                  <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-slate-50/50 transition-all group">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                      index === 0 ? "bg-amber-100 text-amber-600" :
                      index === 1 ? "bg-slate-200 text-slate-600" :
                      index === 2 ? "bg-orange-100 text-orange-600" :
                      "bg-slate-50 text-slate-400"
                    }`}>
                      {index < 3 ? <Award className="w-4 h-4" /> : `#${index + 1}`}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                      {product.image_url ? (
                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-4 h-4 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{product.name}</p>
                      <p className="text-[10px] text-slate-400">{(product.categories as any)?.name} • ₹{product.price?.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-center">
                        <p className="text-xs font-black text-pink-500">{product.wishlist_count}</p>
                        <p className="text-[9px] text-slate-400">Wishlist</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-black text-blue-500">{product.order_count}</p>
                        <p className="text-[9px] text-slate-400">Orders</p>
                      </div>
                      {product.review_avg > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-slate-700">{product.review_avg}</span>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-xs font-black text-green-600">₹{product.revenue.toLocaleString()}</p>
                        <p className="text-[9px] text-slate-400">Revenue</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#2874f0]" />
              Category Analytics
            </h3>
          </div>
          <div className="p-5 space-y-4">
            {categoryInsights.map((cat, i) => {
              const maxWishlist = Math.max(...categoryInsights.map((c) => c.total_wishlist), 1);
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700">{cat.name}</span>
                    <span className="text-[10px] text-slate-400">{cat.product_count} products</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#2874f0] to-blue-400 rounded-full transition-all"
                        style={{ width: `${(cat.total_wishlist / maxWishlist) * 100}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Heart className="w-3 h-3 text-pink-400" />
                      <span className="text-[10px] font-bold text-slate-600">{cat.total_wishlist}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
