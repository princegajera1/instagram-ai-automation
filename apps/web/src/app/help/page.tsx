import NavigationWrapper from '@/components/NavigationWrapper';
import { Search, FileText } from 'lucide-react';

export default function HelpCenterPage() {
  const articles = [
    { title: 'Connecting your Instagram Creator Profile', category: 'Integration' },
    { title: 'Customizing your AI Generation Prompts', category: 'AI Tools' },
    { title: 'Troubleshooting failed schedules', category: 'Content Pipeline' },
    { title: 'Clerk role based security guidelines', category: 'Accounts & Roles' },
  ];

  return (
    <NavigationWrapper>
      <div className="flex flex-col gap-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Help Center</h1>
          <p className="text-zinc-400 text-sm mt-1">Search the knowledge base, read guides, and explore API instructions.</p>
        </div>

        {/* Search bar mockup */}
        <div className="glass-panel rounded-2xl p-5 flex items-center gap-3 border border-zinc-800">
          <Search className="h-5 w-5 text-zinc-500 shrink-0" />
          <input
            type="text"
            placeholder="Search for articles, guides, or troubleshooting tips..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
        </div>

        {/* Articles List */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-white text-lg border-b border-zinc-800 pb-2">Popular Articles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {articles.map((art) => (
              <div key={art.title} className="glass-panel rounded-2xl p-5 flex items-start gap-4 border border-zinc-800 hover:border-pink-500/20 transition-all cursor-pointer">
                <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-pink-500">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-pink-400 text-2xs font-semibold uppercase tracking-wider">{art.category}</span>
                  <span className="font-bold text-white text-sm hover:text-pink-500 transition-colors">{art.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </NavigationWrapper>
  );
}
