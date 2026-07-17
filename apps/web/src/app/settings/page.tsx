import NavigationWrapper from '@/components/NavigationWrapper';
import { User, Bell, Key, RefreshCw } from 'lucide-react';

export default function SettingsPage() {
  return (
    <NavigationWrapper>
      <div className="flex flex-col gap-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Settings</h1>
          <p className="text-zinc-400 text-sm mt-1">Configure profile details, credentials, connected services, and system alerts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Navigation Sub-options */}
          <div className="md:col-span-1 flex flex-col gap-1">
            <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold bg-zinc-900 border border-zinc-800 text-pink-400 w-full text-left">
              <User className="h-4 w-4" />
              General
            </button>
            <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/50 w-full text-left">
              <Bell className="h-4 w-4" />
              Alerts
            </button>
            <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-900/50 w-full text-left">
              <Key className="h-4 w-4" />
              API Credentials
            </button>
          </div>

          {/* Form details */}
          <div className="md:col-span-3 flex flex-col gap-6">
            <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
              <h3 className="font-bold text-white text-lg border-b border-zinc-800 pb-3">Workspace Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-zinc-400">Workspace Name</label>
                  <input
                    type="text"
                    defaultValue="My Instagram Engine"
                    className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-100 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-zinc-400">Primary Contact Email</label>
                  <input
                    type="email"
                    defaultValue="contact@mycompany.com"
                    className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-sm text-zinc-100 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
              <h3 className="font-bold text-white text-lg border-b border-zinc-800 pb-3">Platform Connections</h3>
              <div className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-violet-500 flex items-center justify-center text-white text-xs font-black">
                    IG
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-white">@my_brand_insta</span>
                    <span className="text-zinc-500 text-xs">Connected via Clerk Platform Auth</span>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-zinc-800 bg-zinc-950 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-all">
                  <RefreshCw className="h-3 w-3" />
                  Reconnect
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NavigationWrapper>
  );
}
