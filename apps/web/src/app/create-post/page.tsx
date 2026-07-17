import NavigationWrapper from '@/components/NavigationWrapper';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

export default function CreatePostPage() {
  const postTypes = ['IMAGE', 'VIDEO', 'REEL', 'CAROUSEL', 'STORY'];

  return (
    <NavigationWrapper>
      <div className="flex flex-col gap-8 max-w-6xl">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Create AI Post</h1>
          <p className="text-zinc-400 text-sm mt-1">Leverage machine learning to generate highly engaging content and schedules.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings / Configuration Panel */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6">
              <h3 className="font-bold text-white text-lg border-b border-zinc-800 pb-3">Post Configuration</h3>

              {/* Post Type Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Post Format</label>
                <div className="grid grid-cols-5 gap-2">
                  {postTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        type === 'IMAGE'
                          ? 'border-pink-500 bg-pink-500/10 text-pink-400 shadow-md shadow-pink-500/5'
                          : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">AI Generation Prompt</label>
                <textarea
                  rows={4}
                  placeholder="Describe what you want the post to be about (e.g., 'A motivational post about coding at midnight with premium dark aesthetics and glassmorphic designs')"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-pink-500 transition-colors resize-none"
                />
              </div>

              {/* Generate button */}
              <button
                type="button"
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold text-sm hover:opacity-95 shadow-lg shadow-pink-500/15 flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="h-4.5 w-4.5" />
                Generate Caption & Hashtags
              </button>
            </div>

            {/* Scheduling Config */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="font-bold text-white text-lg border-b border-zinc-800 pb-2">Scheduling details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-zinc-400">Date</label>
                  <input
                    type="date"
                    className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5 text-sm text-zinc-100 focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-zinc-400">Time</label>
                  <input
                    type="time"
                    className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3.5 text-sm text-zinc-100 focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Preview Panel */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="glass-panel rounded-2xl p-6 border border-zinc-800/80 sticky top-6">
              <h3 className="font-bold text-white text-lg border-b border-zinc-800 pb-3">Live Feed Preview</h3>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 overflow-hidden shadow-2xl mt-4 flex flex-col">
                {/* Instagram Header Mockup */}
                <div className="p-3 border-b border-zinc-900 flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-violet-500 p-[1.5px]">
                    <div className="h-full w-full rounded-full bg-black border border-black" />
                  </div>
                  <span className="text-xs font-bold text-zinc-200">your_account</span>
                </div>
                {/* Media box mockup */}
                <div className="aspect-square bg-zinc-900 flex items-center justify-center text-zinc-600 relative">
                  <ImageIcon className="h-10 w-10 opacity-40" />
                  <span className="absolute bottom-3 left-3 px-2 py-1 bg-black/75 rounded text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    Mock Image
                  </span>
                </div>
                {/* Footer details mockup */}
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-4 text-zinc-300">
                    <button className="hover:text-pink-500 transition-colors">❤️</button>
                    <button className="hover:text-pink-500 transition-colors">💬</button>
                    <button className="hover:text-pink-500 transition-colors">✈️</button>
                  </div>
                  <div className="text-xs font-bold text-zinc-300">1,245 likes</div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    <span className="font-bold text-zinc-200 mr-2">your_account</span>
                    AI generated caption preview will appear here once generated...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </NavigationWrapper>
  );
}
