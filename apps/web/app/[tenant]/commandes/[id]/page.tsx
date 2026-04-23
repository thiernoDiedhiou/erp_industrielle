'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { usePermissions } from '@/lib/permissions-context';
import {
  ArrowLeft, FileText, Factory, CheckCircle, Clock, Circle,
  User, Calendar, Package, Download, AlertTriangle,
} from 'lucide-react';

// ── Workflow ────────────────────────────────────────────────────────────────
const STATUTS_ORDRE = ['brouillon', 'confirmee', 'en_production', 'prete', 'livree', 'facturee'];

const STATUTS_LABELS: Record<string, string> = {
  brouillon:     'Brouillon',
  confirmee:     'Confirmée',
  en_production: 'En production',
  prete:         'Prête',
  livree:        'Livrée',
  facturee:      'Facturée',
  annulee:       'Annulée',
};

const STATUTS_COULEURS: Record<string, string> = {
  brouillon:     'bg-gray-100 text-gray-700 border-gray-200',
  confirmee:     'bg-blue-100 text-blue-700 border-blue-200',
  en_production: 'bg-orange-100 text-orange-700 border-orange-200',
  prete:         'bg-yellow-100 text-yellow-800 border-yellow-200',
  livree:        'bg-green-100 text-green-700 border-green-200',
  facturee:      'bg-purple-100 text-purple-700 border-purple-200',
  annulee:       'bg-red-100 text-red-700 border-red-200',
};

const TRANSITIONS: Record<string, { label: string; statut: string; color: string }[]> = {
  brouillon:     [{ label: 'Confirmer la commande',  statut: 'confirmee',     color: 'bg-blue-700 hover:bg-blue-800 text-white' }],
  confirmee:     [
    { label: 'Lancer en production', statut: 'en_production', color: 'bg-orange-600 hover:bg-orange-700 text-white' },
    { label: 'Livrer directement',   statut: 'livree',        color: 'bg-green-600 hover:bg-green-700 text-white' },
  ],
  en_production: [{ label: 'Marquer prête',           statut: 'prete',         color: 'bg-yellow-500 hover:bg-yellow-600 text-white' }],
  prete:         [{ label: 'Valider la livraison',    statut: 'livree',        color: 'bg-green-600 hover:bg-green-700 text-white' }],
};

const HISTORIQUE_ICONES: Record<string, React.ReactNode> = {
  brouillon:     <Circle      size={14} className="text-gray-400" />,
  confirmee:     <CheckCircle size={14} className="text-blue-500" />,
  en_production: <Factory     size={14} className="text-orange-500" />,
  prete:         <Package     size={14} className="text-yellow-600" />,
  livree:        <CheckCircle size={14} className="text-green-600" />,
  facturee:      <FileText    size={14} className="text-purple-600" />,
  annulee:       <AlertTriangle size={14} className="text-red-500" />,
};

// ── Types ───────────────────────────────────────────────────────────────────
interface LigneCommande {
  id: string;
  produit?: { nom: string; reference?: string };
  description?: string;
  quantite: number;
  prixUnitaire: number;
  montant: number;
}

interface HistoriqueEntry {
  id: string;
  ancienStatut?: string;
  nouveauStatut: string;
  commentaire?: string;
  createdAt: string;
  userName: string;
}

interface Commande {
  id: string;
  reference: string;
  statut: string;
  totalHT: number;
  tva: number;
  totalTTC: number;
  dateLivraison?: string;
  notes?: string;
  createdAt: string;
  client: { nom: string; email?: string; telephone?: string; ville?: string };
  lignes: LigneCommande[];
  historique: HistoriqueEntry[];
  factures?: { id: string; reference: string; statut: string; totalTTC: number }[];
  ordresFabrication?: { id: string; reference: string; statut: string }[];
}

