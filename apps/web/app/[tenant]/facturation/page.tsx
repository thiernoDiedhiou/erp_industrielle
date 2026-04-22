'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { TrendingUp, Clock, CheckCircle, Download, CreditCard, X, FileText, Banknote, Eye } from 'lucide-react';
import { usePermissions } from '@/lib/permissions-context';

const STATUTS_COULEURS: Record<string, string> = {
  emise: 'bg-blue-100 text-blue-700',
  partiellement_payee: 'bg-yellow-100 text-yellow-700',
  payee: 'bg-green-100 text-green-700',
  annulee: 'bg-red-100 text-red-700',
};

const STATUTS_LABELS: Record<string, string> = {
  '': 'Toutes',
  emise: 'Émise',
  partiellement_payee: 'Partiel',
  payee: 'Payée',
};

interface Facture {
  id: string;
  reference: string;
  totalTTC: number;
  dateEcheance?: string;
  statut: string;
  commande?: { client?: { nom: string } };
}

const MODE_LABELS: Record<string, string> = {
  virement: 'Virement', cheque: 'Chèque', especes: 'Espèces', mobile_money: 'Mobile Money',
};

export default function FacturationPage() {
  const [onglet, setOnglet] = useState<'factures' | 'paiements'>('factures');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [modalPaiement, setModalPaiement] = useState<Facture | null>(null);
  const [paiementForm, setPaiementForm] = useState({ montant: '', modePaiement: 'virement', reference: '' });
  const [dlLoading, setDlLoading] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();
  const { peutEcrire, peutLire } = usePermissions('facturation');
  const params = useParams();
  const router = useRouter();

  const { data: stats } = useQuery({
    queryKey: ['facturation-stats'],
    queryFn: async () => {
      const { data } = await api.get('/facturation/factures/stats');
      return data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['factures', filtreStatut],
    queryFn: async () => {
      const { data } = await api.get('/facturation/factures', {
        params: { statut: filtreStatut || undefined },
      });
      return data;
    },
  });

  const { data: paiements, isLoading: paiementsLoading } = useQuery({
    queryKey: ['paiements-global'],
    queryFn: async () => {
      const { data } = await api.get('/facturation/paiements', { params: { limite: 50 } });
      return data;
    },
    enabled: onglet === 'paiements',
  });

  const paiementMutation = useMutation({
    mutationFn: ({ id, form }: { id: string; form: typeof paiementForm }) =>
      api.post(`/facturation/factures/${id}/paiements`, {
        montant: Number(form.montant),
        mode: form.modePaiement,
        reference: form.reference || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['factures'] });
      queryClient.invalidateQueries({ queryKey: ['facturation-stats'] });
      setModalPaiement(null);
      setPaiementForm({ montant: '', modePaiement: 'virement', reference: '' });
      toast.success('Paiement enregistré');
    },
    onError: () => toast.error('Erreur lors de l\'enregistrement du paiement'),
  });

  const formatMontant = (v: number) =>
    new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(v) + ' FCFA';

  const telechargerPdf = async (f: Facture) => {
    setDlLoading(f.id);
    try {
      const response = await api.get(`/facturation/factures/${f.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data as BlobPart], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${f.reference}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`PDF ${f.reference} téléchargé`);
    } catch {
      toast.error('Erreur lors du téléchargement');
    } finally {
      setDlLoading(null);
    }
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(v) + ' FCFA';

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-800">Facturation</h1>
        {/* Onglets */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
          {([['factures', 'Factures', FileText], ['paiements', 'Paiements reçus', Banknote]] as const).map(([val, label, Icon]) => (
            <button
              key={val}
              type="button"
              onClick={() => setOnglet(val)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                onglet === val ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={14} />
              <span className="hidden xs:inline sm:inline">{label}</span>
              <span className="xs:hidden sm:hidden">{val === 'factures' ? 'Factures' : 'Paiements'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">CA encaissé</p>
              <p className="font-bold text-gray-800">{formatMontant(stats.chiffreAffaires)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <Clock size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Impayés ({stats.nombreImpayees})</p>
              <p className="font-bold text-gray-800">{formatMontant(stats.montantImpaye)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CheckCircle size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Taux recouvrement</p>
              <p className="font-bold text-gray-800">
                {stats.chiffreAffaires + stats.montantImpaye > 0
                  ? Math.round((stats.chiffreAffaires / (stats.chiffreAffaires + stats.montantImpaye)) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== ONGLET PAIEMENTS ===== */}
      {onglet === 'paiements' && (
        <>
          {paiementsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="px-5 py-3 border-b bg-gray-50 flex items-center gap-2">
                <Banknote size={16} className="text-green-600" />
                <h2 className="font-semibold text-gray-700">Historique des paiements reçus</h2>
                <span className="ml-auto text-xs text-gray-400">{paiements?.total ?? 0} paiement(s)</span>
              </div>
              <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="bg-gray-50 border-b text-xs text-gray-500">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="text-left px-4 py-3 font-medium">Facture</th>
                    <th className="text-left px-4 py-3 font-medium">Client</th>
                    <th className="text-left px-4 py-3 font-medium">Mode</th>
                    <th className="text-left px-4 py-3 font-medium">Référence</th>
                    <th className="text-right px-4 py-3 font-medium">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paiements?.items?.map((p: {
                    id: string;
                    datePaiement: string;
                    montant: number;
                    mode: string;
                    reference?: string;
                    facture: { reference: string; commande?: { client?: { nom: string } } };
                  }) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(p.datePaiement).toLocaleDateString('fr-SN')}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-blue-700">{p.facture.reference}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {p.facture.commande?.client?.nom || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                          {MODE_LABELS[p.mode] ?? p.mode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">{p.reference || '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-700">
                        +{fmt(Number(p.montant))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              {paiements?.items?.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">Aucun paiement enregistré</div>
              )}
            </div>
          )}
        </>
      )}

      {/* ===== ONGLET FACTURES ===== */}
      {onglet === 'factures' && <>
      {/* Filtres */}
      <div className="flex gap-2">
        {Object.entries(STATUTS_LABELS).map(([val, label]) => (
          <button
            key={val}
            type="button"
            onClick={() => setFiltreStatut(val)}
            className={`px-3 py-1 rounded-full text-xs border ${
              filtreStatut === val
                ? 'bg-blue-700 text-white border-blue-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[660px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Référence</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Client</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Montant TTC</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Échéance</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Statut</th>
                <th scope="col" className="px-4 py-3 sr-only">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.items?.map((f: Facture) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => router.push(`/${params.tenant}/facturation/${f.id}`)}
                      className="flex items-center gap-1.5 hover:underline"
                    >
                      <FileText size={13} className="text-blue-500" />
                      <span className="font-medium text-sm text-blue-700">{f.reference}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{f.commande?.client?.nom || '-'}</td>
                  <td className="px-4 py-3 text-right font-medium text-sm text-gray-800">
                    {formatMontant(f.totalTTC)}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {f.dateEcheance ? new Date(f.dateEcheance).toLocaleDateString('fr-SN') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${STATUTS_COULEURS[f.statut] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUTS_LABELS[f.statut] ?? f.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {peutLire && (
                        <button
                          type="button"
                          aria-label="Voir le détail"
                          title="Détail"
                          onClick={() => router.push(`/${params.tenant}/facturation/${f.id}`)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                        >
                          <Eye size={15} />
                        </button>
                      )}
                      {peutEcrire && f.statut !== 'payee' && f.statut !== 'annulee' && (
                        <button
                          type="button"
                          aria-label="Enregistrer un paiement"
                          title="Paiement"
                          onClick={() => { setModalPaiement(f); setPaiementForm({ montant: String(f.totalTTC), modePaiement: 'virement', reference: '' }); }}
                          className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600"
                        >
                          <CreditCard size={15} />
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label="Télécharger PDF"
                        title="PDF"
                        onClick={() => telechargerPdf(f)}
                        disabled={dlLoading === f.id}
                        className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600 disabled:opacity-40"
                      >
                        {dlLoading === f.id
                          ? <span className="block w-[15px] h-[15px] border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                          : <Download size={15} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {data?.items?.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">Aucune facture</div>
          )}
        </div>
      )}
      </> /* fin onglet factures */}

      {/* Modal paiement */}
      {modalPaiement && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="font-semibold text-gray-800">Enregistrer un paiement</h2>
                <p className="text-xs text-gray-400 mt-0.5">{modalPaiement.reference} — {modalPaiement.commande?.client?.nom}</p>
              </div>
              <button type="button" aria-label="Fermer" onClick={() => setModalPaiement(null)}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="p-montant" className="text-sm text-gray-600">Montant reçu (FCFA) *</label>
                <input
                  id="p-montant"
                  type="number"
                  value={paiementForm.montant}
                  onChange={(e) => setPaiementForm({ ...paiementForm, montant: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="p-mode" className="text-sm text-gray-600">Mode de paiement</label>
                <select
                  id="p-mode"
                  value={paiementForm.modePaiement}
                  onChange={(e) => setPaiementForm({ ...paiementForm, modePaiement: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="virement">Virement</option>
                  <option value="cheque">Chèque</option>
                  <option value="especes">Espèces</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>
              <div>
                <label htmlFor="p-ref" className="text-sm text-gray-600">Référence paiement</label>
                <input
                  id="p-ref"
                  type="text"
                  placeholder="N° chèque, transaction..."
                  value={paiementForm.reference}
                  onChange={(e) => setPaiementForm({ ...paiementForm, reference: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button
                type="button"
                onClick={() => paiementMutation.mutate({ id: modalPaiement.id, form: paiementForm })}
                disabled={!paiementForm.montant || paiementMutation.isPending}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {paiementMutation.isPending ? 'Enregistrement...' : 'Valider le paiement'}
              </button>
              <button
                type="button"
                onClick={() => setModalPaiement(null)}
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
