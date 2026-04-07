'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, ShoppingCart, Factory, Package,
  FileText, Recycle, Settings, LogOut, BarChart2, Shield, Menu, X,
  Truck, Cog, Layers, MapPin,
} from 'lucide-react';
import { logout } from '@/lib/auth';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

interface SidebarProps {
  tenantSlug: string;
  userRole: string;
}

export function Sidebar({ tenantSlug, userRole }: SidebarProps) {
  const pathname = usePathname();
  const base = `/${tenantSlug}`;
  const [ouvert, setOuvert] = useState(false);

  const navItems: NavItem[] = [
    { href: `${base}/dashboard`,          label: 'Tableau de bord',    icon: <LayoutDashboard size={18} /> },
    { href: `${base}/clients`,            label: 'CRM / Clients',      icon: <Users size={18} /> },
    { href: `${base}/commandes`,          label: 'Commandes',          icon: <ShoppingCart size={18} /> },
    { href: `${base}/production`,         label: 'Production',         icon: <Factory size={18} /> },
    { href: `${base}/machines`,           label: 'Machines',           icon: <Cog size={18} />,    roles: ['admin','production','direction'] },
    { href: `${base}/stock`,              label: 'Stock',              icon: <Package size={18} /> },
    { href: `${base}/matieres-premieres`, label: 'Matières Premières', icon: <Layers size={18} />, roles: ['admin','magasinier','production','direction'] },
    { href: `${base}/fournisseurs`,       label: 'Fournisseurs',       icon: <Truck size={18} />,  roles: ['admin','magasinier','direction'] },
    { href: `${base}/logistique`,         label: 'Logistique',         icon: <MapPin size={18} />, roles: ['admin','commercial','magasinier','direction'] },
    { href: `${base}/facturation`,        label: 'Facturation',        icon: <FileText size={18} /> },
    { href: `${base}/recyclage`,          label: 'Recyclage',          icon: <Recycle size={18} /> },
    { href: `${base}/reporting`,          label: 'Reporting',          icon: <BarChart2 size={18} />, roles: ['admin','direction','comptable'] },
    { href: `${base}/audit`,              label: 'Journal d\'audit',   icon: <Shield size={18} />,   roles: ['admin', 'direction'] },
    { href: `${base}/admin`,              label: 'Administration',     icon: <Shield size={18} />,   roles: ['admin'] },
    { href: `${base}/parametres`,         label: 'Paramètres',         icon: <Settings size={18} />, roles: ['admin'] },
  ];

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole),
  );

  const NavContent = () => (
    <>
      <div className="p-5 border-b border-blue-800 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">ERP Industriel</h1>
          <p className="text-blue-300 text-xs mt-0.5 uppercase tracking-wide">{tenantSlug}</p>
        </div>
        {/* Bouton fermer sur mobile */}
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setOuvert(false)}
          className="md:hidden p-1 rounded text-blue-300 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOuvert(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-700 text-white font-medium'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-blue-800">
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-blue-200 hover:text-white hover:bg-blue-800 rounded-lg text-sm transition-colors"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Bouton hamburger — mobile seulement */}
      <button
        type="button"
        aria-label="Ouvrir le menu"
        onClick={() => setOuvert(true)}
        className="md:hidden fixed top-3 left-3 z-40 p-2 bg-blue-900 text-white rounded-lg shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Overlay mobile */}
      {ouvert && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOuvert(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar mobile — tiroir */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 text-white flex flex-col
          transform transition-transform duration-200
          md:relative md:translate-x-0 md:flex
          ${ouvert ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <NavContent />
      </aside>
    </>
  );
}
