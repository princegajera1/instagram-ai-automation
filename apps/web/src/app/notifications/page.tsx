import NavigationWrapper from '@/components/NavigationWrapper';
import { ShieldCheck, CreditCard, Sparkles, RefreshCw } from 'lucide-react';

export default function NotificationsPage() {
  const alerts = [
    {
      id: '1',
      title: 'Successful Publish',
      message: 'Your scheduled carousel post "New Tech Design Trends" was published successfully.',
      time: '2 hours ago',
      type: 'success',
      icon: ShieldCheck,
    },
    {
      id: '2',
      title: 'Plan Billing Renewed',
      message: 'Your Pro Automation Plan subscription has been successfully renewed. Invoice #INV-832104.',
      time: 'Yesterday',
      type: 'billing',
      icon: CreditCard,
    },
    {
      id: '3',
      title: 'AI Limits Refreshed',
      message: 'Your monthly AI tokens have been reset to 100,000 credits for the new billing cycle.',
      time: '3 days ago',
      type: 'info',
      icon: Sparkles,
    },
    {
      id: '4',
      title: 'Connected Account Refreshed',
      message: 'Instagram connection for account "@your_brand" has been verified and successfully refreshed.',
      time: '1 week ago',
      type: 'system',
      icon: RefreshCw,
    },
  ];

  return (
    <NavigationWrapper>
      <div className="flex flex-col gap-8 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Notifications</h1>
            <p className="text-zinc-400 text-sm mt-1">Stay updated with automatic publishes, billing alerts, and system state updates.</p>
          </div>
          <button className="text-xs font-semibold text-zinc-500 hover:text-white transition-colors bg-zinc-950 px-4 py-2 border border-zinc-800 rounded-xl">
            Mark all as read
          </button>
        </div>

        {/* Notifications list */}
        <div className="flex flex-col gap-4">
          {alerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <div key={alert.id} className="glass-panel rounded-2xl p-5 flex items-start gap-4 border border-zinc-800">
                <div className={`p-2.5 rounded-xl ${
                  alert.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  alert.type === 'billing' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                  alert.type === 'info' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' :
                  'bg-zinc-900 text-zinc-400 border border-zinc-800'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 flex flex-col gap-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-bold text-white text-sm">{alert.title}</span>
                    <span className="text-zinc-500 text-xs shrink-0">{alert.time}</span>
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed">{alert.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </NavigationWrapper>
  );
}
