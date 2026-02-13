"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const brands = [
  { name: "KINGgates", accent: "text-red-600", suffix: "." },
  { name: "motorline", accent: "text-red-600", suffix: "_" },
  { name: "BSH", accent: "", suffix: "" },
  { name: "SIEMENS", accent: "", suffix: "" },
  { name: "BOSCH", accent: "", suffix: "" },
];

export function TrustedByModern() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="py-14 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/50 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }} />
      
      <div className="container-width relative">
        <motion.p 
          className="text-center text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          Authorized Channel Partner & Distributor
        </motion.p>
        
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
          {brands.map((brand, idx) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group cursor-default"
            >
              <h3 className={`text-2xl md:text-3xl font-bold text-slate-300 group-hover:text-slate-800 transition-all duration-500 ${brand.name === 'BSH' ? 'font-serif italic' : brand.name === 'BOSCH' ? 'tracking-wider' : brand.name === 'motorline' ? 'tracking-tight' : ''}`}>
                {brand.name}
                {brand.suffix && <span className={brand.accent}>{brand.suffix}</span>}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
