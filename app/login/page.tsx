import { login } from "./actions";
import Link from "next/link";
import { Mail, Lock, ArrowRight, ShieldCheck, Home } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50" />

      <div className="w-full max-w-[440px] z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-white rounded-full text-sm font-medium text-slate-600 shadow-sm border border-slate-100 hover:shadow-md transition-all group">
            <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Back to storefront</span>
          </Link>
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200 rotate-3">
              <ShieldCheck className="w-8 h-8 text-white -rotate-3" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back
          </h1>
          <p className="mt-2 text-slate-500 font-medium">
            Enter your credentials to access your account
          </p>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100">
          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 p-4 border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex gap-3">
                <div className="mt-0.5 text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="21" cy="6" r="3"/><path d="M11 6V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-1"/><path d="M11 11H3"/><path d="M12 11h2"/><path d="M7 11V7"/><path d="M7 15v1"/><path d="M13 15v2"/><rect width="8" height="8" x="13" y="13" rx="2"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-900">Sign in failed</h3>
                  <p className="text-xs text-red-700 mt-1">{error as string}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" action={login}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email-address" className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full rounded-2xl border-slate-200 py-3.5 pl-11 pr-4 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10 sm:text-sm bg-slate-50 border transition-all placeholder:text-slate-400"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 ml-1">
                  <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                    Password
                  </label>
                  <Link
                    href="/login/forgot-password"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-2xl border-slate-200 py-3.5 pl-11 pr-4 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10 sm:text-sm bg-slate-50 border transition-all placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 text-sm font-bold text-white shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all group"
            >
              Sign In
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-slate-400 font-bold uppercase tracking-wider">or</span>
            </div>
          </div>

          {/* OTP Login */}
          <Link
            href="/login/otp"
            className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-bold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
            Login with WhatsApp OTP
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-blue-600 font-bold hover:text-blue-700"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

