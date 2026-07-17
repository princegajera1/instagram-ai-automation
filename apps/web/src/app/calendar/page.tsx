import NavigationWrapper from '@/components/NavigationWrapper';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarPage() {
  const days = Array.from({ length: 35 }, (_, i) => i - 3); // mock offset
  const monthName = 'July 2026';

  const mockEvents = {
    '15': [{ id: '1', title: 'Summer Sale Reel', time: '10:00 AM', status: 'PUBLISHED' }],
    '18': [{ id: '2', title: 'AI Tips Post', time: '2:00 PM', status: 'SCHEDULED' }],
    '22': [{ id: '3', title: 'Product Launch Story', time: '9:30 AM', status: 'SCHEDULED' }],
  };

  return (
    <NavigationWrapper>
      <div className="flex flex-col gap-8 max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Content Calendar</h1>
            <p className="text-zinc-400 text-sm mt-1">Schedule, organize, and view your automated Instagram post pipeline.</p>
          </div>
          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-sm font-semibold">
            <button className="p-2 text-zinc-400 hover:text-white"><ChevronLeft className="h-4 w-4" /></button>
            <span className="px-3 text-white">{monthName}</span>
            <button className="p-2 text-zinc-400 hover:text-white"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-zinc-800">
          <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-950/75 py-3 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 grid-rows-5 auto-rows-fr h-[600px] bg-zinc-900/10">
            {days.map((dayNum, index) => {
              const isValidDay = dayNum > 0 && dayNum <= 31;
              const events = isValidDay ? (mockEvents as any)[dayNum.toString()] || [] : [];
              return (
                <div key={index} className="border-r border-b border-zinc-800 p-3 flex flex-col gap-2 min-h-0 hover:bg-zinc-900/30 transition-all">
                  <span className={`text-sm font-bold ${isValidDay ? 'text-zinc-400' : 'text-zinc-700'}`}>
                    {isValidDay ? dayNum : ''}
                  </span>
                  <div className="flex flex-col gap-1 overflow-y-auto">
                    {events.map((event: any) => (
                      <div
                        key={event.id}
                        className={`p-1.5 rounded-lg text-3xs font-semibold border ${
                          event.status === 'PUBLISHED'
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-pink-500/10 border-pink-500/20 text-pink-400'
                        }`}
                      >
                        <div className="truncate">{event.title}</div>
                        <div className="opacity-60">{event.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </NavigationWrapper>
  );
}
