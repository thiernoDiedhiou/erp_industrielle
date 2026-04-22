'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { usePermissions } from '@/lib/permissions-context';
import {
  ArrowLeft, Download, CreditCard, FileText, User, Calendar, CheckCircle,
  Clock, X, Banknote, AlertCircle,
} from 'lucide-react';

const STATUTS_COULEURS: Record<string, string> = {
  emise: 'bg-blue-100 text-blue-700 border-blue-200',
  partiellement_payee: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  payee: 'bg-green-100 text-green-700 border-green-200',
  annulee: 'bg-red-100 text-red-700 border-red-200',
};

const STATUTS_LABELS: Record<string, string> = {
  emise: 'Émise',
  partiellement_payee: 'Partiellement payée',
  payee: 'Payée',
  annulee: 'Annulée',
};

const STATUTS_ICONS: Record<string, React.ReactNode> = {
  emise: <Clock size={14} />,
  partiellement_payee: <AlertCircle size={14} />,
  payee: <CheckCircle size={14} />,
  annulee: <X size={14} />,
};

const MODE_LABELS: Record<string, string> = {
  virement: 'Virement', cheque: 'Chèque', especes: 'Espèces', mobile_money: 'Mobile Money',
};

interface LigneCommande {
  id: string;
  produit: { nom: string };
  quantite: number;
  prixUnitaire: number;
  montant: number;
}

interface Paiement {
  id: string;
  montant: number;
  mode: string;
  reference?: string;
  notes?: string;
  datePaiement: string;
}

interface Facture {
  id: string;
  reference: string;
  statut: string;
  totalHT: number;
  tva: number;
  totalTTC: number;
  dateEcheance: string;
  createdAt: string;
  commande: {
    reference: string;
    notes?: string;
    client: {
      nom: string;
      email?: string;
      telephone?: string;
      adresse?: string;
      ville?: string;
      ninea?: string;
    };
    lignes: LigneCommande[];
  };
  paiements: Paiement[];
}

