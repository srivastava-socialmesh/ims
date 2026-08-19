'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  MapPin,
  MoveRight,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  FolderTree,
  Menu,
  X,
  ChevronLeft,
  User,
  ChevronDown,
  Users,
  Building2,
} from 'lucide-react';
import { OrganizationProvider, useOrganization } from '@/lib/context/OrganizationContext';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { name: 'Categories', href: '/dashboard/inventory/categories', icon: FolderTree },
  { name: 'Site/Location', href: '/dashboard/areas', icon: MapPin },
  { name: 'Movements', href: '/dashboard/movements', icon: MoveRight },
  { name: 'Orders', href: '/dashboard/orders', icon: ClipboardList },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  { name: 'Users', href: '/dashboard/settings/users', icon: Users },
];

function DashboardContent({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const { orgName } = useOrganization();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setSidebarCollapsed(JSON.parse(saved));
    }
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.push('/login');
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeMobile = () => setSidebarOpen(false);

  const currentPage = navItems.find(item => pathname === item.href || pathname.startsWith(item.href + '/'))?.name || 'Dashboard';

  const contentMarginLeft = sidebarOpen ? 'ml-0' : (sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64');

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={closeMobile} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white/80 backdrop-blur-xl border-r border-white/30 shadow-2xl transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/30">
          {!sidebarCollapsed && (
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              IMS
            </div>
          )}
          {sidebarCollapsed && (
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              I
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-white/50 text-gray-500 transition-all"
          >
            {sidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobile}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-700 shadow-inner backdrop-blur-sm'
                    : 'text-gray-600 hover:bg-white/50 hover:text-gray-900 backdrop-blur-sm'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                title={sidebarCollapsed ? item.name : ''}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/30" />
      </aside>

      <main className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${contentMarginLeft}`}>
        <header className="bg-white/60 backdrop-blur-xl border-b border-white/30 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">{currentPage}</h1>
              {orgName && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                  <Building2 size={12} />
                  <span>{orgName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center font-semibold shadow-md">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/30 py-1 z-50">
                <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                  {orgName && (
                    <div className="flex items-center gap-1.5">
                      <Building2 size={12} />
                      <span>{orgName}</span>
                    </div>
                  )}
                  <div className="mt-0.5 text-gray-400">{user?.email}</div>
                </div>
                <Link
                  href="/dashboard/settings/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User size={16} />
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings/users"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Users size={16} />
                  User Management
                </Link>
                <hr className="my-1" />
                <button
                  onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrganizationProvider>
      <DashboardContent>{children}</DashboardContent>
    </OrganizationProvider>
  );
}
