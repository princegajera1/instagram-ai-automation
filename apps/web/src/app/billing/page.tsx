import NavigationWrapper from '@/components/NavigationWrapper';
import { CreditCard, Download } from 'lucide-react';

export default function BillingPage() {
  const invoices = [
    { id: 'INV-832104', date: 'Jul 17, 2026', amount: '$29.00', status: 'PAID' },
    { id: 'INV-721095', date: 'Jun 17, 2026', amount: '$29.00', status: 'PAID' },
    { id: 'INV-610284', date: 'May 17, 2026', amount: '$29.00', status: 'PAID' },
  ];

  return (
    <NavigationWrapper>
      <div className="flex flex-col gap-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Billing & Payments</h1>
          <p className="text-zinc-400 text-sm mt-1">Review credit cards, billing cycles, transactions, and download invoices.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Credit Card Setup */}
          <div className="md:col-span-1 glass-panel rounded-2xl p-6 flex flex-col gap-4 justify-between border border-zinc-800">
            <div className="flex flex-col gap-2">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Payment Method</span>
              <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 mt-2">
                <CreditCard className="h-6 w-6 text-pink-500 shrink-0" />
                <div className="flex flex-col text-xs">
                  <span className="font-bold text-white">Visa ending in 4242</span>
                  <span className="text-zinc-500">Exp 12/28</span>
                </div>
              </div>
            </div>
            <button className="w-full py-2.5 px-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs transition-all mt-4">
              Update card details
            </button>
          </div>

          {/* Billing details / addresses */}
          <div className="md:col-span-2 glass-panel rounded-2xl p-6 flex flex-col gap-4 border border-zinc-800">
            <h3 className="font-bold text-white text-base border-b border-zinc-800 pb-2">Billing Information</h3>
            <div className="text-sm text-zinc-400 flex flex-col gap-1 leading-relaxed">
              <p className="font-semibold text-white">InstaAI Workspace Inc.</p>
              <p>123 Enterprise Blvd, Suite 400</p>
              <p>San Francisco, CA 94107</p>
              <p>United States</p>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="glass-panel rounded-2xl p-6 border border-zinc-800">
          <h3 className="font-bold text-white text-base border-b border-zinc-800 pb-3 mb-4">Invoice History</h3>
          <div className="flex flex-col gap-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3.5 bg-zinc-900/40 border border-zinc-800 rounded-xl text-sm">
                <div className="flex items-center gap-6">
                  <span className="font-bold text-white">{invoice.id}</span>
                  <span className="text-zinc-500 text-xs">{invoice.date}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-white font-semibold">{invoice.amount}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-2xs font-semibold border border-emerald-500/20">
                    {invoice.status}
                  </span>
                  <button className="text-zinc-500 hover:text-white transition-colors">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </NavigationWrapper>
  );
}