// ── Composant stepper ────────────────────────────────────────────────────────
function WorkflowStepper({ statut }: { statut: string }) {
  if (statut === 'annulee') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center gap-2 text-sm text-red-700">
        <AlertTriangle size={16} /> Commande annulée
      </div>
    );
  }

  const indexActuel = STATUTS_ORDRE.indexOf(statut);

  return (
    <div className="bg-white border rounded-xl px-5 py-4">
      <div className="flex items-center">
        {STATUTS_ORDRE.map((s, i) => {
          const passe   = i < indexActuel;
          const actuel  = i === indexActuel;
          return (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  passe  ? 'bg-blue-700 border-blue-700 text-white' :
                  actuel ? 'bg-white border-blue-700 text-blue-700 ring-4 ring-blue-100' :
                           'bg-white border-gray-200 text-gray-300'
                }`}>
                  {passe ? <CheckCircle size={16} className="text-white" /> : i + 1}
                </div>
                <span className={`mt-1.5 text-xs whitespace-nowrap hidden sm:block ${
                  passe  ? 'text-blue-700 font-medium' :
                  actuel ? 'text-blue-700 font-bold' :
                           'text-gray-400'
                }`}>
                  {STATUTS_LABELS[s]}
                </span>
              </div>
              {i < STATUTS_ORDRE.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 ${passe ? 'bg-blue-700' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function CommandeDetailPage() {
  const params      = useParams();
  const router      = useRouter();
  const queryClient = useQueryClient();
  const toast       = useToast();
  const id          = params.id as string;
  const tenant      = params.tenant as string;
  const { peutEcrire } = usePermissions('commandes');

  const { data: commande, isLoading } = useQuery<Commande>({
    queryKey: ['commande', id],
    queryFn: async () => {
      const { data } = await api.get(`/commandes/${id}`);
      return data;
    },
  });

  const changerStatutMutation = useMutation({
    mutationFn: (statut: string) => api.put(`/commandes/${id}/statut`, { statut }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commande', id] });
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
      toast.success('Statut mis à jour');
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message || 'Transition non autorisée'),
  });

  const facturationMutation = useMutation({
    mutationFn: () => api.post(`/facturation/factures/depuis-commande/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commande', id] });
      queryClient.invalidateQueries({ queryKey: ['facturation-stats'] });
      toast.success('Facture créée — voir dans Facturation');
    },
    onError: () => toast.error('Erreur lors de la création de la facture'),
  });

  const telechargerPdf = async () => {
    if (!commande) return;
    const facture = commande.factures?.[0];
    if (!facture) { toast.warning('Aucune facture liée à cette commande'); return; }
    try {
      const response = await api.get(`/facturation/factures/${facture.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `${facture.reference}.pdf`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Erreur téléchargement PDF'); }
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(v) + ' FCFA';

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-SN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const fmtDateTime = (d: string) =>
    new Date(d).toLocaleString('fr-SN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700" />
      </div>
    );
  }
  if (!commande) return null;

  const transitions = TRANSITIONS[commande.statut] ?? [];
  const peutFacturer = peutEcrire && commande.statut === 'livree' && !commande.factures?.length;
  const aFacture     = (commande.factures?.length ?? 0) > 0;
  const totalHT      = Number(commande.totalHT ?? 0);
  const tva          = Number(commande.tva ?? 0);
  const totalTTC     = Number(commande.totalTTC ?? 0);

  return (
    <div className="space-y-5 max-w-6xl">

      {/* ── En-tête ── */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => router.push(`/${tenant}/commandes`)}
          className="mt-1 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          aria-label="Retour"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-800">{commande.reference}</h1>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUTS_COULEURS[commande.statut] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {STATUTS_LABELS[commande.statut] ?? commande.statut}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            {commande.client?.nom} — créée le {fmtDate(commande.createdAt)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {peutEcrire && transitions.map((t) => (
            <button
              key={t.statut}
              type="button"
              onClick={() => changerStatutMutation.mutate(t.statut)}
              disabled={changerStatutMutation.isPending}
              className={`px-4 py-2 text-sm rounded-lg font-medium disabled:opacity-50 transition-colors ${t.color}`}
            >
              {changerStatutMutation.isPending ? '...' : t.label}
            </button>
          ))}
          {peutFacturer && (
            <button
              type="button"
              onClick={() => facturationMutation.mutate()}
              disabled={facturationMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <FileText size={14} />
              {facturationMutation.isPending ? 'Création...' : 'Créer la facture'}
            </button>
          )}
          {aFacture && (
            <button
              type="button"
              onClick={telechargerPdf}
              className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 text-gray-600"
            >
              <Download size={14} /> PDF
            </button>
          )}
        </div>
      </div>

      {/* ── Stepper workflow ── */}
      <WorkflowStepper statut={commande.statut} />

      {/* ── Corps principal ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Colonne gauche */}
        <div className="lg:col-span-2 space-y-5">

          {/* Infos générales */}
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h2 className="font-semibold text-gray-700 mb-4">Informations générales</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div className="flex items-start gap-2">
                <User size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Client</p>
                  <p className="font-medium text-gray-800">{commande.client?.nom}</p>
                  {commande.client?.ville && <p className="text-xs text-gray-400">{commande.client.ville}</p>}
                  {commande.client?.telephone && <p className="text-xs text-gray-400">{commande.client.telephone}</p>}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-400">Date de création</p>
                    <p className="font-medium text-gray-800">{fmtDate(commande.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Livraison prévue</p>
                    <p className={`font-medium ${
                      commande.dateLivraison && new Date(commande.dateLivraison) < new Date() && commande.statut !== 'livree' && commande.statut !== 'facturee'
                        ? 'text-red-600'
                        : 'text-gray-800'
                    }`}>
                      {commande.dateLivraison ? fmtDate(commande.dateLivraison) : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {commande.notes && (
              <div className="mt-4 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-sm text-amber-800">
                <span className="font-medium">Notes : </span>{commande.notes}
              </div>
            )}
          </div>

          {/* Lignes de commande */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b bg-gray-50 flex items-center gap-2">
              <Package size={14} className="text-gray-500" />
              <h2 className="font-semibold text-gray-700 text-sm">Lignes de commande</h2>
              <span className="ml-auto text-xs text-gray-400">{commande.lignes?.length} ligne(s)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b text-xs text-gray-500">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Produit</th>
                    <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Description</th>
                    <th className="text-right px-4 py-3 font-medium">Qté</th>
                    <th className="text-right px-4 py-3 font-medium">Prix unit. HT</th>
                    <th className="text-right px-5 py-3 font-medium">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {commande.lignes?.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-gray-800">{l.produit?.nom || '—'}</p>
                        {l.produit?.reference && (
                          <p className="text-xs text-gray-400">{l.produit.reference}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 hidden sm:table-cell">
                        {l.description || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">{Number(l.quantite)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-700">
                        {new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(Number(l.prixUnitaire))}
                      </td>
                      <td className="px-5 py-3 text-sm text-right font-semibold text-gray-800">
                        {new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(Number(l.montant))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-5 py-2 text-xs text-right text-gray-500 hidden sm:table-cell" />
                    <td className="px-4 py-2 text-sm text-right text-gray-500">Total HT</td>
                    <td className="px-5 py-2 text-sm text-right font-medium text-gray-700">
                      {new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(totalHT)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="hidden sm:table-cell" />
                    <td className="px-4 py-2 text-sm text-right text-gray-500">TVA (18%)</td>
                    <td className="px-5 py-2 text-sm text-right font-medium text-gray-700">
                      {new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(tva)}
                    </td>
                  </tr>
                  <tr className="bg-blue-700">
                    <td colSpan={3} className="hidden sm:table-cell" />
                    <td className="px-4 py-3 text-sm text-right font-bold text-white">Total TTC</td>
                    <td className="px-5 py-3 text-sm text-right font-bold text-white">{fmt(totalTTC)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-4">

          {/* Résumé financier */}
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h2 className="font-semibold text-gray-700 mb-4">Résumé financier</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Total HT</span>
                <span className="font-medium">{fmt(totalHT)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>TVA 18%</span>
                <span className="font-medium">{fmt(tva)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t pt-2 text-base">
                <span>Total TTC</span>
                <span className="text-blue-700">{fmt(totalTTC)}</span>
              </div>
            </div>
          </div>

          {/* Ordres de fabrication */}
          {(commande.ordresFabrication?.length ?? 0) > 0 && (
            <div className="bg-white rounded-xl border shadow-sm p-5">
              <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm">
                <Factory size={14} className="text-orange-500" /> Ordres de fabrication
              </h2>
              <div className="space-y-2">
                {commande.ordresFabrication!.map((of) => (
                  <button
                    key={of.id}
                    type="button"
                    onClick={() => router.push(`/${tenant}/production`)}
                    className="w-full flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50"
                  >
                    <span className="text-orange-700 font-medium">{of.reference}</span>
                    <span className="text-xs text-gray-400">{STATUTS_LABELS[of.statut] ?? of.statut}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Factures liées */}
          {aFacture && (
            <div className="bg-white rounded-xl border shadow-sm p-5">
              <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm">
                <FileText size={14} className="text-purple-500" /> Facture(s) liée(s)
              </h2>
              <div className="space-y-2">
                {commande.factures!.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => router.push(`/${tenant}/facturation/${f.id}`)}
                    className="w-full flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div className="text-left">
                      <p className="text-purple-700 font-medium">{f.reference}</p>
                      <p className="text-xs text-gray-400">{fmt(Number(f.totalTTC))}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUTS_COULEURS[f.statut] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {STATUTS_LABELS[f.statut] ?? f.statut}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dates clés */}
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm">
              <Clock size={14} className="text-gray-400" /> Dates clés
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Création</span>
                <span className="text-gray-700">{fmtDate(commande.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Livraison prévue</span>
                <span className={`${
                  commande.dateLivraison && new Date(commande.dateLivraison) < new Date()
                  && commande.statut !== 'livree' && commande.statut !== 'facturee'
                    ? 'text-red-600 font-semibold'
                    : 'text-gray-700'
                }`}>
                  {commande.dateLivraison ? fmtDate(commande.dateLivraison) : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Historique workflow ── */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50 flex items-center gap-2">
          <Clock size={14} className="text-gray-500" />
          <h2 className="font-semibold text-gray-700 text-sm">Historique de la commande</h2>
          <span className="ml-auto text-xs text-gray-400">{commande.historique?.length} événement(s)</span>
        </div>
        <div className="p-5">
          {commande.historique?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucun historique</p>
          ) : (
            <ol className="relative border-l border-gray-200 ml-3 space-y-6">
              {commande.historique?.map((h, idx) => (
                <li key={h.id} className="ml-6">
                  <span className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-white ${
                    idx === (commande.historique.length - 1) ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {HISTORIQUE_ICONES[h.nouveauStatut] ?? <Circle size={12} className="text-gray-400" />}
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {h.ancienStatut
                          ? `${STATUTS_LABELS[h.ancienStatut] ?? h.ancienStatut} → ${STATUTS_LABELS[h.nouveauStatut] ?? h.nouveauStatut}`
                          : `Commande créée — ${STATUTS_LABELS[h.nouveauStatut] ?? h.nouveauStatut}`}
                      </p>
                      {h.commentaire && (
                        <p className="text-xs text-gray-500 mt-0.5 italic">"{h.commentaire}"</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <User size={11} /> {h.userName}
                      </p>
                    </div>
                    <time className="text-xs text-gray-400 whitespace-nowrap">
                      {fmtDateTime(h.createdAt)}
                    </time>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
