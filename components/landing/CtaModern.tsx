"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function CtaModern() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-white relative overflow-hidden">
      <div className="container-width px-6">
        <motion.div 
          className="bg-slate-900 rounded-3xl p-12 md:p-20 relative overflow-hidden flex flex-col items-center text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          {/* Background effects */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2" />
             {/* Grid dots */}
             <div className="absolute inset-0 opacity-[0.04]" style={{
               backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
               backgroundSize: '30px 30px'
             }} />
          </div>

          <div className="relative z-10 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white/80 text-xs font-bold uppercase tracking-wider mb-8"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Let&apos;s Build Together
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to modernize your <br />
              <span className="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">industrial infrastructure?</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-2xl mx-auto">
              Join 500+ companies that rely on Dhomec for mission-critical automation and security. Let&apos;s discuss your project today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/enquiry">
                <Button className="bg-[#D92D20] hover:bg-[#b02419] text-white h-14 px-8 text-lg rounded-xl shadow-xl shadow-red-900/30 transition-all hover:shadow-2xl hover:shadow-red-900/40 hover:-translate-y-0.5">
                  <Phone className="mr-2 h-5 w-5" /> Get a Quote
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-14 px-8 text-lg rounded-xl bg-transparent transition-all hover:-translate-y-0.5">
                  View Portfolio <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
