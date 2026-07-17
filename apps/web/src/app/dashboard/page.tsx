import NavigationWrapper from '@/components/NavigationWrapper';
import Link from 'next/link';
import { ArrowUpRight, Calendar, PlusCircle, BarChart3, FileText } from 'lucide-react';

export default function DashboardPage() {
  const metrics = [
    { title: 'Connected Accounts', value: '1', change: '0 new', trend: 'neutral' },
    { title: 'Scheduled Posts', value: '4', change: '+2 this week', trend: 'up' },
    { title: 'Total Published', value: '28', change: '+12% vs last month', trend: 'up' },
    { title: 'Engagement Rate', value: '4.8%', change: '+0.4% improvement', trend: 'up' },
  ];

  const recentActivity = [
    { id: '1', type: 'post_published', title: 'Post Published Successfully', time: '2 hours ago', status: 'SUCCESS' },
    { id: '2', type: 'ai_generation', title: 'AI Caption Generated (Summer Vibe)', time: 'Yesterday', status: 'SUCCESS' },
    { id: '3', type: 'post_scheduled', title: 'Post Scheduled: Carousel Item', time: '2 days ago', status: 'SCHEDULED' },
  ];

  return (
    <NavigationWrapper>
      <div className="flex flex-col gap-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Dashboard</h1>
            <p className="text-zinc-400 text-sm mt-1">Overview of your Instagram AI automation workspace.</p>
          </div>
          <Link href="/create-post" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-semibold text-sm hover:opacity-90 shadow-md shadow-pink-500/10 transition-all">
            <PlusCircle className="h-4 w-4" />
            Create Post
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <div key={metric.title} className="glass-panel rounded-2xl p-6 flex flex-col gap-2">
              <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{metric.title}</span>
              <span className="text-3xl font-bold text-white">{metric.value}</span>
              <span className={`text-xs ${metric.trend === 'up' ? 'text-emerald-400' : 'text-zinc-500'}`}>
                {metric.change}
              </span>
            </div>
          ))}
        </div>

        {/* Main Dashboard Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions Panel */}
          <div className="lg:col-span-1 glass-panel rounded-2xl p-6 flex flex-col gap-6">
            <h3 className="font-bold text-white text-lg border-b border-zinc-800 pb-3">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <Link href="/create-post" className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-pink-500/30 hover:bg-zinc-900 transition-all">
                <span className="flex items-center gap-3 text-sm font-medium">
                  <PlusCircle className="h-4.5 w-4.5 text-pink-500" />
                  Generate AI Post
                </span>
                <ArrowUpRight className="h-4 w-4 text-zinc-500" />
              </Link>
              <Link href="/calendar" className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-pink-500/30 hover:bg-zinc-900 transition-all">
                <span className="flex items-center gap-3 text-sm font-medium">
                  <Calendar className="h-4.5 w-4.5 text-violet-500" />
                  Manage Calendar
                </span>
                <ArrowUpRight className="h-4 w-4 text-zinc-500" />
              </Link>
              <Link href="/analytics" className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-pink-500/30 hover:bg-zinc-900 transition-all">
                <span className="flex items-center gap-3 text-sm font-medium">
                  <BarChart3 className="h-4.5 w-4.5 text-cyan-500" />
                  View Performance
                </span>
                <ArrowUpRight className="h-4 w-4 text-zinc-500" />
              </Link>
            </div>
          </div>

          {/* Recent Activity Panel */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col gap-4">
            <h3 className="font-bold text-white text-lg border-b border-zinc-800 pb-3">Recent Activity Log</h3>
            <div className="flex flex-col gap-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-zinc-900/30 rounded-xl border border-zinc-900 text-sm">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-zinc-500" />
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{activity.title}</span>
                      <span className="text-zinc-500 text-xs">{activity.time}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-2xs font-semibold tracking-wide ${
                    activity.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-pink-500/10 text-pink-400'
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </NavigationWrapper>
  );
}