export default function FactureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { peutEcrire } = usePermissions('facturation');
  const factureId = params.id as string;
  const tenant = params.tenant as string;

  const [modalPaiement, setModalPaiement] = useState(false);
  const [paiementForm, setPaiementForm] = useState({ montant: '', mode: 'virement', reference: '', notes: '' });
  const [dlLoading, setDlLoading] = useState(false);

  const { data: facture, isLoading } = useQuery<Facture>({
    queryKey: ['facture', factureId],
    queryFn: async () => {
      const { data } = await api.get(`/facturation/factures/${factureId}`);
      return data;
    },
  });

  const paiementMutation = useMutation({
    mutationFn: (form: typeof paiementForm) =>
      api.post(`/facturation/factures/${factureId}/paiements`, {
        montant: Number(form.montant),
        mode: form.mode,
        reference: form.reference || undefined,
        notes: form.notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facture', factureId] });
      queryClient.invalidateQueries({ queryKey: ['factures'] });
      queryClient.invalidateQueries({ queryKey: ['facturation-stats'] });
      setModalPaiement(false);
      setPaiementForm({ montant: '', mode: 'virement', reference: '', notes: '' });
      toast.success('Paiement enregistré');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    },
  });

  const telechargerPdf = async () => {
    if (!facture) return;
    setDlLoading(true);
    try {
      const response = await api.get(`/facturation/factures/${factureId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${facture.reference}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('PDF téléchargé');
    } catch {
      toast.error('Erreur lors du téléchargement du PDF');
    } finally {
      setDlLoading(false);
    }
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(v) + ' FCFA';

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-SN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700" />
      </div>
    );
  }

  if (!facture) {
    return (
      <div className="text-center py-16">
        <FileText size={40} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">Facture introuvable</p>
        <button type="button" onClick={() => router.back()} className="mt-4 text-blue-600 text-sm hover:underline">
          Retour
        </button>
      </div>
    );
  }

  const totalPaye = facture.paiements.reduce((sum, p) => sum + Number(p.montant), 0);
  const restantDu = Number(facture.totalTTC) - totalPaye;
  const estSolde = facture.statut === 'payee';
  const peutPayer = peutEcrire && !estSolde && facture.statut !== 'annulee';

  return (
    <div className="space-y-5 max-w-5xl">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push(`/${tenant}/facturation`)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          aria-label="Retour"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800">{facture.reference}</h1>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUTS_COULEURS[facture.statut] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {STATUTS_ICONS[facture.statut]}
              {STATUTS_LABELS[facture.statut] ?? facture.statut}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            Commande {facture.commande.reference} — émise le {fmtDate(facture.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {peutPayer && (
            <button
              type="button"
              onClick={() => {
                setPaiementForm({ montant: String(Math.round(restantDu)), mode: 'virement', reference: '', notes: '' });
                setModalPaiement(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
            >
              <CreditCard size={15} />
              Enregistrer un paiement
            </button>
          )}
          <button
            type="button"
            onClick={telechargerPdf}
            disabled={dlLoading}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {dlLoading
              ? <span className="block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              : <Download size={15} />}
            PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Colonne gauche — infos + lignes */}
        <div className="lg:col-span-2 space-y-5">
          {/* Infos client & dates */}
          <div className="bg-white rounded-xl border shadow-sm p-5 grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <User size={12} /> Client
              </p>
              <p className="font-semibold text-gray-800">{facture.commande.client.nom}</p>
              {facture.commande.client.adresse && (
                <p className="text-sm text-gray-500 mt-0.5">{facture.commande.client.adresse}</p>
              )}
              {facture.commande.client.ville && (
                <p className="text-sm text-gray-500">{facture.commande.client.ville}</p>
              )}
              {facture.commande.client.telephone && (
                <p className="text-sm text-gray-500 mt-1">{facture.commande.client.telephone}</p>
              )}
              {facture.commande.client.email && (
                <p className="text-sm text-gray-400">{facture.commande.client.email}</p>
              )}
              {facture.commande.client.ninea && (
                <p className="text-xs text-gray-400 mt-1">NINEA : {facture.commande.client.ninea}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Calendar size={12} /> Dates
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Émission</span>
                  <span className="font-medium text-gray-700">{fmtDate(facture.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Échéance</span>
                  <span className={`font-medium ${
                    !estSolde && new Date(facture.dateEcheance) < new Date()
                      ? 'text-red-600'
                      : 'text-gray-700'
                  }`}>
                    {fmtDate(facture.dateEcheance)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des lignes */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b bg-gray-50">
              <h2 className="font-semibold text-gray-700 text-sm">Détail des prestations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b text-xs text-gray-500">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Désignation</th>
                    <th className="text-right px-4 py-3 font-medium">Qté</th>
                    <th className="text-right px-4 py-3 font-medium">P.U. HT</th>
                    <th className="text-right px-4 py-3 font-medium">Montant HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {facture.commande.lignes.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{l.produit.nom}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">{Number(l.quantite)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">
                        {new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(Number(l.prixUnitaire))}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-gray-800">
                        {new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(Number(l.montant))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-sm text-right text-gray-500">Total HT</td>
                    <td className="px-4 py-2 text-sm text-right font-medium text-gray-700">
                      {new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(Number(facture.totalHT))}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-sm text-right text-gray-500">TVA (18%)</td>
                    <td className="px-4 py-2 text-sm text-right font-medium text-gray-700">
                      {new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(Number(facture.tva))}
                    </td>
                  </tr>
                  <tr className="bg-blue-700">
                    <td colSpan={3} className="px-4 py-3 text-sm text-right font-bold text-white">Total TTC</td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-white">
                      {fmt(Number(facture.totalTTC))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {facture.commande.notes && (
              <div className="px-5 py-3 border-t text-xs text-gray-500">
                <span className="font-medium">Notes : </span>{facture.commande.notes}
              </div>
            )}
          </div>
        </div>

        {/* Colonne droite — paiements & solde */}
        <div className="space-y-5">
          {/* Résumé financier */}
          <div className="bg-white rounded-xl border shadow-sm p-5 space-y-3">
            <h2 className="font-semibold text-gray-700 text-sm">Suivi du règlement</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total TTC</span>
                <span className="font-semibold text-gray-800">{fmt(Number(facture.totalTTC))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Déjà payé</span>
                <span className="font-semibold text-green-700">{fmt(totalPaye)}</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between text-sm">
                <span className={`font-semibold ${restantDu > 0 ? 'text-red-600' : 'text-green-700'}`}>
                  Restant dû
                </span>
                <span className={`font-bold text-base ${restantDu > 0 ? 'text-red-600' : 'text-green-700'}`}>
                  {fmt(Math.max(0, restantDu))}
                </span>
              </div>
            </div>
            {restantDu > 0 && (
              <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, Math.round((totalPaye / Number(facture.totalTTC)) * 100))}%` }}
                />
              </div>
            )}
          </div>

          {/* Historique des paiements */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
              <Banknote size={14} className="text-green-600" />
              <h2 className="font-semibold text-gray-700 text-sm">Paiements reçus</h2>
              <span className="ml-auto text-xs text-gray-400">{facture.paiements.length}</span>
            </div>
            {facture.paiements.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400">Aucun paiement enregistré</div>
            ) : (
              <div className="divide-y">
                {facture.paiements.map((p) => (
                  <div key={p.id} className="px-4 py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {MODE_LABELS[p.mode] ?? p.mode}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">{fmtDate(p.datePaiement)}</p>
                        {p.reference && (
                          <p className="text-xs text-gray-400">Réf. {p.reference}</p>
                        )}
                      </div>
                      <span className="font-semibold text-green-700 text-sm">+{fmt(Number(p.montant))}</span>
                    </div>
                    {p.notes && <p className="text-xs text-gray-400 mt-1 italic">{p.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal paiement */}
      {modalPaiement && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="font-semibold text-gray-800">Enregistrer un paiement</h2>
                <p className="text-xs text-gray-400 mt-0.5">{facture.reference} — restant dû : {fmt(restantDu)}</p>
              </div>
              <button type="button" aria-label="Fermer" onClick={() => setModalPaiement(false)}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="pd-montant" className="text-sm text-gray-600">Montant reçu (FCFA) *</label>
                <input
                  id="pd-montant"
                  type="number"
                  max={restantDu}
                  value={paiementForm.montant}
                  onChange={(e) => setPaiementForm({ ...paiementForm, montant: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="pd-mode" className="text-sm text-gray-600">Mode de paiement</label>
                <select
                  id="pd-mode"
                  value={paiementForm.mode}
                  onChange={(e) => setPaiementForm({ ...paiementForm, mode: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="virement">Virement</option>
                  <option value="cheque">Chèque</option>
                  <option value="especes">Espèces</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>
              <div>
                <label htmlFor="pd-ref" className="text-sm text-gray-600">Référence</label>
                <input
                  id="pd-ref"
                  type="text"
                  placeholder="N° chèque, transaction..."
                  value={paiementForm.reference}
                  onChange={(e) => setPaiementForm({ ...paiementForm, reference: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="pd-notes" className="text-sm text-gray-600">Notes</label>
                <textarea
                  id="pd-notes"
                  rows={2}
                  placeholder="Commentaire optionnel..."
                  value={paiementForm.notes}
                  onChange={(e) => setPaiementForm({ ...paiementForm, notes: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button
                type="button"
                onClick={() => paiementMutation.mutate(paiementForm)}
                disabled={!paiementForm.montant || Number(paiementForm.montant) <= 0 || paiementMutation.isPending}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {paiementMutation.isPending ? 'Enregistrement...' : 'Valider le paiement'}
              </button>
              <button
                type="button"
                onClick={() => setModalPaiement(false)}
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
