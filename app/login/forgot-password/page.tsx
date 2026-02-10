import { forgotPassword } from "../actions";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div>
          <Link href="/login" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to Login</span>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 border border-red-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm text-red-800">{error as string}</p>
          </div>
        )}

        {message && (
          <div className="rounded-xl bg-green-50 p-4 border border-green-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm text-green-800">{message as string}</p>
          </div>
        )}

        <form className="space-y-6" action={forgotPassword}>
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 mb-1">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-xl border-slate-200 py-3 pl-10 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-slate-50 border transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all hover:-translate-y-0.5"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
