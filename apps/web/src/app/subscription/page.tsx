import NavigationWrapper from '@/components/NavigationWrapper';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SubscriptionPage() {
  const activePlan = {
    name: 'Pro Automation',
    price: '$29/mo',
    renewsAt: 'August 17, 2026',
    status: 'ACTIVE',
    features: [
      '3 connected Instagram accounts',
      'Unlimited calendar scheduling',
      'Advanced AI caption model prompts',
      'Automatic hashtag cluster matching',
      'Realtime engagement analytics',
    ],
  };

  return (
    <NavigationWrapper>
      <div className="flex flex-col gap-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Subscription</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage active workspace licenses, quotas, and licensing contracts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Active plan highlight */}
          <div className="md:col-span-2 glass-panel rounded-2xl p-6 flex flex-col gap-6 border border-pink-500/25 shadow-lg shadow-pink-500/5">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20 w-fit">
                  Current Active Plan
                </span>
                <h3 className="text-2xl font-black text-white mt-3">{activePlan.name}</h3>
              </div>
              <span className="text-2xl font-extrabold text-white">{activePlan.price}</span>
            </div>

            <p className="text-zinc-400 text-sm leading-relaxed">
              Your license is in good standing. Next automatic renewal transaction takes place on <span className="font-semibold text-white">{activePlan.renewsAt}</span>.
            </p>

            <div className="h-px bg-zinc-800" />

            <div className="flex flex-col gap-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Features Included</span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activePlan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5 text-sm text-zinc-300">
                    <CheckCircle2 className="h-4.5 w-4.5 text-pink-500 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action sidebar */}
          <div className="md:col-span-1 glass-panel rounded-2xl p-6 flex flex-col gap-4 justify-between border border-zinc-800">
            <div className="flex flex-col gap-3">
              <h4 className="font-bold text-white text-base">Plan Management</h4>
              <p className="text-zinc-500 text-xs leading-relaxed">
                Looking to expand your limit options? Upgrade to the Enterprise license for unlimited accounts and premium prompt parameters.
              </p>
            </div>
            <div className="flex flex-col gap-2 mt-6">
              <Link href="/pricing" className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold text-sm text-center shadow-md shadow-pink-500/10 hover:opacity-90 transition-all">
                Compare Plans
              </Link>
              <button className="w-full py-3 px-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 font-semibold text-sm transition-all">
                Cancel Auto-Renew
              </button>
            </div>
          </div>
        </div>
      </div>
    </NavigationWrapper>
  );
}
