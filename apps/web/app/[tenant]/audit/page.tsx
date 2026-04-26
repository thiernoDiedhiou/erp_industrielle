'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Shield, ChevronLeft, ChevronRight,
  Plus, Pencil, Trash2, LogIn, FileText, X, RefreshCw, ArrowRight,
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

/* ── Styles des badges d'action ── */
const ACTION_STYLES: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  CREATE: { label: 'Création',     className: 'bg-green-100 text-green-800',   icon: <Plus size={12} /> },
  UPDATE: { label: 'Modification', className: 'bg-blue-100 text-blue-800',     icon: <Pencil size={12} /> },
  DELETE: { label: 'Suppression',  className: 'bg-red-100 text-red-800',       icon: <Trash2 size={12} /> },
  STATUT: { label: 'Statut',       className: 'bg-purple-100 text-purple-800', icon: <RefreshCw size={12} /> },
  LOGIN:  { label: 'Connexion',    className: 'bg-gray-100 text-gray-700',     icon: <LogIn size={12} /> },
  EXPORT: { label: 'Export',       className: 'bg-yellow-100 text-yellow-800', icon: <FileText size={12} /> },
};

/* ── Traductions des entités ── */
const ENTITES_LABELS: Record<string, string> = {
  Client:          'Client',
  Commande:        'Commande',
  Facture:         'Facture',
  Fournisseur:     'Fournisseur',
  Machine:         'Machine',
  MatierePremiere: 'Matière première',
  User:            'Utilisateur',
  Groupe:          'Groupe',
  Bom:             'Nomenclature',
  OrdreFabrication:'Ordre de fabrication',
};

/* ── Traductions des champs ── */
const CHAMPS_LISIBLES: Record<string, string> = {
  nom:              'Nom',
  prenom:           'Prénom',
  email:            'Email',
  telephone:        'Téléphone',
  adresse:          'Adresse',
  ville:            'Ville',
  pays:             'Pays',
  actif:            'Actif',
  statut:           'Statut',
  reference:        'Référence',
  contact:          'Contact',
  ninea:            'NINEA',
  role:             'Rôle',
  totalHT:          'Total HT',
  totalTTC:         'Total TTC',
  tva:              'TVA',
  notes:            'Notes',
  version:          'Version',
  quantite:         'Quantité',
  prix:             'Prix',
  prixAchat:        "Prix d'achat",
  stockActuel:      'Stock actuel',
  stockMinimal:     'Stock minimal',
  dateEcheance:     "Date d'échéance",
  delaiLivraison:   'Délai de livraison',
  unite:            'Unité',
  description:      'Description',
  montant:          'Montant',
  mode:             'Mode',
  plan:             'Plan',
  couleurPrimaire:  'Couleur principale',
  couleurSecondaire:'Couleur secondaire',
  noteEvaluation:   'Note fournisseur',
  typeClient:       'Type de client',
  secteur:          'Secteur',
};

/* ── Champs purement techniques à masquer ── */
const CHAMPS_EXCLUS = new Set([
  'id', 'tenantId', 'createdAt', 'updatedAt', 'deletedAt',
  'refreshTokenHash', 'passwordHash', 'motDePasse', 'password',
]);

/* ── Helpers ── */
const labelChamp = (k: string) => CHAMPS_LISIBLES[k] ?? k;

const formaterValeur = (val: unknown): string => {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'Oui' : 'Non';
  if (typeof val === 'number') return val.toLocaleString('fr-FR');
  if (typeof val === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T/.test(val)) return new Date(val).toLocaleDateString('fr-SN');
    return val;
  }
  return JSON.stringify(val);
};

const formaterIP = (ip?: string): string => {
  if (!ip || ip === '::1' || ip === '127.0.0.1') return 'Connexion locale';
  if (ip.startsWith('::ffff:')) return ip.slice(7);
  return ip;
};

/* Nom lisible extrait du payload (apres ?? avant) */
const nomEntite = (log: AuditLog): string | null => {
  const d = (log.apres ?? log.avant) as Record<string, unknown> | undefined;
  if (!d) return null;
  return (d.nom ?? d.email ?? d.reference ?? null) as string | null;
};

