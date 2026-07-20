'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import {
  Calendar,
  Sparkles,
  Hash,
  Instagram,
  Clock,
  Layers,
  ChevronDown,
  MessageSquare,
  Globe,
  Users as UsersIcon,
  Upload,
  ArrowRight,
  TrendingUp,
  Award,
  Video,
  FileImage,
  BookOpen,
  Zap,
} from 'lucide-react';

// --- Trust Brand Logo Data ---
const TRUST_BRANDS = [
  { name: 'Instagram', icon: Instagram },
  { name: 'Meta Partner', icon: Globe },
  { name: 'Google Cloud', icon: CloudPlaceholder },
  { name: 'OpenAI API', icon: Sparkles },
  { name: 'Canva Pro', icon: Layers },
];

function CloudPlaceholder(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.47 0-.89.09-1.3.26A7 7 0 0 0 1 11.5c0 2.76 2.24 5 5 5h11.5" />
    </svg>
  );
}

// --- Why Choose Us Data ---
const WHY_CHOOSE_US = [
  {
    title: 'Auto Posting',
    description: 'Post media directly to Instagram without notifications or manual work.',
    icon: Zap,
  },
  {
    title: 'AI Caption Generator',
    description: 'Generate engaging, brand-specific captions instantly in 7 distinct tones.',
    icon: Sparkles,
  },
  {
    title: 'AI Hashtags Strategy',
    description: 'Get AI-estimated hashtags grouped by competitive keyword difficulty.',
    icon: Hash,
  },
  {
    title: 'Carousel Creator',
    description: 'Schedule multi-image carousel posts seamlessly with automated publish.',
    icon: Layers,
  },
  {
    title: 'Reel Scheduler',
    description: 'Upload video and schedule Reels at peak performance times.',
    icon: Video,
  },
  {
    title: 'Story Scheduler',
    description: 'Maintain top-of-mind brand presence by queuing daily Stories.',
    icon: Instagram,
  },
];

// --- Features Grid Data ---
const FEATURES_GRID = [
  { title: 'Smart Calendar', description: 'Intelligent visual planner for your grid layout.', icon: Calendar },
  { title: 'AI Captioning', description: 'Advanced GPT-powered messaging adjustments.', icon: Sparkles },
  { title: 'AI Hashtags', description: 'Difficulty-segmented keyword recommendation.', icon: Hash },
  { title: 'Advanced Analytics', description: 'Aggregated follower reach & impressions tracking.', icon: TrendingUp },
  { title: 'Growth Reports', description: 'Visualize followers increment trends over time.', icon: Award },
  { title: 'Best Posting Time', description: 'Predictions calculated from historical account performance.', icon: Clock },
  { title: 'Auto Reply', description: 'Instant first-comment posting for engagement triggers.', icon: MessageSquare },
  { title: 'Media Library', description: 'Secure S3 cloud storage for bulk assets management.', icon: FileImage },
  { title: 'AI Idea generator', description: 'Never run dry with 30-day niche-specific topics plans.', icon: BookOpen },
  { title: 'Multi Language', description: 'Localization settings support global campaigns.', icon: Globe },
  { title: 'Team Workspaces', description: 'Collaborate with administrators and managers.', icon: UsersIcon },
  { title: 'Bulk Upload', description: 'Publish entire calendars in seconds using batch upload.', icon: Upload },
];

// --- Testimonials Data ---
const TESTIMONIALS = [
  {
    name: 'Aarav Mehta',
    initials: 'AM',
    role: 'Founder, Bloomline Co.',
    quote: 'This platform saved me hours scheduling reels. The AI caption generation matches my authentic tone perfectly and drives higher reach.',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    name: 'Sophie Chen',
    initials: 'SC',
    role: 'Social Media Manager',
    quote: 'The analytics dashboard combined with best-time prediction has doubled our engagement rate. Best automation investment we have made.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    name: 'Marcus Johnson',
    initials: 'MJ',
    role: 'Creator, Alpha Athletics',
    quote: 'I love the AI hashtags. Getting difficulty-grouped suggestions helped my posts hit the Explore page repeatedly.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Elena Rostova',
    initials: 'ER',
    role: 'E-commerce Specialist',
    quote: 'Having the auto-posting work natively without push reminders is a lifesaver. The calendar UI is beautiful and extremely intuitive.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    name: 'Kenji Sato',
    initials: 'KS',
    role: 'Growth Lead, Tokyo Tech',
    quote: 'The 30-day AI content calendar generator solved our writer block entirely. We went from posting twice a week to daily consistency.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    name: 'Sarah OConnor',
    initials: 'SO',
    role: 'Digital Strategist',
    quote: 'Managing multiple client accounts under one admin workspace has simplified our agency workflow. Limits guard checks keep budgets clean.',
    gradient: 'from-fuchsia-500 to-pink-500',
  },
];

