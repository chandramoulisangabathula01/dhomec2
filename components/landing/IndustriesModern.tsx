"use client";

import { Home, Building, Factory, Train, Stethoscope, Warehouse } from "lucide-react";
import { industriesData } from "@/lib/data/industries";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const iconMap: { [key: string]: React.ReactNode } = {
  "Home": <Home className="h-7 w-7" />,
  "Building": <Building className="h-7 w-7" />,
  "Factory": <Factory className="h-7 w-7" />,
  "Train": <Train className="h-7 w-7" />,
  "Stethoscope": <Stethoscope className="h-7 w-7" />,
  "Warehouse": <Warehouse className="h-7 w-7" />
};

const accentColors = [
  { border: "hover:border-red-200", bg: "hover:bg-red-50", icon: "group-hover:text-red-600", dot: "bg-red-500" },
  { border: "hover:border-blue-200", bg: "hover:bg-blue-50", icon: "group-hover:text-blue-600", dot: "bg-blue-500" },
  { border: "hover:border-amber-200", bg: "hover:bg-amber-50", icon: "group-hover:text-amber-600", dot: "bg-amber-500" },
  { border: "hover:border-emerald-200", bg: "hover:bg-emerald-50", icon: "group-hover:text-emerald-600", dot: "bg-emerald-500" },
  { border: "hover:border-purple-200", bg: "hover:bg-purple-50", icon: "group-hover:text-purple-600", dot: "bg-purple-500" },
  { border: "hover:border-rose-200", bg: "hover:bg-rose-50", icon: "group-hover:text-rose-600", dot: "bg-rose-500" },
];

export function IndustriesModern() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-slate-50 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <div className="container-width relative">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider mb-4">
            Our Expertise
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Industries We Serve</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Tailored automation solutions for every sector.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {industriesData.map((ind, idx) => {
            const colors = accentColors[idx % accentColors.length];
            return (
              <motion.div 
                key={idx} 
                className={`group p-6 border border-slate-100 rounded-xl ${colors.border} ${colors.bg} text-center transition-all duration-400 cursor-default hover:shadow-lg hover:-translate-y-1`}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <div className={`mb-4 text-slate-400 ${colors.icon} transition-all duration-300 flex justify-center group-hover:scale-110`}>
                  {iconMap[ind.iconName] || <Home className="h-7 w-7" />}
                </div>
                <h3 className="font-bold text-slate-800 mb-1 text-sm">{ind.name}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{ind.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
