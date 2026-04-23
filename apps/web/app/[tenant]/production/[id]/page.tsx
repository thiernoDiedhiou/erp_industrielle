'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { usePermissions } from '@/lib/permissions-context';
import {
  ArrowLeft, Factory, Play, Pause, CheckSquare, Calendar,
  AlertTriangle, Clock, Package, Beaker,
} from 'lucide-react';

// ── Constantes ────────────────────────────────────────────────────────────────
const STATUT_MAP: Record<string, { label: string; cls: string }> = {
  planifie: { label: 'Planifié', cls: 'bg-gray-100 text-gray-700 border-gray-200' },
  en_cours: { label: 'En cours', cls: 'bg-orange-100 text-orange-700 border-orange-200' },
  en_pause: { label: 'En pause', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  termine:  { label: 'Terminé',  cls: 'bg-green-100 text-green-700 border-green-200' },
  annule:   { label: 'Annulé',   cls: 'bg-red-100 text-red-700 border-red-200' },
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface ConsommationMP {
  id: string;
  quantiteConsommee: number;
  matierePremiere: { nom: string; unite: string; stockActuel: number };
}

interface OF {
  id: string;
  reference: string;
  statut: string;
  produitFini: string;
  quantitePrevue: number;
  quantiteProduite?: number;
  quantiteRebut?: number;
  dateDebutPrevue?: string;
  dateFinPrevue?: string;
  dateDebut?: string;
  dateFin?: string;
  notes?: string;
  createdAt: string;
  machine?: { nom: string; code: string; type?: string };
  commande?: { id: string; reference: string; client?: { nom: string } } | null;
  consommations: ConsommationMP[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

const fmtDateHeure = (d?: string | null) =>
  d
    ? new Date(d).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '—';

const estEnRetard = (of: OF) =>
  of.dateFinPrevue &&
  new Date(of.dateFinPrevue) < new Date() &&
  of.statut !== 'termine' &&
  of.statut !== 'annule';

// ── Page ──────────────────────────────────────────────────────────────────────
export default function OFDetailPage() {
  const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const ofId = params.id as string;
  const tenant = params.tenant as string;
  const [showTerminer, setShowTerminer] = useState(false);
  const [quantiteProduite, setQuantiteProduite] = useState('');
  const { peutEcrire } = usePermissions('production');

  const { data: of, isLoading } = useQuery<OF>({
    queryKey: ['of', ofId],
    queryFn: async () => (await api.get(`/production/ofs/${ofId}`)).data,
  });

  const changerStatutMutation = useMutation({
    mutationFn: ({ statut, quantiteProduite }: { statut: string; quantiteProduite?: number }) =>
      api.put(`/production/ofs/${ofId}/statut`, { statut, quantiteProduite }),
    onSuccess: (_, { statut }) => {
      qc.invalidateQueries({ queryKey: ['of', ofId] });
      qc.invalidateQueries({ queryKey: ['ofs'] });
      const labels: Record<string, string> = {
        en_cours: 'démarré', termine: 'terminé', en_pause: 'mis en pause', annule: 'annulé',
      };
      toast.success(`OF ${labels[statut] ?? 'mis à jour'}`);
      if (statut === 'termine') setShowTerminer(false);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erreur'),
  });

  const confirmerTerminer = () => {
    changerStatutMutation.mutate({
      statut: 'termine',
      quantiteProduite: quantiteProduite ? Number(quantiteProduite) : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
      </div>
    );
  }

  if (!of) {
    return <div className="text-center py-16 text-gray-400">OF introuvable</div>;
  }

  const retard = estEnRetard(of);
  const s = STATUT_MAP[of.statut] ?? { label: of.statut, cls: 'bg-gray-100 text-gray-600 border-gray-200' };
  const qPrevue = Number(of.quantitePrevue);
  const qProduite = of.quantiteProduite != null ? Number(of.quantiteProduite) : null;

  const tauxRendement =
    qProduite !== null && qPrevue > 0
      ? Math.round((qProduite / qPrevue) * 100)
      : null;

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label="Retour à la liste de production"
          onClick={() => router.push(`/${tenant}/production`)}
          className="mt-1 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="p-2.5 bg-orange-50 rounded-xl flex-shrink-0">
              <Factory size={22} className="text-orange-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-800">{of.reference}</h1>
                <span className={`text-xs px-2 py-1 rounded-full font-medium border ${s.cls}`}>
                  {s.label}
                </span>
                {retard && (
                  <span className="flex items-center gap-1 text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-full">
                    <AlertTriangle size={11} /> En retard
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{of.produitFini}</p>
            </div>
          </div>
        </div>

        {/* Boutons workflow */}
        {peutEcrire && (
          <div className="flex gap-2 flex-wrap justify-end">
            {of.statut === 'planifie' && (
              <button
                type="button"
                onClick={() => changerStatutMutation.mutate({ statut: 'en_cours' })}
                disabled={changerStatutMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50"
              >
                <Play size={14} /> Démarrer
              </button>
            )}
            {of.statut === 'en_cours' && (
              <>
                <button
                  type="button"
                  onClick={() => { setQuantiteProduite(String(qPrevue)); setShowTerminer(true); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                >
                  <CheckSquare size={14} /> Terminer
                </button>
                <button
                  type="button"
                  onClick={() => changerStatutMutation.mutate({ statut: 'en_pause' })}
                  disabled={changerStatutMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 disabled:opacity-50"
                >
                  <Pause size={14} /> Pause
                </button>
              </>
            )}
            {of.statut === 'en_pause' && (
              <button
                type="button"
                onClick={() => changerStatutMutation.mutate({ statut: 'en_cours' })}
                disabled={changerStatutMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50"
              >
                <Play size={14} /> Reprendre
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Package size={11} /> Qté prévue</p>
          <p className="text-xl font-bold text-gray-800">{qPrevue}</p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><CheckSquare size={11} /> Qté produite</p>
          <p className={`text-xl font-bold ${qProduite != null && qProduite > 0 ? 'text-green-700' : 'text-gray-300'}`}>
            {qProduite != null && qProduite > 0 ? qProduite : '—'}
          </p>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Clock size={11} /> Rendement</p>
          {tauxRendement !== null ? (
            <>
              <p className={`text-xl font-bold ${tauxRendement >= 90 ? 'text-green-700' : tauxRendement >= 70 ? 'text-orange-600' : 'text-red-600'}`}>
                {tauxRendement} %
              </p>
              <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${tauxRendement >= 90 ? 'bg-green-500' : tauxRendement >= 70 ? 'bg-orange-400' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(tauxRendement, 100)}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-xl font-bold text-gray-300">—</p>
          )}
        </div>
        <div className="bg-white border rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Beaker size={11} /> Consommations MP</p>
          <p className="text-xl font-bold text-gray-800">{of.consommations.length}</p>
        </div>
      </div>

      {/* ── Détails ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Infos générales */}
        <div className="bg-white border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-600 mb-4">Informations</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Produit fini</p>
              <p className="font-medium text-gray-800">{of.produitFini}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Machine</p>
              <p className="font-medium text-gray-800">{of.machine?.nom ?? '—'}</p>
              {of.machine?.code && <p className="text-xs text-gray-400">{of.machine.code}</p>}
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><Calendar size={10} /> Début prévu</p>
              <p className="font-medium text-gray-800">{fmtDate(of.dateDebutPrevue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><Calendar size={10} /> Fin prévue</p>
              <p className={`font-medium ${retard ? 'text-red-600' : 'text-gray-800'}`}>
                {fmtDate(of.dateFinPrevue)}{retard && ' ⚠'}
              </p>
            </div>
            {of.commande && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-0.5">Commande liée</p>
                <button
                  type="button"
                  onClick={() => router.push(`/${tenant}/commandes/${of.commande!.id}`)}
                  className="font-medium text-blue-700 hover:underline text-sm"
                >
                  {of.commande.reference}
                  {of.commande.client && (
                    <span className="text-gray-500 font-normal"> — {of.commande.client.nom}</span>
                  )}
                </button>
              </div>
            )}
            {of.notes && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-0.5">Notes</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{of.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Chronologie */}
        <div className="bg-white border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-600 mb-4">Chronologie</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Créé le</p>
                <p className="text-sm font-medium text-gray-700">{fmtDateHeure(of.createdAt)}</p>
              </div>
            </div>
            {of.dateDebut && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Démarré le</p>
                  <p className="text-sm font-medium text-gray-700">{fmtDateHeure(of.dateDebut)}</p>
                </div>
              </div>
            )}
            {of.dateFinPrevue && of.statut !== 'termine' && (
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${retard ? 'bg-red-500' : 'bg-gray-300'}`} />
                <div>
                  <p className={`text-xs ${retard ? 'text-red-500' : 'text-gray-400'}`}>Fin prévue</p>
                  <p className={`text-sm font-medium ${retard ? 'text-red-600' : 'text-gray-700'}`}>
                    {fmtDateHeure(of.dateFinPrevue)}
                  </p>
                </div>
              </div>
            )}
            {of.statut === 'termine' && of.dateFin && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Terminé le</p>
                  <p className="text-sm font-medium text-green-700">{fmtDateHeure(of.dateFin)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Consommations MP ── */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center gap-2">
          <Beaker size={16} className="text-gray-500" />
          <h2 className="text-sm font-semibold text-gray-700">Consommations matières premières</h2>
        </div>
        {of.consommations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Matière première</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500">Qté consommée</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Unité</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500">Stock restant</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {of.consommations.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-medium text-gray-800">{c.matierePremiere.nom}</td>
                    <td className="px-5 py-3 text-sm text-right font-medium text-gray-700">
                      {Number(c.quantiteConsommee).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{c.matierePremiere.unite}</td>
                    <td className="px-5 py-3 text-sm text-right text-gray-500">
                      {Number(c.matierePremiere.stockActuel).toLocaleString('fr-FR')} {c.matierePremiere.unite}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-gray-400 text-sm">Aucune consommation enregistrée</p>
        )}
      </div>

      {/* ── Modal clôture ── */}
      {showTerminer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckSquare size={20} className="text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">Clôturer l'OF</h2>
                <p className="text-xs text-gray-500">{of.reference} — {of.produitFini}</p>
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="qte-produite" className="text-sm text-gray-600">
                Quantité réellement produite
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  id="qte-produite"
                  type="number"
                  min="0"
                  value={quantiteProduite}
                  onChange={(e) => setQuantiteProduite(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <span className="text-xs text-gray-400 whitespace-nowrap">Prévu : {qPrevue}</span>
              </div>
              {quantiteProduite && Number(quantiteProduite) < qPrevue && (
                <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                  <AlertTriangle size={11} />
                  {Math.round((Number(quantiteProduite) / qPrevue) * 100)} % de la prévision
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={confirmerTerminer}
                disabled={changerStatutMutation.isPending}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {changerStatutMutation.isPending ? 'Clôture...' : 'Confirmer'}
              </button>
              <button
                type="button"
                onClick={() => setShowTerminer(false)}
                className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
