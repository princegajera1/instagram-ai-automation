import NavigationWrapper from '@/components/NavigationWrapper';
import { Send, LifeBuoy } from 'lucide-react';

export default function SupportPage() {
  return (
    <NavigationWrapper>
      <div className="flex flex-col gap-8 max-w-3xl">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Customer Support</h1>
          <p className="text-zinc-400 text-sm mt-1">Get assistance with scheduling, billing, AI templates, or API connection issues.</p>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6 border border-zinc-800">
          <h3 className="font-bold text-white text-lg border-b border-zinc-800 pb-3 flex items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-pink-500" />
            Submit a support ticket
          </h3>

          <form className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-zinc-400">Subject</label>
                <input
                  type="text"
                  placeholder="Summarize the issue"
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-pink-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-zinc-400">Category</label>
                <select className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-400 focus:outline-none focus:border-pink-500">
                  <option>Instagram connection issue</option>
                  <option>AI Generation limits</option>
                  <option>Subscription or Billing</option>
                  <option>Bug report / Feature Request</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-zinc-400">Description</label>
              <textarea
                rows={5}
                placeholder="Describe your issue in detail. If applicable, list any error messages or account usernames..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-pink-500 resize-none"
              />
            </div>

            <button
              type="button"
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold text-sm hover:opacity-95 shadow-md shadow-pink-500/10 flex items-center justify-center gap-2 transition-all"
            >
              <Send className="h-4 w-4" />
              Send Ticket
            </button>
          </form>
        </div>
      </div>
    </NavigationWrapper>
  );
}
