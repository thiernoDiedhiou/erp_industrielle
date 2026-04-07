'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Shield, Search, ChevronLeft, ChevronRight,
  Plus, Pencil, Trash2, LogIn, FileText, X, RefreshCw,
} from 'lucide-react';

interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  entite: string;
  entiteId?: string;
  avant?: Record<string, unknown>;
  apres?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

interface PageResponse {
  items: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
}

const ACTION_STYLES: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  CREATE: { label: 'Création',     className: 'bg-green-100 text-green-800',  icon: <Plus size={12} /> },
  UPDATE: { label: 'Modification', className: 'bg-blue-100 text-blue-800',    icon: <Pencil size={12} /> },
  DELETE: { label: 'Suppression',  className: 'bg-red-100 text-red-800',      icon: <Trash2 size={12} /> },
  STATUT: { label: 'Statut',       className: 'bg-purple-100 text-purple-800', icon: <RefreshCw size={12} /> },
  LOGIN:  { label: 'Connexion',    className: 'bg-gray-100 text-gray-700',    icon: <LogIn size={12} /> },
  EXPORT: { label: 'Export',       className: 'bg-yellow-100 text-yellow-800', icon: <FileText size={12} /> },
};

const ENTITES = ['', 'Client', 'Commande', 'Facture', 'Fournisseur', 'Machine', 'MatierePremiere', 'User'];
const ACTIONS = ['', 'CREATE', 'UPDATE', 'DELETE', 'STATUT', 'LOGIN', 'EXPORT'];

export default function AuditPage() {
  const { tenant } = useParams<{ tenant: string }>();
  const [page, setPage] = useState(1);
  const [filtreAction, setFiltreAction] = useState('');
  const [filtreEntite, setFiltreEntite] = useState('');
  const [detail, setDetail] = useState<AuditLog | null>(null);

  const { data, isLoading, refetch } = useQuery<PageResponse>({
    queryKey: ['audit', page, filtreAction, filtreEntite],
    queryFn: async () => (await api.get('/audit', {
      params: { page, limite: 25, action: filtreAction || undefined, entite: filtreEntite || undefined },
    })).data,
  });

  const logs = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const formaterDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('fr-SN', { dateStyle: 'short', timeStyle: 'medium' });
  };

  const badgeAction = (action: string) => {
    const s = ACTION_STYLES[action] ?? { label: action, className: 'bg-gray-100 text-gray-600', icon: null };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
        {s.icon}{s.label}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="text-indigo-600" size={24} />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Journal d'audit</h1>
            <p className="text-sm text-gray-500">{total} entrée{total > 1 ? 's' : ''} enregistrée{total > 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filtreAction}
          onChange={(e) => { setFiltreAction(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Toutes les actions</option>
          {ACTIONS.filter(Boolean).map((a) => (
            <option key={a} value={a}>{ACTION_STYLES[a]?.label ?? a}</option>
          ))}
        </select>

        <select
          value={filtreEntite}
          onChange={(e) => { setFiltreEntite(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Toutes les entités</option>
          {ENTITES.filter(Boolean).map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>

        {(filtreAction || filtreEntite) && (
          <button
            onClick={() => { setFiltreAction(''); setFiltreEntite(''); setPage(1); }}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 border rounded-lg hover:bg-gray-50"
          >
            <X size={14} /> Effacer filtres
          </button>
        )}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">Chargement...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Shield size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucune entrée dans le journal</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Utilisateur</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Entité</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">IP</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap font-mono text-xs">
                    {formaterDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{log.userEmail ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3">{badgeAction(log.action)}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-800">{log.entite}</span>
                    {log.entiteId && (
                      <span className="ml-2 text-xs text-gray-400 font-mono">
                        {log.entiteId.slice(0, 8)}…
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{log.ip ?? '—'}</td>
                  <td className="px-4 py-3">
                    {(log.avant || log.apres) && (
                      <button
                        onClick={() => setDetail(log)}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Détail
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Page {page} sur {totalPages} — {total} entrées
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Panneau de détail (avant / après) */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                {badgeAction(detail.action)}
                <span className="font-semibold text-gray-900">{detail.entite}</span>
              </div>
              <button onClick={() => setDetail(null)} className="p-1 hover:bg-gray-100 rounded">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Métadonnées */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Utilisateur</span>
                  <p className="font-medium">{detail.userEmail ?? '—'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Date</span>
                  <p className="font-medium">{formaterDate(detail.createdAt)}</p>
                </div>
                <div>
                  <span className="text-gray-500">IP</span>
                  <p className="font-mono text-sm">{detail.ip ?? '—'}</p>
                </div>
                <div>
                  <span className="text-gray-500">ID entité</span>
                  <p className="font-mono text-xs break-all">{detail.entiteId ?? '—'}</p>
                </div>
              </div>

              {/* Données avant / après */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {detail.avant && (
                  <div>
                    <p className="text-xs font-semibold text-red-600 uppercase mb-1">Avant</p>
                    <pre className="bg-red-50 border border-red-100 rounded-lg p-3 text-xs overflow-auto max-h-48">
                      {JSON.stringify(detail.avant, null, 2)}
                    </pre>
                  </div>
                )}
                {detail.apres && (
                  <div>
                    <p className="text-xs font-semibold text-green-600 uppercase mb-1">Après</p>
                    <pre className="bg-green-50 border border-green-100 rounded-lg p-3 text-xs overflow-auto max-h-48">
                      {JSON.stringify(detail.apres, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
