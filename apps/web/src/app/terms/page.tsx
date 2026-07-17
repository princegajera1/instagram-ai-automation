import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen gradient-bg text-zinc-100 flex flex-col justify-between">
      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-pink-500 to-violet-500 flex items-center justify-center font-bold text-xl text-white">
            I
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">Insta<span className="text-pink-500">AI</span></span>
        </Link>
        <Link href="/" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">
          Back to Home
        </Link>
      </header>

      {/* Main Container */}
      <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col gap-6 flex-1">
        <h1 className="text-4xl font-black tracking-tight text-white">Terms of Service</h1>
        <p className="text-zinc-500 text-xs">Last updated: July 17, 2026</p>

        <div className="h-px bg-zinc-800 my-2" />

        <div className="text-zinc-300 text-sm flex flex-col gap-6 leading-relaxed">
          <section className="flex flex-col gap-3">
            <h3 className="font-bold text-white text-lg">1. Acceptance of Terms</h3>
            <p>
              By accessing and using InstaAI, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you must refrain from using the platform.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="font-bold text-white text-lg">2. User Conduct & Accounts</h3>
            <p>
              You represent that all details registered via Clerk authentication are true and accurate. You are solely responsible for actions taken using your credentials and for ensuring your connected accounts respect third-party platform terms.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="font-bold text-white text-lg">3. Service Limits</h3>
            <p>
              We reserve the right to restrict access, cancel accounts, or adapt subscription pricing tiers with appropriate advance notice. Violation of terms may result in account termination.
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <p>&copy; {new Date().getFullYear()} InstaAI Inc. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-zinc-300">Privacy Policy</Link>
          <Link href="/" className="hover:text-zinc-300">Home</Link>
        </div>
      </footer>
    </main>
  );
}
