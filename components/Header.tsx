"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { Menu, X, Search, Briefcase, ArrowRight, ChevronRight, ChevronDown, Phone, Mail, ShoppingCart, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { SearchModal } from "@/components/search/SearchModal";

const menuItems = [
  { name: "Home", href: "/" },
  { name: "Our Products", href: "/products", hasDropdown: true },
  { name: "Partners", href: "/partners" },
  { name: "Services", href: "/services" },
  { name: "Contact", href: "/contact" },
];

const productCategories = [
  {
    title: "Gate Automation",
    href: "/products/gate-automation",
    items: ["Sliding Gates", "Swing Gates", "Telescopic Gates", "Folding Gates"]
  },
  {
    title: "Traffic Control",
    href: "/products/traffic-control",
    items: ["Boom Barriers", "Automatic Bollards", "Tyre Killers", "Road Blockers"]
  },
  {
    title: "Industrial & Commercial",
    href: "/products/industrial",
    items: ["High Speed Rapid Doors", "Rolling Shutters", "Sectional Doors", "Dock Levelers"]
  },
  {
    title: "Entrance Systems",
    href: "/products/entrance",
    items: ["Automatic Glass Doors", "Tripod Turnstiles", "Flap Barriers", "Full Height Turnstiles"]
  }
];

