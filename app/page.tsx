import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Shield, Users, Globe, BarChart } from 'lucide-react';

export default async function HomePage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Floating decorative shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-200/10 to-teal-200/10 rounded-full blur-3xl animate-spin-slow" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {/* Header */}
        <header className="flex justify-between items-center mb-20">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            InvMS
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:shadow-lg transition-all hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </header>

        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1 text-sm text-blue-700 mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Next‑gen inventory for modern teams</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Smart Inventory
            </span>
            <br />
            <span className="text-gray-800">for Metal & Construction</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Track materials, manage sites, and automate stock movements – all in one beautiful platform.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 justify-center"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-full font-medium hover:shadow-lg transition-all hover:border-blue-300"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {[
            { icon: Zap, title: 'Real‑time Stock', desc: 'Instant updates as materials move across your sites.' },
            { icon: Shield, title: 'Multi‑Tenant', desc: 'Secure isolation for each client organization.' },
            { icon: Users, title: 'Team Roles', desc: 'Admin, manager, worker – control access granularly.' },
            { icon: Globe, title: 'Anywhere Access', desc: 'Cloud‑based, works on desktop, tablet, and mobile.' },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 text-sm mt-2">{feature.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Stats / CTA */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-xl border border-white/20 text-center">
          <h2 className="text-3xl font-bold text-gray-800">Ready to streamline your inventory?</h2>
          <p className="text-gray-600 mt-2 max-w-xl mx-auto">
            Join hundreds of teams already using InvMS to save time and reduce waste.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium hover:shadow-xl transition-all hover:scale-105"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-full font-medium hover:shadow-lg transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-sm text-gray-500 border-t border-gray-200/50 pt-8">
          <p>© {new Date().getFullYear()} InvMS – Built for metal fabrication & construction.</p>
        </footer>
      </div>

      {/* Custom animation for spinning gradient */}
      <style jsx>{`
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-pulse {
          animation: pulse 6s ease-in-out infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
