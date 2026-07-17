import NavigationWrapper from '@/components/NavigationWrapper';
import { TrendingUp, Users, Heart, MessageCircle } from 'lucide-react';

export default function AnalyticsPage() {
  const cards = [
    { title: 'Follower Growth', value: '45,282', change: '+8.4%', icon: Users },
    { title: 'Total Engagement', value: '14,820', change: '+14.2%', icon: TrendingUp },
    { title: 'Total Likes', value: '112,400', change: '+6.1%', icon: Heart },
    { title: 'Total Comments', value: '8,429', change: '+18.3%', icon: MessageCircle },
  ];

  return (
    <NavigationWrapper>
      <div className="flex flex-col gap-8 max-w-6xl">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Analytics</h1>
          <p className="text-zinc-400 text-sm mt-1">Deep insights into your post engagement, growth, and audience profile.</p>
        </div>

        {/* Highlight Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="glass-panel rounded-2xl p-6 flex items-center justify-between border border-zinc-800">
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{card.title}</span>
                  <span className="text-2xl font-bold text-white">{card.value}</span>
                  <span className="text-emerald-400 text-xs font-semibold">{card.change} vs last month</span>
                </div>
                <div className="h-12 w-12 rounded-xl bg-zinc-900 flex items-center justify-center text-pink-500 border border-zinc-800">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Mock Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
            <h3 className="font-bold text-white text-lg border-b border-zinc-800 pb-3">Audience Growth over Time</h3>
            <div className="h-[250px] bg-zinc-950/50 rounded-xl border border-zinc-900 flex items-end justify-between p-6">
              {/* Mock bar chart items */}
              {[40, 60, 45, 80, 55, 90, 75, 95, 85, 100].map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-2 w-full">
                  <div
                    style={{ height: `${h}%` }}
                    className="w-4 bg-gradient-to-t from-pink-500/20 to-pink-500 rounded-t-sm shadow-md shadow-pink-500/20 transition-all hover:opacity-80"
                  />
                  <span className="text-zinc-600 text-3xs font-semibold">W{i+1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
            <h3 className="font-bold text-white text-lg border-b border-zinc-800 pb-3">Engagement Rate Trends</h3>
            <div className="h-[250px] bg-zinc-950/50 rounded-xl border border-zinc-900 flex items-end justify-between p-6">
              {/* Mock bar chart items */}
              {[60, 50, 70, 65, 80, 75, 85, 90, 80, 95].map((h, i) => (
                <div key={i} className="flex flex-col items-center gap-2 w-full">
                  <div
                    style={{ height: `${h}%` }}
                    className="w-4 bg-gradient-to-t from-violet-500/20 to-violet-500 rounded-t-sm shadow-md shadow-violet-500/20 transition-all hover:opacity-80"
                  />
                  <span className="text-zinc-600 text-3xs font-semibold">M{i+1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </NavigationWrapper>
  );
}
