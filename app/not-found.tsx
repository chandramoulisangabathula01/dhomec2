import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-[180px] md:text-[220px] font-black text-slate-100 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center rotate-6 shadow-xl">
              <Search className="w-12 h-12 text-red-400 -rotate-6" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
          Page Not Found
        </h2>
        <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 hover:shadow-2xl hover:shadow-blue-300 group"
          >
            <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Go Home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
