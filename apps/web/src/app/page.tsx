'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { motion, useScroll, useTransform } from 'framer-motion';
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

// --- Motion Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.215, 0.61, 0.355, 1] },
  },
};

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

// --- Testimonials Data with Upgraded AI Avatar Images ---
const TESTIMONIALS = [
  {
    name: 'Aarav Mehta',
    role: 'Founder, Bloomline Co.',
    quote: 'This platform saved me hours scheduling reels. The AI caption generation matches my authentic tone perfectly and drives higher reach.',
    avatar: '/testimonials/avatar1.png',
  },
  {
    name: 'Sophie Chen',
    role: 'Social Media Manager',
    quote: 'The analytics dashboard combined with best-time prediction has doubled our engagement rate. Best automation investment we have made.',
    avatar: '/testimonials/avatar2.png',
  },
  {
    name: 'Marcus Johnson',
    role: 'Creator, Alpha Athletics',
    quote: 'I love the AI hashtags. Getting difficulty-grouped suggestions helped my posts hit the Explore page repeatedly.',
    avatar: '/testimonials/avatar3.png',
  },
  {
    name: 'Elena Rostova',
    role: 'E-commerce Specialist',
    quote: 'Having the auto-posting work natively without push reminders is a lifesaver. The calendar UI is beautiful and extremely intuitive.',
    avatar: '/testimonials/avatar4.png',
  },
  {
    name: 'Kenji Sato',
    role: 'Growth Lead, Tokyo Tech',
    quote: 'The 30-day AI content calendar generator solved our writer block entirely. We went from posting twice a week to daily consistency.',
    avatar: '/testimonials/avatar5.png',
  },
  {
    name: 'Sarah OConnor',
    role: 'Digital Strategist',
    quote: 'Managing multiple client accounts under one admin workspace has simplified our agency workflow. Limits guard checks keep budgets clean.',
    avatar: '/testimonials/avatar6.png',
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

  const { scrollYProgress, scrollY } = useScroll();
  const heroOrbY1 = useTransform(scrollY, [0, 800], [0, 160]);
  const heroOrbY2 = useTransform(scrollY, [0, 800], [0, -120]);

  // Pricing data mapped to plan-limits
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
    <main className="min-h-screen bg-black text-zinc-100 flex flex-col justify-between overflow-x-hidden relative" style={{
      background: 'radial-gradient(circle at 50% 0%, #150d2a 0%, #0a0a0f 60%, #050508 100%)',
    }}>
      {/* Scroll Progress Indicator Bar */}
      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 origin-left z-50 pointer-events-none shadow-[0_0_12px_rgba(236,72,153,0.8)]"
      />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-pink-500 to-violet-500 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-pink-500/25">
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
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all shadow-md"
              >
                Sign In
              </motion.button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 25px rgba(236, 72, 153, 0.4)' }}
                whileTap={{ scale: 0.96 }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-semibold text-sm shadow-md shadow-pink-500/20 transition-all"
              >
                Go to Dashboard
              </motion.button>
            </Link>
          </SignedIn>
        </div>
      </header>

      {/* Hero Section with Parallax Background Orbs */}
      <section className="max-w-4xl mx-auto text-center px-6 py-20 md:py-32 flex flex-col items-center gap-8 relative z-10">
        {/* Parallax Background Orbs */}
        <motion.div
          style={{ y: heroOrbY1 }}
          className="absolute -top-16 -left-32 w-80 h-80 bg-pink-600/15 rounded-full blur-3xl pointer-events-none -z-10"
        />
        <motion.div
          style={{ y: heroOrbY2 }}
          className="absolute top-20 -right-32 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none -z-10"
        />

        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 text-xs font-semibold text-pink-300 backdrop-blur-md"
        >
          <Sparkles className="h-3.5 w-3.5 text-pink-400" />
          <span>Introducing Phase 1 Foundation</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-tight text-white leading-none"
        >
          Automate Instagram with <span className="bg-gradient-to-r from-pink-500 via-purple-400 to-violet-500 bg-clip-text text-transparent">Artificial Intelligence</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed"
        >
          The ultimate production-grade Instagram automation engine. Craft engaging copy, schedule posts intelligently, and measure progress instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto"
        >
          <Link href="/dashboard" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(236, 72, 153, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold shadow-lg shadow-pink-500/25 transition-all text-center"
            >
              Get Started Free
            </motion.button>
          </Link>
          <Link href="/pricing" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.04, borderColor: 'rgba(236, 72, 153, 0.4)' }}
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md text-zinc-300 font-semibold transition-all text-center"
            >
              View Pricing
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* 1. Trusted By / Social Proof Strip */}
      <section className="py-12 border-y border-zinc-900/80 bg-zinc-950/40 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mb-6">Trusted by teams who scale with</p>
          <div className="flex justify-center items-center gap-8 md:gap-16 flex-wrap opacity-60">
            {TRUST_BRANDS.map((b) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.name}
                  whileHover={{ scale: 1.08, opacity: 1 }}
                  className="flex items-center gap-2 transition-opacity cursor-pointer"
                >
                  <Icon className="h-5 w-5 text-white" />
                  <span className="font-extrabold text-sm text-white tracking-tight">{b.name}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Why Choose Us */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center flex flex-col gap-4 mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-black text-white">Engineered for absolute automation</h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
            Focus on creative design while our algorithms schedule, optimize, and auto-publish your content natively.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {WHY_CHOOSE_US.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -6, borderColor: 'rgba(236, 72, 153, 0.4)', boxShadow: '0 16px 30px -10px rgba(236, 72, 153, 0.15)' }}
                className="glass-panel border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 group"
              >
                <div className="h-11 w-11 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-pink-500 mb-4 group-hover:scale-110 group-hover:bg-pink-500/10 group-hover:border-pink-500/30 transition-all">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-white text-base mb-2 group-hover:text-pink-300 transition-colors">{item.title}</h3>
                <p className="text-zinc-400 text-xs leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* 3. Features Grid */}
      <section className="py-20 md:py-28 border-t border-zinc-900/80 bg-gradient-to-b from-zinc-950/20 via-zinc-900/10 to-zinc-950/20 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center flex flex-col gap-4 mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white">Full-stack feature capability</h2>
            <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
              Everything you need to orchestrate Instagram growth from one unified control dashboard.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {FEATURES_GRID.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -5, borderColor: 'rgba(168, 85, 247, 0.4)' }}
                  className="glass-panel border border-zinc-800/60 bg-zinc-950/30 backdrop-blur-sm rounded-2xl p-5 hover:bg-zinc-900/40 transition-all duration-300 group"
                >
                  <Icon className="h-5 w-5 text-pink-500 mb-3 group-hover:scale-110 group-hover:text-pink-400 transition-transform" />
                  <h4 className="font-bold text-white text-sm mb-1 group-hover:text-pink-200 transition-colors">{feat.title}</h4>
                  <p className="text-zinc-500 text-2xs leading-relaxed">{feat.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="py-20 md:py-28 border-t border-zinc-900/80 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center flex flex-col gap-4 mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white">Connect and scale in 5 simple steps</h2>
            <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
              Seamlessly set up your automated schedule queue in under 3 minutes.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4 relative"
          >
            {[
              { num: '1', title: 'Connect Account', desc: 'Securely link via Meta Developer portal API.', icon: Instagram },
              { num: '2', title: 'Upload Assets', desc: 'Drag-and-drop video/images to S3 library.', icon: Upload },
              { num: '3', title: 'Generate Copy', desc: 'AI generates caption options and tags.', icon: Sparkles },
              { num: '4', title: 'Schedule Queue', desc: 'Pin to post at best engagement time.', icon: Calendar },
              { num: '5', title: 'Auto Publish', desc: 'Engine publishes directly to your feed.', icon: Zap },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="flex-1 flex flex-col items-center text-center max-w-[200px] relative group"
                >
                  <div className="relative mb-4 flex items-center justify-center">
                    <div className="h-13 w-13 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-pink-500 font-black text-sm z-10 group-hover:scale-110 group-hover:border-pink-500/50 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-400 text-2xs font-extrabold flex items-center justify-center z-20">
                      {step.num}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs mb-1.5 group-hover:text-pink-300 transition-colors">{step.title}</h4>
                  <p className="text-zinc-500 text-2xs leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 5. Testimonials / Reviews with AI Headshot Avatars */}
      <section className="py-20 md:py-28 border-t border-zinc-900/80 bg-zinc-950/40 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center flex flex-col gap-4 mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white">Loved by creators and marketers</h2>
            <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
              Read how teams and independent content strategists are saving hours using our platform.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {TESTIMONIALS.map((t, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -6, borderColor: 'rgba(236, 72, 153, 0.35)', boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.5)' }}
                className="glass-panel border border-zinc-800/80 bg-zinc-950/50 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 group"
              >
                <div>
                  <div className="flex gap-1 mb-4 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-zinc-300 text-xs italic leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                </div>

                <div className="flex items-center gap-3 border-t border-zinc-900 pt-4">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-cover border border-zinc-700/60 shrink-0 group-hover:border-pink-500/60 transition-colors"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-xs truncate group-hover:text-pink-300 transition-colors">{t.name}</h4>
                    <p className="text-zinc-500 text-2xs truncate">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. Pricing Section */}
      <section className="py-20 md:py-28 border-t border-zinc-900/80 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center flex flex-col gap-4 mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-black text-white">Pricing plans built for scaling</h2>
            <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
              Select the pricing plan appropriate for your publishing volume and scheduled channels.
            </p>
          </motion.div>

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
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {PRICING_PLANS.map((plan) => {
              const displayPrice = isYearly
                ? Math.round(plan.monthlyPrice * 0.8)
                : plan.monthlyPrice;
              return (
                <motion.div
                  key={plan.name}
                  variants={itemVariants}
                  whileHover={{ y: -6, borderColor: plan.popular ? 'rgba(236, 72, 153, 0.8)' : 'rgba(168, 85, 247, 0.4)' }}
                  className={`glass-panel rounded-2xl p-6 flex flex-col justify-between border transition-all duration-300 ${
                    plan.popular ? 'border-pink-500/50 bg-pink-500/10 shadow-[0_0_30px_rgba(236,72,153,0.15)]' : 'border-zinc-800 bg-zinc-950/30'
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
                    <div className="h-px bg-zinc-800/80 my-4" />
                    <ul className="flex flex-col gap-2.5 text-2xs text-zinc-300">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-pink-500 font-bold">✓</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6">
                    <Link href="/subscription" className="block w-full">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={`w-full py-2.5 px-4 rounded-xl text-center font-bold text-xs transition-all ${
                          plan.popular
                            ? 'bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-md shadow-pink-500/20'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                        }`}
                      >
                        {plan.cta}
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="py-20 md:py-28 border-t border-zinc-900/80 relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-black text-white text-center mb-16"
          >
            Frequently Asked Questions
          </motion.h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="flex flex-col gap-4"
          >
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="glass-panel border border-zinc-800/80 bg-zinc-950/30 backdrop-blur-sm rounded-2xl overflow-hidden transition-colors hover:border-zinc-700"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left px-6 py-4 flex items-center justify-between font-bold text-white text-xs md:text-sm hover:bg-zinc-900/40 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-pink-400' : 'rotate-0'}`} />
                  </button>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-4 pt-1 text-zinc-400 text-xs leading-relaxed border-t border-zinc-900/60 bg-zinc-950/20"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="max-w-5xl mx-auto px-6 py-12 md:py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel rounded-3xl border border-pink-500/30 bg-gradient-to-r from-pink-500/15 via-purple-500/10 to-violet-500/15 p-8 md:p-16 text-center flex flex-col items-center justify-center gap-6 shadow-2xl shadow-pink-500/10 relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-none">Ready to automate your Instagram?</h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl">
            Get started today on the Free plan. Instantly craft captions, coordinate campaigns with your visual calendar, and analyze growth.
          </p>
          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: '0 0 35px rgba(236, 72, 153, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3.5 mt-2 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 text-white font-bold text-sm shadow-lg shadow-pink-500/25 transition-all flex items-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* 9. 4-Column Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/60 backdrop-blur-md py-16 text-xs text-zinc-400 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Tagline */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-pink-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-md shadow-pink-500/20">
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
