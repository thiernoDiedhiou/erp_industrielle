'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, ShoppingCart, Factory, Package,
  FileText, Recycle, Settings, LogOut, BarChart2, Shield, Menu, X,
  Truck, Cog, Layers, MapPin, BookOpen, UserCheck, ChevronDown, ChevronRight,
} from 'lucide-react';
import { logout } from '@/lib/auth';
import type { PermissionsMap } from '@/lib/permissions-context';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  moduleCode?: string;
  adminOnly?: boolean;
}

interface Branding {
  nom: string;
  slug: string;
  logo: string | null;
  couleurPrimaire: string | null;
  couleurSecondaire: string | null;
}

interface SidebarProps {
  tenantSlug: string;
  userRole: string;
  permissions: PermissionsMap;
  branding?: Branding;
}

export function Sidebar({ tenantSlug, userRole, permissions, branding }: SidebarProps) {
  const pathname = usePathname();
  const base = `/${tenantSlug}`;
  const [ouvert, setOuvert] = useState(false);
  const isAdmin = userRole === 'admin';

  const couleur = branding?.couleurPrimaire ?? '#1e3a8a';
  const sidebarStyle = { backgroundColor: couleur };
  const activeLinkStyle = { backgroundColor: 'rgba(255,255,255,0.18)' };
  const hoverLinkClass = 'hover:bg-white/10';

  // Pages rattachées au groupe Administration (pour la détection active)
  const adminPaths = [
    `${base}/admin`,
    `${base}/audit`,
    `${base}/settings`,
    `${base}/parametres`,
  ];
  const adminGroupActive = adminPaths.some((p) => pathname.startsWith(p));
  const [adminExpanded, setAdminExpanded] = useState(adminGroupActive);

  const navItems: NavItem[] = [
    { href: `${base}/dashboard`,          label: 'Tableau de bord',    icon: <LayoutDashboard size={18} /> },
    { href: `${base}/clients`,            label: 'CRM / Clients',      icon: <Users size={18} />,        moduleCode: 'crm' },
    { href: `${base}/commandes`,          label: 'Commandes',          icon: <ShoppingCart size={18} />, moduleCode: 'commandes' },
    { href: `${base}/production`,         label: 'Production',         icon: <Factory size={18} />,      moduleCode: 'production' },
    { href: `${base}/machines`,           label: 'Machines',           icon: <Cog size={18} />,          moduleCode: 'machines' },
    { href: `${base}/stock`,             label: 'Stock',              icon: <Package size={18} />,      moduleCode: 'stock' },
    { href: `${base}/matieres-premieres`, label: 'Matières Premières', icon: <Layers size={18} />,       moduleCode: 'matieres-premieres' },
    { href: `${base}/bom`,               label: 'Nomenclatures (BOM)',icon: <BookOpen size={18} />,     moduleCode: 'bom' },
    { href: `${base}/fournisseurs`,       label: 'Fournisseurs',       icon: <Truck size={18} />,        moduleCode: 'fournisseurs' },
    { href: `${base}/logistique`,         label: 'Logistique',         icon: <MapPin size={18} />,       moduleCode: 'logistique' },
    { href: `${base}/facturation`,        label: 'Facturation',        icon: <FileText size={18} />,     moduleCode: 'facturation' },
    { href: `${base}/recyclage`,          label: 'Recyclage',          icon: <Recycle size={18} />,      moduleCode: 'recyclage' },
    { href: `${base}/reporting`,          label: 'Reporting',          icon: <BarChart2 size={18} />,    moduleCode: 'reporting' },
  ];

  const adminChildren: NavItem[] = [
    { href: `${base}/admin`,                   label: 'Administration',  icon: <Shield size={16} />,    adminOnly: true },
    { href: `${base}/audit`,                   label: "Journal d'audit", icon: <FileText size={16} />,  adminOnly: true },
    { href: `${base}/settings/utilisateurs`,   label: 'Utilisateurs',    icon: <UserCheck size={16} />, adminOnly: true },
    { href: `${base}/settings/groupes`,        label: 'Groupes & Droits',icon: <Users size={16} />,     adminOnly: true },
    { href: `${base}/parametres`,              label: 'Paramètres',      icon: <Settings size={16} />,  adminOnly: true },
  ];

  const visibleItems = navItems.filter((item) => {
    if (!item.moduleCode && !item.adminOnly) return true;
    if (item.adminOnly) return isAdmin;
    if (isAdmin) return true;
    return permissions[item.moduleCode!]?.lire === true;
  });

  const NavContent = () => (
    <>
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link href={`${base}/dashboard`} className="flex items-center gap-2.5 min-w-0 group">
          {branding?.logo ? (
            <img src={branding.logo} alt="logo" className="h-8 w-8 rounded object-contain bg-white/10 p-0.5 flex-shrink-0" />
          ) : (
            <div className="h-8 w-8 rounded bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(branding?.nom ?? tenantSlug).charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-bold text-sm leading-tight text-white truncate group-hover:text-white/80 transition-colors">{branding?.nom ?? 'ERP Industriel'}</h1>
            <p className="text-white/50 text-xs mt-0.5 uppercase tracking-wide truncate">{tenantSlug}</p>
          </div>
        </Link>
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setOuvert(false)}
          className="md:hidden p-1 rounded text-white/50 hover:text-white flex-shrink-0"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Liens principaux */}
        {visibleItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOuvert(false)}
              style={isActive ? activeLinkStyle : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'text-white font-medium'
                  : `text-white/70 ${hoverLinkClass} hover:text-white`
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}

        {/* Groupe Administration — visible admins uniquement */}
        {isAdmin && (
          <div>
            <button
              type="button"
              onClick={() => setAdminExpanded((v) => !v)}
              style={adminGroupActive && !adminExpanded ? activeLinkStyle : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                adminGroupActive
                  ? 'text-white font-medium'
                  : `text-white/70 ${hoverLinkClass} hover:text-white`
              }`}
            >
              <Shield size={18} />
              <span className="flex-1 text-left">Administration</span>
              {adminExpanded
                ? <ChevronDown size={14} className="opacity-60" />
                : <ChevronRight size={14} className="opacity-60" />}
            </button>

            {adminExpanded && (
              <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                {adminChildren.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOuvert(false)}
                      style={isActive ? activeLinkStyle : undefined}
                      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                        isActive
                          ? 'text-white font-medium'
                          : `text-white/60 ${hoverLinkClass} hover:text-white`
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          type="button"
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-2.5 w-full text-white/70 hover:text-white ${hoverLinkClass} rounded-lg text-sm transition-colors`}
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
        style={sidebarStyle}
        className="md:hidden fixed top-3 left-3 z-40 p-2 text-white rounded-lg shadow-lg"
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

      {/* Sidebar */}
      <aside
        style={sidebarStyle}
        className={`
          fixed inset-y-0 left-0 z-50 w-64 text-white flex flex-col
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
