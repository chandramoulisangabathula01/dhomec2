"use client";

import Link from "next/link";
import { Facebook, Twitter, Linkedin, Instagram, Mail, MapPin, Phone, ArrowRight, Heart } from "lucide-react";
import { companyInfo, footerLinks, socialLinks } from "@/lib/data/footer";

const iconMap: { [key: string]: React.ReactNode } = {
  "Linkedin": <Linkedin className="h-4 w-4" />,
  "Twitter": <Twitter className="h-4 w-4" />,
  "Instagram": <Instagram className="h-4 w-4" />,
  "Facebook": <Facebook className="h-4 w-4" />
};

export function FooterModern() {
  return (
    <footer className="bg-slate-900 text-slate-300 font-sans border-t border-slate-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/5 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 pointer-events-none" />
      
      {/* Main footer */}
      <div className="container-width py-20 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-bold tracking-tight text-white">
                dhomec<span className="text-red-500">•</span>
              </span>
            </Link>
            <p className="leading-relaxed text-slate-400 text-sm">
              Premium gate automation and access control solutions. Authorized partner of KINGgates Italy.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, idx) => (
                <a 
                  key={idx} 
                  href={social.href} 
                  className="w-9 h-9 bg-slate-800 hover:bg-red-600 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 hover:-translate-y-0.5"
                >
                  {iconMap[social.iconName]}
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors flex items-center group text-sm">
                    <span className="w-0 group-hover:w-2 transition-all duration-300 h-px bg-red-500 mr-0 group-hover:mr-2"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Products</h3>
            <ul className="space-y-3">
              {footerLinks.products.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors flex items-center group text-sm">
                    <span className="w-0 group-hover:w-2 transition-all duration-300 h-px bg-red-500 mr-0 group-hover:mr-2"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Contact</h3>
            <ul className="space-y-5">
              <li className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-red-500" />
                </div>
                <span className="text-sm leading-relaxed">
                  {companyInfo.address.line1}<br />
                  {companyInfo.address.line2}<br />
                  {companyInfo.address.line3}
                </span>
              </li>
              <li className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-red-500" />
                </div>
                <a href={`tel:${companyInfo.contact.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-white transition-colors text-sm">{companyInfo.contact.phone}</a>
              </li>
              <li className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-red-500" />
                </div>
                <a href={`mailto:${companyInfo.contact.email}`} className="hover:text-white transition-colors text-sm">{companyInfo.contact.email}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800/70 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p className="flex items-center gap-1">
            © {new Date().getFullYear()} {companyInfo.name}. Built with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in India
          </p>
          <div className="flex gap-8">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/return-policy" className="hover:text-white transition-colors">Return Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