export function Header() {
  const { totalItems, setIsOpen: setIsCartOpen } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Auth state
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(profile);
      }
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUser();
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push('/');
  };

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <div className="hidden lg:block bg-white text-slate-600 border-b border-slate-100/50">
        <div className="container-width py-2 flex items-center justify-end gap-6 text-xs font-medium">
            <a href="tel:+919876543210" className="flex items-center hover:text-red-600 transition-colors">
             <Phone className="mr-2 h-3 w-3 text-red-600" /> Sales: +91 98765 43210
            </a>
            <a href="mailto:info@dhomec.com" className="flex items-center hover:text-red-600 transition-colors">
              <Mail className="mr-2 h-3 w-3 text-red-600" /> info@dhomec.com
            </a>
        </div>
      </div>

      <header className={cn(
          "sticky top-0 z-50 w-full bg-white transition-shadow duration-300",
          scrolled ? "shadow-md py-2" : "py-4 md:py-5"
      )}>
        <div className="container-width flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 z-20">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
                dhomec<span className="text-red-600">•</span>
            </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-700">
                {menuItems.map((item) => (
                    item.hasDropdown ? (
                        <div key={item.name} className="relative group">
                            <Link 
                                href={item.href}
                                className="flex items-center gap-1 hover:text-red-600 transition-colors py-4"
                            >
                                {item.name}
                                <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-180" />
                            </Link>
                            
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-[900px] bg-white border-t-2 border-red-600 shadow-2xl rounded-b-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-4 group-hover:translate-y-0 z-50">
                                <div className="p-8 grid grid-cols-4 gap-8">
                                    {productCategories.map((cat, idx) => (
                                        <div key={idx}>
                                            <Link href={cat.href} className="block mb-4">
                                                <h4 className="font-bold text-slate-900 hover:text-red-600 flex items-center">
                                                    {cat.title} 
                                                    <ChevronRight className="h-3 w-3 ml-1" />
                                                </h4>
                                            </Link>
                                            <ul className="space-y-2">
                                                {cat.items.map((subItem, sIdx) => (
                                                    <li key={sIdx}>
                                                        <Link 
                                                            href={`${cat.href}/${subItem.toLowerCase().replace(/\s+/g, '-')}`}
                                                            className="text-slate-500 hover:text-red-600 text-xs block transition-colors"
                                                        >
                                                            {subItem}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link 
                            key={item.name} 
                            href={item.href} 
                            className="hover:text-red-600 transition-colors relative group"
                        >
                            {item.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                        </Link>
                    )
                ))}
            </nav>

            <div className="hidden lg:flex items-center gap-4">
                {/* Search Button */}
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
                  title="Search products"
                >
                    <Search className="h-5 w-5" />
                </button>

                {/* Cart Button */}
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 relative"
                >
                    <ShoppingCart className="h-5 w-5" />
                    {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                            {totalItems}
                        </span>
                    )}
                </button>

                {/* Profile Dropdown */}
                <div className="relative group">
                    <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                        <User className="h-5 w-5" />
                    </button>
                    <div className="absolute right-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                        <div className="bg-white border rounded-lg shadow-xl w-48 overflow-hidden">
                            {user ? (
                                <>
                                    <div className="p-3 border-b bg-slate-50">
                                        <p className="text-xs font-bold text-slate-900 truncate">{profile?.full_name || 'My Account'}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                                    </div>
                                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600">
                                        <LayoutDashboard className="h-4 w-4" /> My Dashboard
                                    </Link>
                                    {profile?.role === 'admin' && (
                                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600 font-bold border-t">
                                            <Briefcase className="h-4 w-4" /> Admin Panel
                                        </Link>
                                    )}
                                    <button 
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t"
                                    >
                                        <LogOut className="h-4 w-4" /> Sign Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600 font-medium">
                                        Login
                                    </Link>
                                    <Link href="/signup" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-bold">
                                        Create Account
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <Link href="/contact" className="ml-2">
                    <Button className="bg-[#D92D20] hover:bg-[#b02419] text-white rounded-sm px-6 font-medium h-10 shadow-lg shadow-red-600/20">
                        Contact us
                    </Button>
                </Link>
            </div>

            <div className="lg:hidden flex items-center gap-2">
                <button 
                  onClick={() => setIsCartOpen(true)}
                  className="p-2 text-slate-700 relative"
                >
                    <ShoppingCart className="h-6 w-6" />
                    {totalItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                            {totalItems}
                        </span>
                    )}
                </button>
                <button 
                    className="p-2 text-slate-700"
                    onClick={() => setIsOpen(true)}
                >
                <Menu className="h-6 w-6" />
                </button>
            </div>
        </div>

        <div className={cn(
            "fixed inset-0 z-[60] bg-white transition-transform duration-300 transform flex flex-col lg:hidden",
            isOpen ? "translate-x-0" : "translate-x-full"
        )}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                    dhomec<span className="text-red-600">•</span>
                </span>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-600 rounded-full hover:bg-slate-100">
                    <X className="h-6 w-6" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                <nav className="flex flex-col gap-2">
                    {menuItems.map((item) => (
                        <Link 
                            key={item.name} 
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="text-xl font-medium text-slate-800 py-3 border-b border-slate-100 flex items-center justify-between"
                        >
                            {item.name}
                            <ChevronRight className="h-5 w-5 text-slate-400" />
                        </Link>
                    ))}
                    {user ? (
                        <>
                            <Link 
                                href="/dashboard"
                                onClick={() => setIsOpen(false)}
                                className="text-xl font-bold text-red-600 py-3 border-b border-slate-100 flex items-center justify-between"
                            >
                                My Dashboard
                                <ChevronRight className="h-5 w-5 text-slate-400" />
                            </Link>
                            {profile?.role === 'admin' && (
                                <Link 
                                    href="/admin"
                                    onClick={() => setIsOpen(false)}
                                    className="text-xl font-bold text-slate-900 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50 px-2 rounded"
                                >
                                    Admin Panel
                                    <Briefcase className="h-5 w-5 text-red-600" />
                                </Link>
                            )}
                            <button 
                                onClick={() => { handleSignOut(); setIsOpen(false); }}
                                className="text-xl font-medium text-red-600 py-3 text-left"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link 
                                href="/login"
                                onClick={() => setIsOpen(false)}
                                className="text-xl font-medium text-slate-800 py-3 border-b border-slate-100 flex items-center justify-between"
                            >
                                Login
                                <ChevronRight className="h-5 w-5 text-slate-400" />
                            </Link>
                        </>
                    )}
                </nav>
                
                <div className="mt-4">
                    <Link href="/contact" onClick={() => setIsOpen(false)} className="block">
                        <Button className="w-full bg-[#D92D20] hover:bg-[#b02419] text-white h-12 text-lg shadow-lg shadow-red-600/20">
                            Contact Us
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