/* Calcul du diff entre avant et apres */
type DiffRow = { key: string; avant: unknown; apres: unknown };
const construireDiff = (
  avant?: Record<string, unknown>,
  apres?: Record<string, unknown>,
): DiffRow[] => {
  const allKeys = Array.from(new Set([...Object.keys(avant ?? {}), ...Object.keys(apres ?? {})]));
  const rows: DiffRow[] = [];
  for (const key of allKeys) {
    if (CHAMPS_EXCLUS.has(key)) continue;
    const va = avant?.[key];
    const vp = apres?.[key];
    if (avant && apres) {
      // UPDATE — uniquement les champs qui ont changé
      if (JSON.stringify(va) !== JSON.stringify(vp)) rows.push({ key, avant: va, apres: vp });
    } else {
      // CREATE ou DELETE — tous les champs non nuls
      const val = apres ? vp : va;
      if (val !== null && val !== undefined) rows.push({ key, avant: apres ? undefined : va, apres: apres ? vp : undefined });
    }
  }
  return rows;
};

const ENTITES = ['', 'Client', 'Commande', 'Facture', 'Fournisseur', 'Machine', 'MatierePremiere', 'User', 'Groupe', 'Bom'];
const ACTIONS = ['', 'CREATE', 'UPDATE', 'DELETE', 'STATUT', 'LOGIN', 'EXPORT'];

