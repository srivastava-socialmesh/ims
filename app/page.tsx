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
    <div 
      className="min-h-screen flex flex-col relative"
      style={{
        backgroundImage: `url('https://nbkiydajwrirmbomwsot.supabase.co/storage/v1/object/sign/background/1000976380.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lMzVhY2MxYi1kOWM4LTRjZTYtOTdlYS0wNWQzMmQ5N2ViY2IiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiYWNrZ3JvdW5kLzEwMDA5NzYzODAucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4Njc3NjMzMywiZXhwIjoxODE4MzEyMzMzfQ.er977RbEVmWXC0K3BRlbtbIS70apjAnWzQS9bSoquC0')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Subtle overlay for readability */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-[1px]" />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header - compact */}
        <header className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            IMS
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Link
              href="/login"
              className="px-3 sm:px-5 py-1.5 sm:py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors bg-white/60 backdrop-blur-sm rounded-full hover:bg-white/80"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-3 sm:px-5 py-1.5 sm:py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:shadow-lg transition-all hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </header>

        {/* Main content - compact with less spacing */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-full px-3 sm:px-4 py-1 text-xs sm:text-sm text-blue-700 mb-4 sm:mb-6">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Next‑gen inventory for modern teams</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Smart Inventory
              </span>
              <br />
              <span className="text-gray-800">for Small and Medium Businesses</span>
            </h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-700 max-w-2xl mx-auto bg-white/40 backdrop-blur-sm p-3 sm:p-4 rounded-2xl">
              Track materials, manage sites, and automate stock movements – all in one beautiful platform.
            </p>
            <div className="mt-5 sm:mt-7 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/register"
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 justify-center text-sm sm:text-base"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <Link
                href="#features"
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white/70 backdrop-blur-sm border border-gray-200 text-gray-700 rounded-full font-medium hover:shadow-lg transition-all hover:border-blue-300 text-sm sm:text-base"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Features - compact grid */}
          <div id="features" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-12 w-full max-w-5xl">
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
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-5 shadow-md border border-white/40 hover:shadow-xl transition-all hover:-translate-y-1 group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 text-xs sm:text-sm mt-1">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-gray-200/50 bg-white/30 backdrop-blur-sm py-3 sm:py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm text-gray-600">
            © {new Date().getFullYear()} IMS – Inventory Management System &nbsp;&nbsp;&nbsp; Powered by AeroDesk Global
          </p>
        </footer>
      </div>
    </div>
  );
}