// --- FAQ Data ---
const FAQS = [
  { q: 'Is this compliant with Instagram API policies?', a: 'Yes, we only connect via the official Meta Graph API OAuth. Your credentials are secure and we never scrape or store plain-text passwords.' },
  { q: 'How does the AI caption generator work?', a: 'It utilizes OpenAI GPT models to analyze your post topic and output copy customized to 7 specific tones. It can also suggest relevant hashtag difficulties.' },
  { q: 'Can I cancel my subscription anytime?', a: 'Absolutely. You can manage or cancel your auto-renewal subscription instantly using the Stripe Customer Portal inside your billing tab.' },
  { q: 'What payment methods do you support?', a: 'We secure all transactions via Stripe Checkout, accepting major Credit Cards, Apple Pay, Google Pay, and localized secure cards.' },
  { q: 'Are my connected profiles safe?', a: 'Yes, tokens are encrypted in transit and rest using AES-256-GCM encryption. We do not store or access your personal Meta passwords.' },
  { q: 'Which plan fits agencies best?', a: 'The Business and Enterprise plans allow 10+ connected accounts, multi-member team collaboration settings, and higher monthly posting limits.' },
  { q: 'What kinds of posts are supported?', a: 'We support Images, Videos, Reels, Carousels, and Stories auto-publishing.' },
  { q: 'Is there a limit on AI caption credits?', a: 'Limits are based on plan tier. Free tiers include 10 requests/month, while Pro tiers include 200, and Enterprise tiers include unlimited requests.' },
];

