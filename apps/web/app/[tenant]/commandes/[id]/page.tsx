'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { usePermissions } from '@/lib/permissions-context';
import {
  ArrowLeft, FileText, Factory, CheckCircle, Clock, Circle,
  User, Calendar, Package, Download, AlertTriangle, Eye,
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
  planifie:      'Planifié',
  en_cours:      'En cours',
  en_pause:      'En pause',
  termine:       'Terminé',
};

const STATUTS_COULEURS: Record<string, string> = {
  brouillon:     'bg-gray-100 text-gray-700 border-gray-200',
  confirmee:     'bg-blue-100 text-blue-700 border-blue-200',
  en_production: 'bg-orange-100 text-orange-700 border-orange-200',
  prete:         'bg-yellow-100 text-yellow-800 border-yellow-200',
  livree:        'bg-green-100 text-green-700 border-green-200',
  facturee:      'bg-purple-100 text-purple-700 border-purple-200',
  annulee:       'bg-red-100 text-red-700 border-red-200',
  planifie:      'bg-gray-100 text-gray-600 border-gray-200',
  en_cours:      'bg-orange-100 text-orange-700 border-orange-200',
  en_pause:      'bg-yellow-100 text-yellow-700 border-yellow-200',
  termine:       'bg-green-100 text-green-700 border-green-200',
};

// Transitions visibles dans l'UI — la vraie autorisation est vérifiée côté API
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
  produitId: string;
  produit?: { id: string; nom: string; reference?: string };
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

interface OFResume {
  id: string;
  reference: string;
  statut: string;
  quantitePrevue: number;
  quantiteProduite: number;
  produitFini: string;
  machine?: { nom: string } | null;
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
  ordresFabrication?: OFResume[];
}

interface Machine {
  id: string;
  nom: string;
  code: string;
  statut: string;
}

interface BomActif {
  id: string;
  nom: string;
  version: string;
  produitFini?: { nom: string };
  items: {
    id: string;
    quantite: number;
    unite?: string;
    pertes?: number;
    matierePremiere?: { id: string; nom: string; unite?: string; stockActuel: number };
  }[];
}

