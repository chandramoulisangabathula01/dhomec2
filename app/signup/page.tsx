import { signup } from "../login/actions";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, ShieldCheck, Home } from "lucide-react";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { error, message } = await searchParams;

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
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200 -rotate-3">
              <ShieldCheck className="w-8 h-8 text-white rotate-3" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Account
          </h1>
          <p className="mt-2 text-slate-500 font-medium">
            Join us to access exclusive features
          </p>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100">
          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 p-4 border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex gap-3">
                <div className="mt-0.5 text-red-600">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-red-900">Registration Failed</h3>
                  <p className="text-xs text-red-700 mt-1">{error as string}</p>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className="mb-6 rounded-2xl bg-green-50 p-4 border border-green-100 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex gap-3">
                <div className="mt-0.5 text-green-600">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-green-900">Check your email</h3>
                  <p className="text-xs text-green-700 mt-1">{message as string}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" action={signup}>
            <div className="space-y-5">
              <div>
                <label htmlFor="full-name" className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    id="full-name"
                    name="full_name"
                    type="text"
                    autoComplete="name"
                    required
                    className="block w-full rounded-2xl border-slate-200 py-3.5 pl-11 pr-4 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10 sm:text-sm bg-slate-50 border transition-all placeholder:text-slate-400"
                    placeholder="John Doe"
                  />
                </div>
              </div>

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
                <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="block w-full rounded-2xl border-slate-200 py-3.5 pl-11 pr-4 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-[4px] focus:ring-blue-500/10 sm:text-sm bg-slate-50 border transition-all placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                </div>
                <p className="mt-2 text-[10px] text-slate-400 ml-1 font-medium">
                  Use at least 8 characters with a mix of letters and numbers.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-4 text-sm font-bold text-white shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all group"
            >
              Create Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-blue-600 font-bold hover:text-blue-700"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
