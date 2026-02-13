"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, ChevronLeft, Search, Shield, Award, Zap, Play } from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRouter } from "next/navigation";

import { heroSlides } from "@/lib/data/hero";

const slides = heroSlides;

import { LayoutTextFlip } from "@/components/ui/layout-text-flip";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = Math.ceil(target / 40);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [isInView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export function HeroOption9() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{name: string, type: string, link: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const { searchProducts } = await import("@/app/actions/hero-search");
          const results = await searchProducts(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error("Search failed", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearch = (term: string) => {
      if (searchResults.length > 0) {
          router.push(searchResults[0].link);
      } else {
          console.log("No match found for:", term);
      }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="font-sans text-slate-900 overflow-x-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[900px] h-[700px] bg-gradient-to-bl from-red-50 via-rose-50/30 to-transparent rounded-full blur-3xl opacity-70 translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-gradient-to-tr from-blue-50/50 to-transparent rounded-full blur-3xl opacity-50 -translate-x-1/4 translate-y-1/4" />
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <main className="container-width pt-6 pb-10 lg:pt-12 lg:pb-16 relative">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-24">
          
          {/* Left Content */}
          <motion.div 
            className="max-w-2xl relative z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-50 to-rose-50 border border-red-100/60 mb-6 shadow-sm"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Authorized Italian Partner</span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-[4rem] font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Premium Italian
              <br />
              <LayoutTextFlip 
                text=""
                words={["Gate Automation", "Boom Barriers", "Sectional Doors", "Rolling Shutters"]}
                className="!inline-flex !gap-0"
                textClassName="hidden"
                wordContainerClassName="bg-transparent shadow-none border-none p-0 ring-0 dark:ring-0 dark:shadow-none"
                wordClassName="text-red-600 text-4xl md:text-6xl lg:text-[4rem] font-bold tracking-tight leading-[1.1]"
              />
            </h1>

            <motion.div 
              className="flex flex-col gap-6 pl-1 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg">
                Authorized partner of <strong>KINGgates Italy</strong>. 
                <br/>
                We provide advanced automation technology for every type of entrance.
              </p>
              
              {/* Search Widget - Enhanced */}
              <div className="relative max-w-lg">
                <div className="flex items-center bg-white rounded-xl shadow-2xl shadow-slate-200/60 p-1.5 border border-slate-200/80 focus-within:ring-2 focus-within:ring-red-500/20 focus-within:border-red-300 transition-all duration-300">
                    <Search className="ml-3 h-5 w-5 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search for products (e.g. Sliding Gates)..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-400 h-12 px-3 text-base outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                    />
                    <Button 
                        onClick={() => handleSearch(searchQuery)}
                        className="bg-[#D92D20] hover:bg-[#b02419] text-white rounded-lg h-10 px-6 font-medium transition-all active:scale-95 shadow-lg shadow-red-600/20"
                    >
                        Search
                    </Button>
                </div>

                {/* Search Results Dropdown */}
                <AnimatePresence>
                    {searchQuery.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                        >
                            {isSearching ? (
                                <div className="p-4 text-center text-slate-500 text-sm">
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
                                      Searching...
                                    </div>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <ul className="py-2">
                                    {searchResults.map((item, idx) => (
                                        <li key={idx}>
                                            <button 
                                                onClick={() => router.push(item.link)}
                                                className="w-full text-left px-4 py-3 hover:bg-red-50/50 flex items-center justify-between group transition-colors"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900">{item.name}</span>
                                                    <span className="text-xs text-slate-500 uppercase tracking-wider">{item.type}</span>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-red-600 transition-colors" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-4 text-center text-slate-500 text-sm">
                                    No products found.
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
              </div>
            </motion.div>

             {/* Stats Grid - Enhanced with animated counters */}
             <motion.div 
               className="grid grid-cols-3 gap-6 pt-8 mt-6"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.6, duration: 0.5 }}
             >
                <div className="relative">
                    <div className="text-3xl font-extrabold text-slate-900 mb-1 tabular-nums">
                      <AnimatedCounter target={20} suffix="+" />
                    </div>
                    <div className="text-sm text-slate-500 font-medium">Years Experience</div>
                    <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-red-50 -z-10" />
                </div>
                <div className="relative pl-6 border-l border-slate-200">
                    <div className="text-3xl font-extrabold text-slate-900 mb-1 tabular-nums">
                      <AnimatedCounter target={5000} suffix="+" />
                    </div>
                    <div className="text-sm text-slate-500 font-medium">Installations</div>
                </div>
                <div className="relative pl-6 border-l border-slate-200">
                    <div className="text-3xl font-extrabold text-slate-900 mb-1">24/7</div>
                    <div className="text-sm text-slate-500 font-medium">Support</div>
                </div>
             </motion.div>
             
             {/* Trust Indicators */}
             <motion.div
               className="flex items-center gap-4 mt-8"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.8, duration: 0.5 }}
             >
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                 <Shield className="w-4 h-4 text-emerald-600" />
                 <span className="text-xs font-semibold text-slate-600">ISO Certified</span>
               </div>
               <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                 <Award className="w-4 h-4 text-amber-500" />
                 <span className="text-xs font-semibold text-slate-600">CE Approved</span>
               </div>
               <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                 <Zap className="w-4 h-4 text-blue-500" />
                 <span className="text-xs font-semibold text-slate-600">5 Yr Warranty</span>
               </div>
             </motion.div>
          </motion.div>

          {/* Right Side - Auto Swiping Cards - Enhanced */}
          <motion.div 
            className="relative h-[500px] w-full"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
             {/* Floating decorative elements */}
             <div className="absolute -top-6 -right-6 w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500/10 to-rose-500/5 rotate-12 -z-10 animate-float" />
             <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/5 -z-10" style={{ animationDelay: '2s', animationDuration: '8s' }} />

             {/* Slide Navigation */}
             <div className="absolute top-4 right-4 z-20 flex gap-2">
                 <button onClick={prevSlide} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
                     <ChevronLeft className="w-5 h-5 text-slate-800" />
                 </button>
                 <button onClick={nextSlide} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center hover:bg-white transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
                     <ChevronRight className="w-5 h-5 text-slate-800" />
                 </button>
             </div>

             <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50 bg-slate-900 group">
                {/* Background Image Layer */}
                <div className="absolute inset-0 z-0">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentSlide}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="absolute inset-0"
                        >
                            <div className="absolute inset-0 bg-slate-900">
                                <img 
                                    src={slides[currentSlide].image} 
                                    alt={slides[currentSlide].title}
                                    className="w-full h-full object-cover" 
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t ${slides[currentSlide].color} opacity-15 mix-blend-overlay`} />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Content Layer */}
                <div className="absolute bottom-0 left-0 w-full px-8 pt-8 pb-12 md:px-12 md:pt-12 md:pb-16 z-10 pointer-events-none">
                     <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentSlide}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4 }}
                            className="pointer-events-auto"
                        >
                            <span className={`inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 text-xs font-bold tracking-wider uppercase mb-4`}>
                                {slides[currentSlide].subtitle}
                            </span>
                            <h3 className="text-3xl md:text-5xl font-bold text-white mb-3">
                                {slides[currentSlide].title}
                            </h3>
                            <p className="text-base text-slate-300 mb-6 max-w-md line-clamp-2">
                                {slides[currentSlide].description}
                            </p>
                            <Button 
                              className="bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 rounded-lg h-10 px-6 font-medium transition-all"
                              onClick={() => router.push('/products')}
                            >
                              Explore Range <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </motion.div>
                     </AnimatePresence>
                </div>

                {/* Static Indicators */}
                <div className="absolute bottom-6 right-8 md:bottom-8 md:right-12 z-20 flex gap-2 pointer-events-auto">
                    {slides.map((_, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-10 bg-red-500' : 'w-3 bg-white/30 hover:bg-white/50'}`}
                        />
                    ))}
                </div>
             </div>
          </motion.div>

        </div>

      </main>
    </div>
  );
}