// ── Stepper workflow ────────────────────────────────────────────────────────
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
          const passe  = i < indexActuel;
          const actuel = i === indexActuel;
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

  // Dialog "Lancer en production"
  const [showLancerModal, setShowLancerModal] = useState(false);
  const [ofForm, setOfForm] = useState({
    machineId: '',
    bomId: '',
    ligneIndex: 0,
    dateDebutPrevue: '',
    dateFinPrevue: '',
    notes: '',
  });

  const { data: commande, isLoading } = useQuery<Commande>({
    queryKey: ['commande', id],
    queryFn: async () => (await api.get(`/commandes/${id}`)).data,
  });

  const { data: machines } = useQuery<Machine[]>({
    queryKey: ['machines'],
    queryFn: async () => (await api.get('/production/machines')).data,
    enabled: showLancerModal,
  });

  const { data: bomsActifs } = useQuery<BomActif[]>({
    queryKey: ['boms-actifs'],
    queryFn: async () => (await api.get('/bom/actifs')).data,
    enabled: showLancerModal,
  });

  const changerStatutMutation = useMutation({
    mutationFn: (statut: string) => api.put(`/commandes/${id}/statut`, { statut }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commande', id] });
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
      toast.success('Statut mis à jour');
    },
    onError: (err: any) =>
      toast.error(String(err?.response?.data?.message ?? 'Transition non autorisée')),
  });

  const creerOFMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/production/ofs', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commande', id] });
      queryClient.invalidateQueries({ queryKey: ['ofs'] });
      toast.success('Ordre de fabrication créé et lié à la commande');
      setShowLancerModal(false);
    },
    onError: (err: any) =>
      toast.error(String(err?.response?.data?.message ?? 'Erreur création OF')),
  });

  const facturationMutation = useMutation({
    mutationFn: () => api.post(`/facturation/factures/depuis-commande/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commande', id] });
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

  // Ouvre le modal et change le statut immédiatement
  const handleLancerProduction = () => {
    if (!commande?.lignes?.length) return;
    setOfForm({ machineId: '', bomId: '', ligneIndex: 0, dateDebutPrevue: '', dateFinPrevue: '', notes: '' });
    setShowLancerModal(true);
    // Changer le statut en parallèle
    changerStatutMutation.mutate('en_production');
  };

  const confirmerCreationOF = () => {
    if (!commande) return;
    const ligne = commande.lignes[ofForm.ligneIndex];
    if (!ligne) return;
    creerOFMutation.mutate({
      commandeId: commande.id,
      produitId: ligne.produitId,
      produitFini: ligne.produit?.nom ?? 'Produit',
      quantitePrevue: Number(ligne.quantite),
      machineId: ofForm.machineId || undefined,
      dateDebutPrevue: ofForm.dateDebutPrevue || undefined,
      dateFinPrevue: ofForm.dateFinPrevue || undefined,
      notes: ofForm.notes || undefined,
    });
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

  const transitions = (TRANSITIONS[commande.statut] ?? []).filter(
    (t) => t.statut !== 'en_production', // géré séparément via handleLancerProduction
  );
  const lancerEnProduction = commande.statut === 'confirmee' && peutEcrire;
  const peutFacturer = peutEcrire && commande.statut === 'livree' && !commande.factures?.length;
  const aFacture     = (commande.factures?.length ?? 0) > 0;
  const aOFs         = (commande.ordresFabrication?.length ?? 0) > 0;
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
          {/* Bouton spécial "Lancer en production" avec dialog OF */}
          {lancerEnProduction && (
            <button
              type="button"
              onClick={handleLancerProduction}
              disabled={changerStatutMutation.isPending}
              className="px-4 py-2 text-sm rounded-lg font-medium disabled:opacity-50 bg-orange-600 hover:bg-orange-700 text-white"
            >
              {changerStatutMutation.isPending ? '...' : 'Lancer en production'}
            </button>
          )}
          {/* Autres transitions */}
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
                        ? 'text-red-600' : 'text-gray-800'
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
                        {l.produit?.reference && <p className="text-xs text-gray-400">{l.produit.reference}</p>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 hidden sm:table-cell">{l.description || '—'}</td>
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

          {/* ── Ordres de fabrication ── */}
          {(commande.statut === 'en_production' || commande.statut === 'prete' || aOFs) && (
            <div className="bg-white rounded-xl border shadow-sm p-5">
              <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2 text-sm">
                <Factory size={14} className="text-orange-500" /> Ordres de fabrication
                <span className="ml-auto text-xs text-gray-400 font-normal">{commande.ordresFabrication?.length ?? 0}</span>
              </h2>
              {aOFs ? (
                <div className="space-y-2">
                  {commande.ordresFabrication!.map((of) => {
                    const taux = Number(of.quantitePrevue) > 0
                      ? Math.round((Number(of.quantiteProduite) / Number(of.quantitePrevue)) * 100)
                      : 0;
                    return (
                      <div key={of.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <button
                            type="button"
                            onClick={() => router.push(`/${tenant}/production/${of.id}`)}
                            className="text-sm font-medium text-orange-700 hover:underline flex items-center gap-1"
                          >
                            <Eye size={12} /> {of.reference}
                          </button>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUTS_COULEURS[of.statut] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {STATUTS_LABELS[of.statut] ?? of.statut}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{of.produitFini}{of.machine ? ` — ${of.machine.nom}` : ''}</p>
                        {/* Barre de progression */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${of.statut === 'termine' ? 'bg-green-500' : 'bg-orange-400'}`}
                              style={{ width: `${Math.min(taux, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {Number(of.quantiteProduite)}/{Number(of.quantitePrevue)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-3">
                  Aucun OF créé — utilisez le bouton ci-dessus pour en créer un.
                </p>
              )}
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
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUTS_COULEURS[f.statut] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
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
                    ? 'text-red-600 font-semibold' : 'text-gray-700'
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

      {/* ── Modal : Créer l'OF lié ── */}
      {showLancerModal && commande && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Factory size={20} className="text-orange-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800">Créer l'ordre de fabrication</h2>
                <p className="text-xs text-gray-400">Lié à {commande.reference}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Sélection de la ligne produit si plusieurs */}
              {commande.lignes.length > 1 && (
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Ligne de commande</label>
                  <select
                    value={ofForm.ligneIndex}
                    onChange={(e) => setOfForm((f) => ({ ...f, ligneIndex: Number(e.target.value) }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {commande.lignes.map((l, i) => (
                      <option key={l.id} value={i}>
                        {l.produit?.nom ?? l.produitId} — Qté : {Number(l.quantite)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Récapitulatif produit sélectionné */}
              {commande.lignes[ofForm.ligneIndex] && (
                <div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-3 text-sm">
                  <p className="font-medium text-orange-800">{commande.lignes[ofForm.ligneIndex].produit?.nom}</p>
                  <p className="text-orange-600 text-xs mt-0.5">
                    Qté prévue : {Number(commande.lignes[ofForm.ligneIndex].quantite)} unités
                  </p>
                </div>
              )}

              {/* Nomenclature (BOM) */}
              {bomsActifs && bomsActifs.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    Nomenclature (BOM)
                    <span className="font-normal text-gray-400 ml-1">— matières suggérées</span>
                  </label>
                  <select
                    value={ofForm.bomId}
                    onChange={(e) => setOfForm((f) => ({ ...f, bomId: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">— Sans nomenclature —</option>
                    {bomsActifs.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nom} v{b.version}{b.produitFini ? ` — ${b.produitFini.nom}` : ''}
                      </option>
                    ))}
                  </select>
                  {/* Aperçu des matières de la BOM sélectionnée */}
                  {ofForm.bomId && (() => {
                    const bom = bomsActifs.find((b) => b.id === ofForm.bomId);
                    if (!bom?.items.length) return null;
                    const qty = Number(commande?.lignes[ofForm.ligneIndex]?.quantite ?? 1);
                    return (
                      <div className="mt-2 bg-amber-50 border border-amber-100 rounded-lg p-3">
                        <p className="text-xs font-medium text-amber-800 mb-2">Matières nécessaires pour {qty} unité(s) :</p>
                        <div className="space-y-1">
                          {bom.items.filter((i) => i.matierePremiere).map((item) => {
                            const qteNecessaire = Number(item.quantite) * qty * (1 + Number(item.pertes ?? 0) / 100);
                            const mp = item.matierePremiere!;
                            const insuffisant = Number(mp.stockActuel) < qteNecessaire;
                            return (
                              <div key={item.id} className="flex justify-between items-center text-xs">
                                <span className="text-amber-700">{mp.nom}</span>
                                <span className={`font-medium ${insuffisant ? 'text-red-600' : 'text-green-700'}`}>
                                  {qteNecessaire.toFixed(1)} {item.unite ?? mp.unite}
                                  {insuffisant && ' ⚠ stock insuffisant'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Machine */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Machine</label>
                <select
                  value={ofForm.machineId}
                  onChange={(e) => setOfForm((f) => ({ ...f, machineId: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">— Sans machine —</option>
                  {machines?.map((m) => (
                    <option key={m.id} value={m.id} disabled={m.statut === 'maintenance'}>
                      {m.nom} ({m.code}){m.statut === 'maintenance' ? ' — maintenance' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Début prévu</label>
                  <input
                    type="date"
                    value={ofForm.dateDebutPrevue}
                    onChange={(e) => setOfForm((f) => ({ ...f, dateDebutPrevue: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Fin prévue</label>
                  <input
                    type="date"
                    value={ofForm.dateFinPrevue}
                    onChange={(e) => setOfForm((f) => ({ ...f, dateFinPrevue: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Notes (optionnel)</label>
                <textarea
                  rows={2}
                  value={ofForm.notes}
                  onChange={(e) => setOfForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Instructions de production..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                type="button"
                onClick={confirmerCreationOF}
                disabled={creerOFMutation.isPending}
                className="flex-1 bg-orange-600 text-white py-2 rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50 font-medium"
              >
                {creerOFMutation.isPending ? 'Création...' : 'Créer l\'OF'}
              </button>
              <button
                type="button"
                onClick={() => setShowLancerModal(false)}
                className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50 text-gray-600"
              >
                Ignorer
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              La commande est déjà passée en production. Vous pouvez aussi créer l'OF plus tard depuis le module Production.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
