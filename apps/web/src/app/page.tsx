import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';

export default function Home() {
  return (
    <main className="min-h-screen gradient-bg flex flex-col justify-between">
      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-pink-500 to-violet-500 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-pink-500/20">
            I
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">Insta<span className="text-pink-500">AI</span></span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <SignedIn>
            <Link href="/dashboard" className="text-pink-500 hover:text-pink-400 transition-colors">Dashboard</Link>
          </SignedIn>
        </nav>

        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-semibold text-sm hover:opacity-90 shadow-md shadow-pink-500/20 transition-all">
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center px-6 py-20 md:py-32 flex flex-col items-center gap-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950 text-xs font-semibold text-pink-400">
          ✨ Introducing Phase 1 Foundation
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-none">
          Automate Instagram with <span className="text-gradient">Artificial Intelligence</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
          The ultimate production-grade Instagram automation engine. Craft engaging copy, schedule posts intelligently, and measure progress instantly.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold shadow-lg shadow-pink-500/20 hover:opacity-95 transition-all text-center">
            Get Started Free
          </Link>
          <Link href="/pricing" className="w-full sm:w-auto px-8 py-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300 font-semibold transition-all text-center">
            View Pricing
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <p>&copy; {new Date().getFullYear()} InstaAI Inc. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-zinc-300">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-zinc-300">Terms of Service</Link>
        </div>
      </footer>
    </main>
  );
}
