'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, Package, ShoppingCart, Factory, CreditCard, Info } from 'lucide-react';
import { getToken } from '@/lib/auth';

interface Notif {
  id: string;
  type: string;
  titre: string;
  message: string;
  createdAt: string;
  lue: boolean;
}

const ICONS: Record<string, React.ReactNode> = {
  alerte_stock: <Package size={14} className="text-red-500" />,
  statut_commande: <ShoppingCart size={14} className="text-blue-500" />,
  statut_of: <Factory size={14} className="text-orange-500" />,
  paiement_recu: <CreditCard size={14} className="text-green-500" />,
  info: <Info size={14} className="text-gray-500" />,
};

const COLORS: Record<string, string> = {
  alerte_stock: 'border-l-red-400',
  statut_commande: 'border-l-blue-400',
  statut_of: 'border-l-orange-400',
  paiement_recu: 'border-l-green-400',
  info: 'border-l-gray-300',
};

export function NotificationBell() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [ouvert, setOuvert] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
    const es = new EventSource(`${apiUrl}/notifications/stream?token=${token}`);

    es.onmessage = (e) => {
      const data = JSON.parse(e.data as string) as { type: string; titre: string; message: string; createdAt: string };
      const notif: Notif = {
        id: crypto.randomUUID(),
        type: data.type,
        titre: data.titre,
        message: data.message,
        createdAt: data.createdAt,
        lue: false,
      };
      setNotifs((prev) => [notif, ...prev].slice(0, 20));
    };

    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOuvert(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const nonLues = notifs.filter((n) => !n.lue).length;

  const marquerToutesLues = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, lue: true })));

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => { setOuvert(!ouvert); if (!ouvert) marquerToutesLues(); }}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell size={20} className="text-gray-600" />
        {nonLues > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      {ouvert && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-xl shadow-lg border z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <span className="text-sm font-semibold text-gray-700">Notifications</span>
            <button aria-label="Fermer" onClick={() => setOuvert(false)}>
              <X size={14} className="text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y">
            {notifs.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">Aucune notification</p>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-l-4 ${COLORS[n.type] ?? 'border-l-gray-200'} hover:bg-gray-50`}
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">{ICONS[n.type] ?? ICONS['info']}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800">{n.titre}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-gray-300 mt-1">
                        {new Date(n.createdAt).toLocaleTimeString('fr-SN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifs.length > 0 && (
            <div className="px-4 py-2 border-t bg-gray-50">
              <button
                onClick={() => setNotifs([])}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Tout effacer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