export default function AuditPage() {
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

  const formaterDate = (iso: string) =>
    new Date(iso).toLocaleString('fr-SN', { dateStyle: 'short', timeStyle: 'medium' });

  const badgeAction = (action: string) => {
    const s = ACTION_STYLES[action] ?? { label: action, className: 'bg-gray-100 text-gray-600', icon: null };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.className}`}>
        {s.icon}{s.label}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Shield className="text-indigo-600 flex-shrink-0" size={22} />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Journal d'audit</h1>
            <p className="text-sm text-gray-500">{total} entrée{total > 1 ? 's' : ''} enregistrée{total > 1 ? 's' : ''}</p>
          </div>
        </div>
        <button type="button" onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 flex-shrink-0">
          <RefreshCw size={14} /> <span className="hidden sm:inline">Actualiser</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        <select
          aria-label="Filtrer par action"
          value={filtreAction}
          onChange={(e) => { setFiltreAction(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
          <option value="">Toutes les actions</option>
          {ACTIONS.filter(Boolean).map((a) => (
            <option key={a} value={a}>{ACTION_STYLES[a]?.label ?? a}</option>
          ))}
        </select>

        <select
          aria-label="Filtrer par entité"
          value={filtreEntite}
          onChange={(e) => { setFiltreEntite(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
          <option value="">Toutes les entités</option>
          {ENTITES.filter(Boolean).map((e) => (
            <option key={e} value={e}>{ENTITES_LABELS[e] ?? e}</option>
          ))}
        </select>

        {(filtreAction || filtreEntite) && (
          <button type="button"
            onClick={() => { setFiltreAction(''); setFiltreEntite(''); setPage(1); }}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 border rounded-lg hover:bg-gray-50">
            <X size={14} /> Effacer
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border shadow-sm p-12 text-center text-gray-400">Chargement...</div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-xl border shadow-sm p-12 text-center text-gray-400">
          <Shield size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucune entrée dans le journal</p>
        </div>
      ) : (
        <>
          {/* ── Vue CARTES — mobile ── */}
          <div className="md:hidden space-y-2">
            {logs.map((log) => {
              const nom = nomEntite(log);
              const entiteLabel = ENTITES_LABELS[log.entite] ?? log.entite;
              return (
                <div key={log.id} className="bg-white rounded-xl border shadow-sm p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {badgeAction(log.action)}
                    <span className="text-xs text-gray-400">{formaterDate(log.createdAt)}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="font-semibold text-gray-800 text-sm">{entiteLabel}</span>
                    {nom && <span className="text-sm text-gray-500">— {nom}</span>}
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{log.userEmail ?? '—'}</p>
                  {(log.avant || log.apres) && (
                    <button type="button" onClick={() => setDetail(log)}
                      className="text-xs text-indigo-600 font-medium hover:underline">
                      Voir le détail →
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Vue TABLE — desktop ── */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Utilisateur</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Entité</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">IP</th>
                    <th scope="col" className="px-4 py-3 sr-only">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => {
                    const nom = nomEntite(log);
                    const entiteLabel = ENTITES_LABELS[log.entite] ?? log.entite;
                    return (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                          {formaterDate(log.createdAt)}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">{log.userEmail ?? '—'}</td>
                        <td className="px-4 py-3">{badgeAction(log.action)}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-800">{entiteLabel}</span>
                          {nom && <span className="ml-1.5 text-gray-500 text-xs">{nom}</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{formaterIP(log.ip)}</td>
                        <td className="px-4 py-3">
                          {(log.avant || log.apres) && (
                            <button type="button" onClick={() => setDetail(log)}
                              className="text-xs text-indigo-600 hover:underline font-medium">
                              Détail
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Page {page} / {totalPages} — {total} entrées
          </span>
          <div className="flex gap-2">
            <button type="button"
              aria-label="Page précédente"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50">
              <ChevronLeft size={16} />
            </button>
            <button type="button"
              aria-label="Page suivante"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border rounded-lg disabled:opacity-40 hover:bg-gray-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Modal de détail ── */}
      {detail && (() => {
        const diff = construireDiff(detail.avant, detail.apres);
        const isCreate = !detail.avant && !!detail.apres;
        const isDelete = !!detail.avant && !detail.apres;
        const entiteLabel = ENTITES_LABELS[detail.entite] ?? detail.entite;
        const nom = nomEntite(detail);

        return (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4"
            onClick={() => setDetail(null)}
          >
            <div
              className="bg-white w-full sm:rounded-2xl sm:shadow-xl sm:max-w-xl max-h-[92vh] flex flex-col rounded-t-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* En-tête modal */}
              <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  {badgeAction(detail.action)}
                  <div className="min-w-0">
                    <span className="font-semibold text-gray-900">{entiteLabel}</span>
                    {nom && <span className="ml-1.5 text-gray-500 text-sm truncate">{nom}</span>}
                  </div>
                </div>
                <button type="button" aria-label="Fermer" onClick={() => setDetail(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg flex-shrink-0 ml-2">
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Corps scrollable */}
              <div className="overflow-y-auto flex-1 p-5 space-y-5">

                {/* Métadonnées lisibles */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Utilisateur</p>
                    <p className="font-medium text-gray-800 break-all">{detail.userEmail ?? '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Date et heure</p>
                    <p className="font-medium text-gray-800">{formaterDate(detail.createdAt)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Adresse IP</p>
                    <p className="font-medium text-gray-800">{formaterIP(detail.ip)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Module</p>
                    <p className="font-medium text-gray-800">{entiteLabel}</p>
                  </div>
                </div>

                {/* Diff lisible */}
                {diff.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      {isCreate ? 'Données créées' : isDelete ? 'Données supprimées' : 'Champs modifiés'}
                    </p>
                    <div className="border rounded-xl overflow-hidden divide-y">
                      {/* En-tête colonnes pour UPDATE */}
                      {!isCreate && !isDelete && (
                        <div className="grid grid-cols-[1fr_1fr_1fr] bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-400">
                          <span>Champ</span>
                          <span className="text-red-500">Avant</span>
                          <span className="text-green-600">Après</span>
                        </div>
                      )}
                      {diff.map(({ key, avant: va, apres: vp }) => (
                        <div key={key}
                          className={`px-3 py-2.5 text-sm ${!isCreate && !isDelete ? 'grid grid-cols-[1fr_1fr_1fr] gap-2 items-center' : 'flex items-center justify-between gap-3'}`}>
                          {/* Nom du champ */}
                          <span className="font-medium text-gray-700">{labelChamp(key)}</span>

                          {/* CREATE ou DELETE : valeur seule */}
                          {(isCreate || isDelete) && (
                            <span className={isCreate ? 'text-green-700' : 'text-red-600'}>
                              {formaterValeur(isCreate ? vp : va)}
                            </span>
                          )}

                          {/* UPDATE : avant → après */}
                          {!isCreate && !isDelete && (
                            <>
                              <span className="text-red-500 line-through text-xs">
                                {formaterValeur(va)}
                              </span>
                              <span className="text-green-700 font-medium text-xs">
                                {formaterValeur(vp)}
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {diff.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">Aucun détail disponible.</p>
                )}
              </div>

              {/* Pied */}
              <div className="px-5 py-3 border-t flex-shrink-0">
                <button type="button" onClick={() => setDetail(null)}
                  className="w-full border py-2 rounded-lg text-sm hover:bg-gray-50 font-medium text-gray-600">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
