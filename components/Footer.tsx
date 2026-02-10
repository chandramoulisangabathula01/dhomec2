import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-200 pt-16 pb-8 border-t border-slate-800">
      <div className="container-width">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Dhomec.</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Leading provider of industrial automation and access control solutions. 
              Engineering excellence for a smarter tomorrow.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors"><Facebook className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-primary">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">My Account</Link></li>
              <li><Link href="/products" className="text-slate-400 hover:text-white text-sm transition-colors">Our Products</Link></li>
              <li><Link href="/checkout" className="text-slate-400 hover:text-white text-sm transition-colors">Shopping Cart</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-white text-sm transition-colors">Contact Us</Link></li>

            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-primary">Products</h4>
            <ul className="space-y-3">
              <li><Link href="/products" className="text-slate-400 hover:text-white text-sm transition-colors">Boom Barriers</Link></li>
              <li><Link href="/products" className="text-slate-400 hover:text-white text-sm transition-colors">Turnstiles</Link></li>
              <li><Link href="/products" className="text-slate-400 hover:text-white text-sm transition-colors">Bollards</Link></li>
              <li><Link href="/products" className="text-slate-400 hover:text-white text-sm transition-colors">Access Control</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-primary">Contact Us</h4>
            <ul className="space-y-4">
               <li className="flex items-start gap-3 text-sm text-slate-400">
                  <MapPin className="h-5 w-5 text-primary shrink-0" />
                  <span>123 Industrial Area, Tech City,<br />Bangalore, KA 560001</span>
               </li>
               <li className="flex items-center gap-3 text-sm text-slate-400">
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  <span>+91 98765 43210</span>
               </li>
               <li className="flex items-center gap-3 text-sm text-slate-400">
                  <Mail className="h-5 w-5 text-primary shrink-0" />
                  <span>info@dhomec.com</span>
               </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Dhomec Solutions. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
