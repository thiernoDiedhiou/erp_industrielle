'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser, logout } from '@/lib/auth';
import { ChevronDown, LogOut, User, Settings, Menu } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  direction: 'Direction',
  commercial: 'Commercial',
  production: 'Production',
  magasinier: 'Magasinier',
  comptable: 'Comptable',
};

interface HeaderProps {
  user: AuthUser;
  tenantSlug: string;
  onMenuClick: () => void;
}

export function Header({ user, tenantSlug, onMenuClick }: HeaderProps) {
  const [ouvert, setOuvert] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOuvert(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);


  const initiale = user.nom.charAt(0).toUpperCase();

  return (
    <header className="bg-white border-b px-4 md:px-6 py-3 flex items-center justify-between gap-3">
      {/* Hamburger — mobile uniquement */}
      <button
        type="button"
        aria-label="Ouvrir le menu"
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
      >
        <Menu size={20} />
      </button>

      {/* Nom du tenant — caché sur mobile (visible dans la sidebar) */}
      <div className="hidden md:block">
        <h2 className="font-semibold text-gray-800">{user.tenant.nom}</h2>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions droite */}
      <div className="flex items-center gap-2 md:gap-4">
        <NotificationBell />

        {/* Profil cliquable */}
        <div className="relative" ref={ref}>
          <button
            type="button"
            aria-label="Menu profil"
            onClick={() => setOuvert((v) => !v)}
            className="flex items-center gap-2 text-sm rounded-lg px-2 py-1.5 hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-semibold text-xs flex-shrink-0">
              {initiale}
            </div>
            <div className="hidden md:block text-left">
              <p className="font-medium text-gray-800 leading-none">{user.nom}</p>
              <p className="text-gray-400 text-xs mt-0.5">{ROLE_LABELS[user.role] || user.role}</p>
            </div>
            <ChevronDown
              size={14}
              className={`hidden md:block text-gray-400 transition-transform ${ouvert ? 'rotate-180' : ''}`}
            />
          </button>

          {ouvert && (
            <div className="absolute right-0 top-12 w-52 bg-white rounded-xl shadow-lg border z-50 overflow-hidden">
              {/* En-tête dropdown */}
              <div className="px-4 py-3 border-b bg-gray-50">
                <p className="text-sm font-semibold text-gray-800">{user.nom}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>

              {/* Actions */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => { setOuvert(false); router.push(`/${tenantSlug}/profil`); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User size={15} className="text-gray-400" />
                  Mon profil
                </button>

                {user.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => { setOuvert(false); router.push(`/${tenantSlug}/admin`); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings size={15} className="text-gray-400" />
                    Administration
                  </button>
                )}
              </div>

              <div className="border-t py-1">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
