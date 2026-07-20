'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  BarChart3,
  Bell,
  Settings,
  CreditCard,
  HelpCircle,
  LifeBuoy,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface NavigationWrapperProps {
  children: React.ReactNode;
}

export default function NavigationWrapper({ children }: NavigationWrapperProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Create Post', href: '/create-post', icon: PlusCircle },
    { name: 'AI Content Studio', href: '/ai-calendar', icon: Sparkles },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Subscription', href: '/subscription', icon: Sparkles },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Support', href: '/support', icon: LifeBuoy },
    { name: 'Help Center', href: '/help', icon: HelpCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-black text-zinc-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950/50 flex flex-col justify-between hidden md:flex">
        <div className="flex flex-col gap-6 py-6 px-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-pink-500 to-violet-500 flex items-center justify-center font-bold text-white">
              I
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">Insta<span className="text-pink-500">AI</span></span>
          </div>

          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-pink-500/10 to-violet-500/10 border border-pink-500/20 text-pink-400'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50 border border-transparent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile section */}
        <div className="border-t border-zinc-900 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="flex flex-col text-xs">
              <span className="font-semibold text-white">My Account</span>
              <span className="text-zinc-500">Active Session</span>
            </div>
          </div>
          <Link href="/" className="text-zinc-500 hover:text-white transition-colors">
            <LogOut className="h-4 w-4" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden border-b border-zinc-800 bg-zinc-950 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-pink-500 to-violet-500 flex items-center justify-center font-bold text-white">
              I
            </div>
            <span className="font-extrabold text-lg text-white">InstaAI</span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 gradient-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
