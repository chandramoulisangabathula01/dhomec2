"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2, ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url?: string;
  type?: string;
  brand?: string;
  model_name?: string;
  categories?: { name: string; slug: string };
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
      setSearched(false);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=12`);
      const data = await res.json();
      setResults(data.results || []);
      setTotal(data.total || 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(value), 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col max-w-2xl mx-auto mt-[10vh] bg-white rounded-3xl shadow-2xl overflow-hidden mx-4 sm:mx-auto animate-in zoom-in-95 slide-in-from-top-4 duration-300 max-h-[75vh]">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Search products, brands, categories..."
            className="flex-1 text-base font-medium outline-none placeholder:text-slate-400"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setResults([]); setSearched(false); inputRef.current?.focus(); }}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg bg-slate-100"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1">
          {/* Loading Skeleton */}
          {loading && (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl animate-pulse">
                  <div className="w-14 h-14 rounded-xl bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                  <div className="h-5 bg-slate-200 rounded w-16" />
                </div>
              ))}
            </div>
          )}

          {/* Results List */}
          {!loading && results.length > 0 && (
            <div className="p-2">
              <p className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                {total} result{total !== 1 ? "s" : ""} found
              </p>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {product.brand && `${product.brand} • `}
                      {product.categories?.name || ""}
                      {product.type === "CONSULTATION_ONLY" && " • Custom Quote"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {product.price > 0 ? (
                      <span className="text-sm font-black text-slate-900">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-600 italic">On Request</span>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                </Link>
              ))}

              {total > results.length && (
                <Link
                  href={`/products?search=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="block text-center py-3 text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors mt-2"
                >
                  View all {total} results →
                </Link>
              )}
            </div>
          )}

          {/* No Results */}
          {!loading && searched && results.length === 0 && (
            <div className="py-12 text-center">
              <Search className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-500">No products found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 mt-1">Try a different keyword or browse categories</p>
            </div>
          )}

          {/* Default State */}
          {!loading && !searched && (
            <div className="py-12 text-center">
              <Search className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Start typing to search products...</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4 px-6">
                {["Boom Barriers", "CCTV", "Biometric", "Solar", "Inverter"].map((term) => (
                  <button
                    key={term}
                    onClick={() => handleInputChange(term)}
                    className="px-3 py-1.5 rounded-full bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