export default function Home() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Pricing pricing data mapped to plan-limits
  const PRICING_PLANS = [
    {
      name: 'Free',
      monthlyPrice: 0,
      description: 'Test driving automations.',
      features: ['1 connected Instagram account', '5 scheduled posts / month', '10 AI caption generations / month', 'Standard support'],
      cta: 'Get Started Free',
    },
    {
      name: 'Starter',
      monthlyPrice: 9,
      description: 'For growing personal accounts.',
      features: ['3 connected Instagram accounts', '30 scheduled posts / month', '50 AI caption generations / month', 'Standard analytics tracking'],
      cta: 'Upgrade to Starter',
    },
    {
      name: 'Pro',
      monthlyPrice: 29,
      description: 'Our most popular plan for brands.',
      features: ['5 connected Instagram accounts', '100 scheduled posts / month', '200 AI caption generations / month', 'Detailed analytics dashboard', '24/7 priority support'],
      cta: 'Upgrade to Pro',
      popular: true,
    },
    {
      name: 'Business',
      monthlyPrice: 79,
      description: 'For agencies and power users.',
      features: ['10 connected Instagram accounts', '500 scheduled posts / month', '1000 AI caption generations / month', 'Detailed analytics dashboard', '24/7 priority support'],
      cta: 'Upgrade to Business',
    },
  ];

  return (
    <main className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between" style={{
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0b1e 50%, #0a0f1e 100%)',
    }}>
      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-pink-500 to-violet-500 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-pink-500/20">
            I
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">Insta<span className="text-pink-500">AI</span></span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          <SignedIn>
            <Link href="/dashboard" className="text-pink-500 hover:text-pink-400 transition-colors">Dashboard</Link>
          </SignedIn>
        </nav>

        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-semibold text-sm hover:opacity-90 shadow-md shadow-pink-500/20 transition-all">
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center px-6 py-20 md:py-32 flex flex-col items-center gap-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-950 text-xs font-semibold text-pink-400">
          ✨ Introducing Phase 1 Foundation
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-none">
          Automate Instagram with <span className="bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">Artificial Intelligence</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed">
          The ultimate production-grade Instagram automation engine. Craft engaging copy, schedule posts intelligently, and measure progress instantly.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold shadow-lg shadow-pink-500/20 hover:opacity-95 transition-all text-center">
            Get Started Free
          </Link>
          <Link href="/pricing" className="w-full sm:w-auto px-8 py-4 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300 font-semibold transition-all text-center">
            View Pricing
          </Link>
        </div>
      </section>

      {/* 1. Trusted By / Social Proof Strip */}
      <section className="py-12 border-y border-zinc-900 bg-zinc-950/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-6">Trusted by teams who scale with</p>
          <div className="flex justify-center items-center gap-8 md:gap-16 flex-wrap opacity-40">
            {TRUST_BRANDS.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.name} className="flex items-center gap-2 hover:opacity-100 transition-opacity">
                  <Icon className="h-5 w-5 text-white" />
                  <span className="font-extrabold text-sm text-white tracking-tight">{b.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Why Choose Us */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="text-center flex flex-col gap-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-white">Engineered for absolute automation</h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
            Focus on creative design while our algorithms schedule, optimize, and auto-publish your content natively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_CHOOSE_US.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="glass-panel border border-zinc-850 bg-zinc-950/20 rounded-2xl p-6 hover:border-pink-500/30 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-pink-500 mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-white text-base mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. Features Grid */}
      <section className="py-20 md:py-28 border-t border-zinc-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center flex flex-col gap-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white">Full-stack feature capability</h2>
            <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
              Everything you need to orchestrate Instagram growth from one unified control dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES_GRID.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="glass-panel border border-zinc-850 bg-zinc-950/10 rounded-2xl p-5 hover:bg-zinc-950/40 transition-colors">
                  <Icon className="h-5 w-5 text-pink-500 mb-3" />
                  <h4 className="font-bold text-white text-sm mb-1">{feat.title}</h4>
                  <p className="text-zinc-500 text-2xs leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="py-20 md:py-28 border-t border-zinc-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center flex flex-col gap-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white">Connect and scale in 5 simple steps</h2>
            <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
              Seamlessly set up your automated schedule queue in under 3 minutes.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4 relative">
            {[
              { num: '1', title: 'Connect Account', desc: 'Securely link via Meta Developer portal API.', icon: Instagram },
              { num: '2', title: 'Upload Assets', desc: 'Drag-and-drop video/images to S3 library.', icon: Upload },
              { num: '3', title: 'Generate Copy', desc: 'AI generates caption options and tags.', icon: Sparkles },
              { num: '4', title: 'Schedule Queue', desc: 'Pin to post at best engagement time.', icon: Calendar },
              { num: '5', title: 'Auto Publish', desc: 'Engine publishes directly to your feed.', icon: Zap },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center text-center max-w-[200px] relative">
                  <div className="relative mb-4 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-pink-500 font-black text-sm z-10">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-400 text-2xs font-extrabold flex items-center justify-center z-20">
                      {step.num}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs mb-1.5">{step.title}</h4>
                  <p className="text-zinc-500 text-2xs leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Testimonials / Reviews */}
      <section className="py-20 md:py-28 border-t border-zinc-900/50 bg-zinc-950/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center flex flex-col gap-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white">Loved by creators and marketers</h2>
            <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
              Read how teams and independent content strategists are saving hours using our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="glass-panel border border-zinc-850 bg-zinc-950/20 rounded-2xl p-6 flex flex-col justify-between hover:border-pink-500/30 transition-colors">
                <div>
                  <div className="flex gap-1 mb-4 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="text-zinc-300 text-xs italic leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                </div>

                <div className="flex items-center gap-3 border-t border-zinc-900/80 pt-4">
                  {/* Initials-based gradient avatar fallback (looks extremely premium) */}
                  <div className={`h-9 w-9 rounded-full bg-gradient-to-tr ${t.gradient} flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md`}>
                    {t.initials}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-xs truncate">{t.name}</h4>
                    <p className="text-zinc-500 text-2xs truncate">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Pricing Section */}
      <section className="py-20 md:py-28 border-t border-zinc-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center flex flex-col gap-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-black text-white">Pricing plans built for scaling</h2>
            <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
              Select the pricing plan appropriate for your publishing volume and scheduled channels.
            </p>
          </div>

          {/* Monthly / Yearly Switch */}
          <div className="flex items-center justify-center gap-3 mb-16">
            <span className={`text-xs font-semibold ${!isYearly ? 'text-white' : 'text-zinc-500'}`}>Monthly Billing</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="w-12 h-6 bg-zinc-800 rounded-full p-1 transition-colors outline-none focus:ring-1 focus:ring-pink-500"
            >
              <div className={`h-4 w-4 rounded-full bg-pink-500 transition-transform ${isYearly ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-xs font-semibold ${isYearly ? 'text-white' : 'text-zinc-500'} flex items-center gap-1.5`}>
              Yearly Billing
              <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold bg-pink-500/20 text-pink-400 border border-pink-500/30">
                SAVE 20%
              </span>
            </span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRICING_PLANS.map((plan) => {
              const displayPrice = isYearly
                ? Math.round(plan.monthlyPrice * 0.8)
                : plan.monthlyPrice;
              return (
                <div
                  key={plan.name}
                  className={`glass-panel rounded-2xl p-6 flex flex-col justify-between border ${
                    plan.popular ? 'border-pink-500/50 bg-pink-500/5' : 'border-zinc-800 bg-zinc-950/20'
                  }`}
                >
                  <div>
                    {plan.popular && (
                      <span className="inline-block px-3 py-0.5 rounded-full text-3xs font-extrabold bg-pink-500/20 text-pink-400 border border-pink-500/30 mb-4 uppercase tracking-wider">
                        Most Popular
                      </span>
                    )}
                    <h3 className="text-md font-bold text-white mb-2">{plan.name} Plan</h3>
                    <div className="flex items-baseline gap-0.5 mb-4">
                      <span className="text-3xl font-black text-white">${displayPrice}</span>
                      <span className="text-zinc-500 text-xs">/mo</span>
                    </div>
                    <p className="text-zinc-500 text-2xs mb-4">{plan.description}</p>
                    <div className="h-px bg-zinc-800 my-4" />
                    <ul className="flex flex-col gap-2.5 text-2xs text-zinc-300">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-pink-500">✓</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6">
                    <Link
                      href="/subscription"
                      className={`block w-full py-2.5 px-4 rounded-xl text-center font-bold text-xs transition-all ${
                        plan.popular
                          ? 'bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-md shadow-pink-500/10'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="py-20 md:py-28 border-t border-zinc-900/50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-16">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="glass-panel border border-zinc-850 bg-zinc-950/10 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left px-6 py-4 flex items-center justify-between font-bold text-white text-xs md:text-sm hover:bg-zinc-950/40 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 pt-1 text-zinc-400 text-xs leading-relaxed border-t border-zinc-900/40 bg-zinc-950/10">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        <div className="glass-panel rounded-3xl border border-pink-500/25 bg-gradient-to-r from-pink-500/10 to-violet-500/10 p-8 md:p-16 text-center flex flex-col items-center justify-center gap-6 shadow-xl shadow-pink-500/5">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">Ready to automate your Instagram?</h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl">
            Get started today on the Free plan. Instantly craft captions, coordinate campaigns with your visual calendar, and analyze growth.
          </p>
          <Link href="/dashboard" className="px-8 py-3.5 mt-2 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold text-sm shadow-lg shadow-pink-500/20 hover:opacity-95 transition-all flex items-center gap-1.5">
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* 9. 4-Column Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/40 py-16 text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Tagline */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-pink-500 to-violet-500 flex items-center justify-center font-bold text-white">
                I
              </div>
              <span className="font-extrabold text-lg text-white">InstaAI</span>
            </div>
            <p className="text-zinc-500 leading-relaxed text-2xs">
              SaaS automation workspace for social scaling managers and creator teams.
            </p>
          </div>

          {/* Product links */}
          <div className="flex flex-col gap-3">
            <span className="font-bold text-white text-xs">Product</span>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing Options</Link>
            <Link href="/ai-calendar" className="hover:text-white transition-colors">AI Studio Generator</Link>
            <Link href="/create-post" className="hover:text-white transition-colors">Creator Upload</Link>
            <Link href="/calendar" className="hover:text-white transition-colors">Visual Grid Planner</Link>
          </div>

          {/* Resources links */}
          <div className="flex flex-col gap-3">
            <span className="font-bold text-white text-xs">Resources</span>
            <Link href="/help" className="hover:text-white transition-colors">Documentation</Link>
            <Link href="/support" className="hover:text-white transition-colors">Help Ticket Support</Link>
            <Link href="/notifications" className="hover:text-white transition-colors">Status Alerts logs</Link>
          </div>

          {/* Company links */}
          <div className="flex flex-col gap-3">
            <span className="font-bold text-white text-xs">Legal &amp; Policy</span>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/billing" className="hover:text-white transition-colors">Upgrade Billing</Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-2xs text-zinc-500">
          <p>&copy; {new Date().getFullYear()} InstaAI Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-zinc-300">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-zinc-300">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
