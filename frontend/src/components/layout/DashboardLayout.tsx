import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { cn } from '../../utils/cn';
import BottomNav from './BottomNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'union' | 'processor' | 'consumer';
  title: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, role, title, subtitle }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const roleBadges = {
    union: 'bg-emerald-100 text-emerald-800',
    processor: 'bg-blue-100 text-blue-800',
    consumer: 'bg-purple-100 text-purple-800'
  };

  const getNavItems = () => {
    switch (role) {
      case 'union':
        return [
          { id: 'batches', path: '/union/batches', label: 'Batches', icon: '📦' },
          { id: 'new', path: '/union/new-harvest', label: 'New Harvest', icon: '🌱' },
          { id: 'mint', path: '/union/mint', label: 'Mint', icon: '🪙' }
        ];
      case 'processor':
        return [
          { id: 'scan', path: '/processor/scan', label: 'Scan', icon: '📷' },
          { id: 'update', path: '/processor/update', label: 'Update', icon: '🔄' }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-stone-200 fixed h-full z-20">
        <div className="p-6 border-b border-stone-100">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-lg">🌱</div>
            <span className="font-display font-bold text-xl text-stone-900">Ethio-Origin</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="mb-6">
            <p className="px-3 text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Menu</p>
            {navItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-stone-100">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate('/roles');
            }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-stone-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <span className="text-lg">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen transition-all duration-300">
        {/* Mobile Header */}
        <header className="bg-white border-b border-stone-200 sticky top-0 z-10 md:hidden">
          <div className="px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/roles')}
                className="p-2 -ml-2 text-stone-500 hover:text-stone-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="font-bold text-stone-900">{title}</h1>
            </div>
            <div className={cn("px-2 py-1 rounded text-xs font-medium uppercase tracking-wider", roleBadges[role])}>
              {role}
            </div>
          </div>
        </header>

        {/* Desktop Header (Breadcrumbs/Title) */}
        <header className="hidden md:flex items-center justify-between px-8 py-6 bg-stone-50">
          <div>
            <h1 className="text-2xl font-display font-bold text-stone-900">{title}</h1>
            {subtitle && <p className="text-stone-500 mt-1">{subtitle}</p>}
          </div>
          <div className={cn("px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider", roleBadges[role])}>
            {role} Account
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-0 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden pb-safe">
        <BottomNav items={navItems} />
      </div>
    </div>
  );
}
