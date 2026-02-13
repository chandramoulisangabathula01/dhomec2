"use client";

import { Phone, CheckCircle, Wrench, Settings } from "lucide-react";
import { processSteps } from "@/lib/data/process";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const iconMap: { [key: string]: React.ReactNode } = {
  "CheckCircle": <CheckCircle className="h-7 w-7 text-white" />,
  "Settings": <Settings className="h-7 w-7 text-white" />,
  "Wrench": <Wrench className="h-7 w-7 text-white" />,
  "Phone": <Phone className="h-7 w-7 text-white" />
};

export function ProcessModern() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Ambient effects */}
      <div className="absolute top-0 left-0 w-[500px] h-[300px] bg-red-600/5 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-blue-600/5 rounded-full blur-[120px] translate-x-1/3 translate-y-1/2 pointer-events-none" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
      
      <div className="container-width relative">
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
            Our Process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            From consultation to execution, we ensure a seamless experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
           {/* Connecting Line (Desktop) */}
           <div className="hidden lg:block absolute top-[3.5rem] left-[12%] right-[12%] h-px bg-gradient-to-r from-slate-700 via-red-600/30 to-slate-700 z-0" />

          {processSteps.map((step, idx) => (
            <motion.div 
              key={idx} 
              className="relative z-10 flex flex-col items-center text-center group"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
            >
              <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50 flex items-center justify-center mb-8 shadow-xl relative group-hover:border-red-500/30 transition-all duration-500 group-hover:shadow-red-900/20 group-hover:shadow-2xl">
                 <div className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-[11px] font-bold font-mono shadow-lg">
                    {step.num}
                 </div>
                 <div className="group-hover:scale-110 transition-transform duration-300">
                   {iconMap[step.iconName] || <Settings className="h-7 w-7 text-white" />}
                 </div>
              </div>
              
              <h3 className="text-xl font-bold mb-3 group-hover:text-red-400 transition-colors">{step.title}</h3>
              <p className="text-slate-400 text-sm max-w-xs leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
