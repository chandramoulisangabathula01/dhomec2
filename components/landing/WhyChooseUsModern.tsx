"use client";

import { CheckCircle2, Award, Zap, Headset } from "lucide-react";
import { featuresData } from "@/lib/data/features";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const iconMap: { [key: string]: React.ReactNode } = {
  "Award": <Award className="h-7 w-7" />,
  "Zap": <Zap className="h-7 w-7" />,
  "CheckCircle2": <CheckCircle2 className="h-7 w-7" />,
  "Headset": <Headset className="h-7 w-7" />
};

const gradients = [
  "from-red-500 to-rose-600",
  "from-blue-500 to-indigo-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
];

const bgColors = [
  "bg-red-50 group-hover:bg-red-100",
  "bg-blue-50 group-hover:bg-blue-100",
  "bg-amber-50 group-hover:bg-amber-100",
  "bg-emerald-50 group-hover:bg-emerald-100",
];

const textColors = [
  "text-red-600",
  "text-blue-600",
  "text-amber-600",
  "text-emerald-600",
];

export function WhyChooseUsModern() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 bg-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-red-50/50 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-50/50 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />
      
      <div className="container-width relative">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Choose Dhomec?</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            We don't just sell products; we deliver complete, reliable automation ecosystems backed by expert support.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuresData.map((reason, idx) => (
            <motion.div 
              key={idx} 
              className="group flex flex-col items-center text-center p-8 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white hover:shadow-xl transition-all duration-500 relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              {/* Hover gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${gradients[idx % gradients.length]} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
              
              <div className={`mb-6 p-4 rounded-2xl ${bgColors[idx % bgColors.length]} ${textColors[idx % textColors.length]} transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}>
                 {iconMap[reason.iconName] || <Award className="h-7 w-7" />}
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-slate-800">
                {reason.title}
              </h3>
              
              <p className="text-slate-500 leading-relaxed text-sm">
                {reason.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
