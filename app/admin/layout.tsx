"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Box,
  Grid,
  List,
  BadgeCheck,
  Scan,
  Upload,
  TrendingUp,
  Store,
  Trophy,
  ShoppingCart,
  RotateCcw,
  Percent,
  ClipboardList,
  MessageCircle,
  Calendar,
  Mail,
  Sliders,
  LogOut,
  Search,
  ChevronDown,
  Sun,
  Moon,
  Globe,
  Bell,
  Settings,
  Menu,
  X,
  Factory,
  Kanban,
  Wallet,
  LineChart,
  Files,
  Settings2,
  PackageCheck,
  User,
  ExternalLink,
  Users,
  Truck,
  FileQuestion
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Profile, UserRole } from "@/types";

// Define Menu Structure with Role Access
type MenuItemConfig = {
  label: string;
  href: string;
  icon: any;
  badge?: string;
  hasSubmenu?: boolean;
  roles?: UserRole[]; // If undefined, accessible by all ADMIN staff
};

type MenuSection = {
  title: string;
  items: MenuItemConfig[];
};

const MENU_CONFIG: MenuSection[] = [
  {
    title: "Main Menu",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutGrid, roles: ['SUPER_ADMIN', 'SUPPORT_STAFF', 'LOGISTICS_STAFF'] },
      { label: "Products", href: "/admin/products", icon: Box, hasSubmenu: true, roles: ['SUPER_ADMIN', 'SUPPORT_STAFF', 'LOGISTICS_STAFF'] },
      { label: "Categories", href: "/admin/categories", icon: Grid, roles: ['SUPER_ADMIN'] },
    ]
  },
  {
    title: "Production",
    items: [
      { label: "Overview", href: "/admin/seller", icon: Factory, roles: ['SUPER_ADMIN'] },
      { label: "Pipeline", href: "/admin/seller/pipeline", icon: Kanban, roles: ['SUPER_ADMIN'] },
      { label: "Inventory", href: "/admin/seller/inventory", icon: PackageCheck, roles: ['SUPER_ADMIN', 'LOGISTICS_STAFF'] },
      { label: "Settlements", href: "/admin/seller/financials", icon: Wallet, roles: ['SUPER_ADMIN'] },
      // Workshop/Bulk might be restricted
    ]
  },
  {
    title: "Management",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingCart, roles: ['SUPER_ADMIN', 'SUPPORT_STAFF', 'LOGISTICS_STAFF'] },
      { label: "Logistics", href: "/admin/logistics", icon: Truck, roles: ['SUPER_ADMIN', 'LOGISTICS_STAFF'] },
      { label: "Tickets", href: "/admin/tickets", icon: MessageCircle, roles: ['SUPER_ADMIN', 'SUPPORT_STAFF'] },
      { label: "Enquiries", href: "/admin/enquiries", icon: FileQuestion, roles: ['SUPER_ADMIN', 'SUPPORT_STAFF'] },
      { label: "Users", href: "/admin/users", icon: Users, roles: ['SUPER_ADMIN'] },
    ]
  },
  {
    title: "Settings",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Sliders, roles: ['SUPER_ADMIN'] },
    ]
  }
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(true);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Interactive States
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Close menus on click outside
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        // Handle error - maybe redirect to error page
        console.error("Error fetching profile", error);
        return;
      }

      // RBAC Check for Admin Portal Access
      if (data.role === 'CUSTOMER') {
        router.push("/dashboard"); // Redirect customers to their dashboard
        return;
      }

      setUserProfile(data as Profile);
      setLoading(false);
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
  };

  const isActive = (path: string) => {
    if (path === "/admin" && pathname === "/admin") return true;
    if (path !== "/admin" && pathname === path) return true;
    if (path === "/admin/products" && pathname?.startsWith("/admin/products")) return true;
    return false;
  };

  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard";
    if (pathname?.startsWith("/admin/products")) return "Products";
    if (pathname?.startsWith("/admin/orders")) return "Orders";
    if (pathname?.startsWith("/admin/logistics")) return "Logistics";
    if (pathname?.startsWith("/admin/seller")) return "Production Hub";
    if (pathname?.startsWith("/admin/settings")) return "Settings";
    if (pathname?.startsWith("/admin/tickets")) return "Tickets";
    if (pathname?.startsWith("/admin/enquiries")) return "Enquiries";
    if (pathname?.startsWith("/admin/users")) return "User Management";
    return "Dashboard";
  };

  const MenuItem = ({ item }: { item: MenuItemConfig }) => {
    const active = isActive(item.href);
    const { label, href, icon: Icon, badge, hasSubmenu, roles } = item;
    
    // Permission Check
    if (userProfile && roles && !roles.includes(userProfile.role)) {
      return null;
    }

    // Interactive toggle handling
    const isExpanded = hasSubmenu ? productsOpen : false; // Currently hardcoded for products, could be generic

    return (
      <div className="mb-1">
        <Link
          href={href}
          onClick={(e) => {
            if (hasSubmenu) {
              e.preventDefault();
              setProductsOpen(!productsOpen); // Generic handler needed for multiple submenus
            } else {
              setSidebarOpen(false); 
            }
          }}
          className={`
            flex items-center md:justify-center lg:justify-between px-4 py-3 rounded-xl transition-all duration-200 group
            ${active 
              ? "bg-[#4C63FC] text-white shadow-lg shadow-blue-500/30" 
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}
          `}
          title={label}
        >
          <div className="flex items-center gap-3">
            <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
            <span className="text-sm font-medium md:hidden lg:block">{label}</span>
          </div>
          <div className="flex items-center gap-2 md:hidden lg:flex">
            {badge && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                active ? "bg-white/20 text-white" : "bg-green-100 text-green-600"
              }`}>
                {badge}
              </span>
            )}
            {hasSubmenu && (
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            )}
          </div>
        </Link>
        {hasSubmenu && isExpanded && (
          <div className="mt-1 ml-4 pl-4 border-l border-slate-100 space-y-1 md:hidden lg:block">
             <Link href="/admin/products" className={`block px-4 py-2 text-sm rounded-lg ${pathname === "/admin/products" ? "text-[#4C63FC] font-semibold bg-blue-50" : "text-slate-500 hover:text-slate-900"}`}>All Products</Link>
             {/* Only allow adding products if SUPER_ADMIN */}
             {userProfile?.role === 'SUPER_ADMIN' && (
                <>
                  <Link href="/admin/products/new" className={`block px-4 py-2 text-sm rounded-lg ${pathname === "/admin/products/new" ? "text-[#4C63FC] font-semibold bg-blue-50" : "text-slate-500 hover:text-slate-900"}`}>
                    Add Product
                  </Link>
                  <Link href="/admin/products/import" className={`block px-4 py-2 text-sm rounded-lg ${pathname === "/admin/products/import" ? "text-[#4C63FC] font-semibold bg-blue-50" : "text-slate-500 hover:text-slate-900"}`}>
                    Import Products
                  </Link>
                </>
             )}
          </div>
        )}
      </div>
    );
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <div className="px-4 mt-6 mb-3 md:hidden lg:block">
      <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{title}</p>
    </div>
  );

  if (loading) {
     return <div className="flex h-screen items-center justify-center bg-[#F8F9FD]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
     </div>;
  }

  return (
    <div className="flex min-h-screen bg-[#F8F9FD] font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 bg-white border-r border-slate-100 transition-all duration-300 ease-in-out overflow-y-auto overflow-x-hidden
        w-72 md:w-20 lg:w-72
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="h-20 flex items-center px-6 md:px-0 md:justify-center lg:justify-start lg:px-6 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4C63FC] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
              <span className="text-white font-black text-xl">D</span>
            </div>
            <div className="md:hidden lg:block">
              <h1 className="text-lg font-black text-slate-900 leading-none">Dhomec</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Admin Portal</p>
            </div>
          </div>
          <button 
            className="ml-auto md:hidden p-2 text-slate-400"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Badge */}
        <div className="px-6 py-4 md:hidden lg:block">
             <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#4C63FC] font-bold text-xs">
                    {userProfile?.full_name?.charAt(0)}
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-900">{userProfile?.full_name}</p>
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{userProfile?.role.replace('_', ' ')}</p>
                </div>
             </div>
        </div>

        {/* Navigation */}
        <div className="px-4 pb-10 md:px-2 lg:px-4">
          {MENU_CONFIG.map((section, idx) => (
             <div key={idx}>
                {/* Check if any item in section is allowed before rendering title */}
                {section.items.some(item => !item.roles || item.roles.includes(userProfile!.role)) && (
                     <>
                        <SectionTitle title={section.title} />
                        {section.items.map((item, i) => (
                            <MenuItem key={i} item={item} />
                        ))}
                     </>
                )}
             </div>
          ))}
          


        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 md:ml-20 flex flex-col min-w-0 transition-all duration-300">
        {/* Header */}
        <header className="h-auto min-h-[5rem] py-4 md:py-0 md:h-20 bg-white border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between px-4 md:px-8 sticky top-0 z-30 gap-4">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden md:hidden p-2 -ml-2 text-slate-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{getPageTitle()}</h2>
              <p className="hidden md:block text-xs font-medium text-slate-400 mt-0.5">
                 {userProfile?.role === 'SUPER_ADMIN' ? 'Full Access Mode' : `${userProfile?.role.replace('_', ' ')} View`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6 justify-end w-full md:w-auto">
             {/* Notification & Profile (Keep existing logic simplified) */}
             <div className="flex items-center gap-3 md:gap-4 border-r border-slate-100 pr-4 md:pr-6 mr-1 md:mr-2">
                 {/* Only show "Messages" shortcut if allowed */}
                 {['SUPER_ADMIN', 'SUPPORT_STAFF'].includes(userProfile!.role) && (
                     <Link href="/admin/tickets" className="hidden md:block text-slate-400 hover:text-slate-600 transition-colors" title="Support Tickets">
                        <Mail className="w-5 h-5" />
                     </Link>
                 )}
             </div>

             <div className="relative" ref={profileRef}>
                <button 
                  className="flex items-center gap-3 transition-opacity hover:opacity-80"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm hover:border-[#4C63FC] transition-all cursor-pointer">
                     <span className="text-sm font-black text-slate-500">{userProfile?.full_name?.charAt(0)}</span>
                  </div>
                </button>
                {showProfileMenu && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                             <p className="text-xs font-bold text-slate-900">Signed in as</p>
                             <p className="text-[10px] text-slate-500 truncate">{userProfile?.full_name}</p>
                        </div>
                        <div className="p-2 space-y-1">
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left">
                                <LogOut className="w-4 h-4" /> End Session
                            </button>
                        </div>
                    </div>
                )}
             </div>

          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 md:p-6 lg:p-8">
           {children}
        </div>
      </main>
    </div>
  );
}
