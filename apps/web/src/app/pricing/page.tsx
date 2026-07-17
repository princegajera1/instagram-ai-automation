import Link from 'next/link';

export default function PricingPage() {
  const plans = [
    {
      name: 'Free Plan',
      price: '$0',
      description: 'Ideal for experimenting and personal accounts.',
      features: ['1 connected Instagram account', '5 scheduled posts per month', 'Basic AI caption generator', 'Standard support'],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Pro Automation',
      price: '$29',
      description: 'Perfect for content creators and growing brands.',
      features: ['3 connected Instagram accounts', 'Unlimited scheduling', 'Advanced AI engine & hashtags', 'Priority calendar scheduling', 'Basic analytics tracking', '24/7 priority support'],
      cta: 'Upgrade to Pro',
      popular: true,
    },
    {
      name: 'Enterprise / Agency',
      price: '$99',
      description: 'Designed for agencies managing multiple profiles.',
      features: ['Unlimited connected accounts', 'Multi-user workspace access', 'Custom fine-tuned AI prompts', 'Advanced deep analytics reports', 'Dedicated account manager', 'API access'],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

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
        <Link href="/dashboard" className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-semibold text-sm hover:bg-zinc-800 transition-all">
          Go to Dashboard
        </Link>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-12 items-center flex-1">
        <div className="text-center flex flex-col gap-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">Simple, transparent pricing</h1>
          <p className="text-zinc-400 text-lg">Pick the plan that works best for your social scaling goals.</p>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`glass-panel rounded-2xl p-8 flex flex-col justify-between transition-all ${
                plan.popular ? 'border-pink-500/50 shadow-lg shadow-pink-500/5' : ''
              }`}
            >
              <div>
                {plan.popular && (
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-400 mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-zinc-500 text-sm">/month</span>
                </div>
                <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{plan.description}</p>
                <div className="h-px bg-zinc-800 my-6" />
                <ul className="flex flex-col gap-3 text-sm text-zinc-300">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5">
                      <span className="text-pink-500">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  href="/dashboard"
                  className={`block w-full py-3 px-4 rounded-xl text-center font-semibold text-sm transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-pink-500 to-violet-600 hover:opacity-90 text-white shadow-md shadow-pink-500/10'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-8 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <p>&copy; {new Date().getFullYear()} InstaAI Inc. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/" className="hover:text-zinc-300">Home</Link>
          <Link href="/privacy" className="hover:text-zinc-300">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-zinc-300">Terms of Service</Link>
        </div>
      </footer>
    </main>
  );
}
