"use client";

import { MapPin, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { companyInfo } from "@/lib/data/footer";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function AboutSnapshot() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-white border-t border-slate-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-slate-50/80 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <div className="container-width relative">
        <div className="flex flex-col md:flex-row gap-16 items-center">
            
            <motion.div 
              className="w-full md:w-1/2"
              initial={{ opacity: 0, x: -40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7 }}
            >
                <div className="bg-slate-100 rounded-2xl p-1.5 shadow-lg">
                     {/* Professional placeholder pattern */}
                    <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200/50 aspect-video flex items-center justify-center relative overflow-hidden rounded-xl">
                        {/* Geometric pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="grid grid-cols-8 gap-3 w-[130%] rotate-12 -translate-x-10 -translate-y-10">
                            {[...Array(40)].map((_, i) => (
                                <div key={i} className={`h-10 rounded-lg ${i % 3 === 0 ? 'bg-red-600' : 'bg-slate-900'}`}></div>
                            ))}
                          </div>
                        </div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                              <span className="text-3xl font-extrabold text-red-600">D</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-300 uppercase tracking-widest">Dhomec HQ</h3>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div 
              className="w-full md:w-1/2"
              initial={{ opacity: 0, x: 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
                <span className="inline-block px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider mb-4">About Us</span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">{companyInfo.tagline}</h2>
                <p className="text-slate-500 mb-8 leading-relaxed text-lg">
                    {companyInfo.description}
                </p>
                
                {/* Quick facts */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
                        <h4 className="text-3xl font-extrabold text-slate-900">{companyInfo.yearsExperience}</h4>
                        <p className="text-xs uppercase font-bold text-slate-400 mt-1 tracking-wide">Years Experience</p>
                    </div>
                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
                        <h4 className="text-3xl font-extrabold text-slate-900">{companyInfo.headquarters}</h4>
                        <p className="text-xs uppercase font-bold text-slate-400 mt-1 tracking-wide">Headquarters</p>
                    </div>
                </div>
                 
                <div className="flex flex-col gap-3 mb-8">
                  <div className="flex items-center text-slate-600 text-sm font-medium">
                    <MapPin className="h-4 w-4 text-red-600 mr-2 shrink-0" />
                    <span>{companyInfo.servingRegion}</span>
                  </div>
                  <div className="flex items-center text-slate-600 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2 shrink-0" />
                    <span>Authorized KINGgates Italy Partner</span>
                  </div>
                </div>
                
                <Link href="/about" className="inline-flex items-center gap-2 text-red-600 font-bold hover:text-red-700 transition-colors group">
                  Learn more about us
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </motion.div>
        </div>
      </div>
    </section>
  );
}
