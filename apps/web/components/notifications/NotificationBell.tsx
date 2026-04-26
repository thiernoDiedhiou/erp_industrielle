'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Bell, X, Package, ShoppingCart, Factory, CreditCard, Info } from 'lucide-react';
import { getToken } from '@/lib/auth';
import { api } from '@/lib/api';

interface Notif {
  id: string;
  type: string;
  titre: string;
  message: string;
  createdAt: string;
  lue: boolean;
  data?: Record<string, unknown>;
}

const ICONS: Record<string, React.ReactNode> = {
  alerte_stock:    <Package      size={14} className="text-red-500" />,
  statut_commande: <ShoppingCart size={14} className="text-blue-500" />,
  statut_of:       <Factory      size={14} className="text-orange-500" />,
  paiement_recu:   <CreditCard   size={14} className="text-green-500" />,
  info:            <Info         size={14} className="text-gray-500" />,
};

const COLORS: Record<string, string> = {
  alerte_stock:    'border-l-red-400',
  statut_commande: 'border-l-blue-400',
  statut_of:       'border-l-orange-400',
  paiement_recu:   'border-l-green-400',
  info:            'border-l-gray-300',
};

function formaterHeure(iso: string): string {
  const date = new Date(iso);
  const now  = new Date();
  const estAujourdHui =
    date.getDate()     === now.getDate()     &&
    date.getMonth()    === now.getMonth()    &&
    date.getFullYear() === now.getFullYear();

  if (estAujourdHui) {
    return date.toLocaleTimeString('fr-SN', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('fr-SN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function buildUrl(tenant: string, type: string, data: Record<string, unknown> | undefined): string | null {
  const entityId = data?.entityId as string | undefined;
  switch (type) {
    case 'statut_commande': return `/${tenant}/commandes${entityId ? `/${entityId}` : ''}`;
    case 'statut_of':       return `/${tenant}/production${entityId ? `/${entityId}` : ''}`;
    case 'paiement_recu':   return `/${tenant}/facturation${entityId ? `/${entityId}` : ''}`;
    case 'alerte_stock':    return `/${tenant}/matieres-premieres`;
    default: return null;
  }
}

export function NotificationBell() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [ouvert, setOuvert] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const router = useRouter();
  const tenant = params.tenant as string;

  // Chargement de l'historique persisté au montage
  useEffect(() => {
    api.get('/notifications')
      .then((res) => setNotifs(res.data as Notif[]))
      .catch(() => {});
  }, []);

  // Connexion SSE pour les nouvelles notifications en temps réel
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
    const es = new EventSource(`${apiUrl}/notifications/stream?token=${token}`);

    es.onmessage = (e) => {
      const data = JSON.parse(e.data as string) as Notif;
      setNotifs((prev) => {
        // Éviter les doublons (la notif est déjà en BDD, mais l'historique n'est chargé qu'au montage)
        if (prev.some((n) => n.id === data.id)) return prev;
        return [data, ...prev].slice(0, 50);
      });
    };

    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  // Fermer le panel en cliquant à l'extérieur
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

  const ouvrirPanel = () => {
    if (!ouvert && nonLues > 0) {
      // Marquer comme lues en BDD et mettre à jour l'état local
      api.patch('/notifications/lire-tout').catch(() => {});
      setNotifs((prev) => prev.map((n) => ({ ...n, lue: true })));
    }
    setOuvert((v) => !v);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={ouvrirPanel}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
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
            <button type="button" aria-label="Fermer" onClick={() => setOuvert(false)}>
              <X size={14} className="text-gray-400 hover:text-gray-600" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y">
            {notifs.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">Aucune notification</p>
            ) : (
              notifs.map((n) => {
                const url = buildUrl(tenant, n.type, n.data);
                return (
                  <div
                    key={n.id}
                    tabIndex={url ? 0 : undefined}
                    onClick={() => { if (url) { setOuvert(false); router.push(url); } }}
                    onKeyDown={(e) => { if (url && (e.key === 'Enter' || e.key === ' ')) { setOuvert(false); router.push(url); } }}
                    className={`px-4 py-3 border-l-4 ${COLORS[n.type] ?? 'border-l-gray-200'} ${n.lue ? 'bg-white' : 'bg-blue-50/40'} ${url ? 'cursor-pointer' : ''} hover:bg-gray-50 transition-colors`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 flex-shrink-0">{ICONS[n.type] ?? ICONS['info']}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-gray-800 truncate">{n.titre}</p>
                          {!n.lue && (
                            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-gray-300 mt-1">{formaterHeure(n.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {notifs.length > 0 && (
            <div className="px-4 py-2 border-t bg-gray-50">
              <button
                type="button"
                onClick={() => setNotifs([])}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Masquer tout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
