'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { isSAAuthenticated, getSAInfo, logoutSA } from '@/lib/super-admin-auth';
import {
  Shield, LayoutDashboard, Building2, LogOut, ChevronRight, Menu, X,
} from 'lucide-react';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const info = getSAInfo();

  useEffect(() => {
    if (pathname === '/super-admin/login') { setReady(true); return; }
    if (!isSAAuthenticated()) {
      router.replace('/super-admin/login');
      return;
    }
    setReady(true);
  }, [pathname, router]);

  if (!ready) return null;
  if (pathname === '/super-admin/login') return <>{children}</>;

  const nav = [
    { href: '/super-admin/dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={18} /> },
    { href: '/super-admin/tenants',   label: 'Tenants',          icon: <Building2 size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col
        transform transition-transform duration-200
        md:relative md:translate-x-0
        ${menuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Admin Plateforme</p>
              <p className="text-slate-400 text-xs">Innosoft Creation</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active ? 'bg-blue-700 text-white font-medium' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Utilisateur + déconnexion */}
        <div className="p-3 border-t border-slate-700 space-y-1">
          {info && (
            <div className="px-3 py-2 text-xs text-slate-400">
              <p className="font-medium text-slate-200 truncate">{info.nom}</p>
              <p className="truncate">{info.email}</p>
            </div>
          )}
          <button
            type="button"
            onClick={logoutSA}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-sm transition-colors"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMenuOpen(false)} />
      )}

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar mobile */}
        <header className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="Menu">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-blue-400" />
            <span className="font-semibold text-sm">Admin Plateforme</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
