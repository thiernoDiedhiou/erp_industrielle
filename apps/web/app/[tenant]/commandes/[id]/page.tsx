'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, FileText, Factory } from 'lucide-react';

const STATUTS_COULEURS: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-700',
  confirmee: 'bg-blue-100 text-blue-700',
  en_production: 'bg-orange-100 text-orange-700',
  prete: 'bg-yellow-100 text-yellow-700',
  livree: 'bg-green-100 text-green-700',
  facturee: 'bg-purple-100 text-purple-700',
  annulee: 'bg-red-100 text-red-700',
};

const TRANSITIONS: Record<string, { label: string; statut: string; color: string }[]> = {
  brouillon: [{ label: 'Confirmer', statut: 'confirmee', color: 'bg-blue-700 hover:bg-blue-800' }],
  confirmee: [
    { label: 'Lancer production', statut: 'en_production', color: 'bg-orange-600 hover:bg-orange-700' },
    { label: 'Livrer directement', statut: 'livree', color: 'bg-green-600 hover:bg-green-700' },
  ],
  en_production: [{ label: 'Marquer prête', statut: 'prete', color: 'bg-yellow-500 hover:bg-yellow-600' }],
  prete: [{ label: 'Livrer', statut: 'livree', color: 'bg-green-600 hover:bg-green-700' }],
};

export default function CommandeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const id = params.id as string;
  const tenant = params.tenant as string;

  const { data: commande, isLoading } = useQuery({
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
    onError: () => toast.error('Erreur lors du changement de statut'),
  });

  const facturationMutation = useMutation({
    mutationFn: () => api.post(`/facturation/factures/depuis-commande/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commande', id] });
      toast.success('Facture créée — voir dans Facturation');
    },
    onError: () => toast.error('Erreur lors de la création de la facture'),
  });

  const fmt = (v: number) =>
    new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(v) + ' FCFA';

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
      </div>
    );
  }

  if (!commande) return null;

  const transitions = TRANSITIONS[commande.statut] ?? [];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Retour">
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-800">{commande.reference}</h1>
          <p className="text-sm text-gray-500">{commande.client?.nom}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUTS_COULEURS[commande.statut] || 'bg-gray-100'}`}>
          {commande.statut}
        </span>
      </div>

      {/* Actions workflow */}
      {(transitions.length > 0 || commande.statut === 'livree') && (
        <div className="flex gap-2 flex-wrap">
          {transitions.map((t) => (
            <button
              key={t.statut}
              type="button"
              onClick={() => changerStatutMutation.mutate(t.statut)}
              disabled={changerStatutMutation.isPending}
              className={`px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 ${t.color}`}
            >
              {t.label}
            </button>
          ))}
          {commande.statut === 'livree' && !commande.factures?.length && (
            <button
              type="button"
              onClick={() => facturationMutation.mutate()}
              disabled={facturationMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <FileText size={15} />
              {facturationMutation.isPending ? 'Création...' : 'Créer la facture'}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {/* Infos commande */}
        <div className="col-span-2 bg-white rounded-xl border shadow-sm p-5 space-y-4">
          <h2 className="font-semibold text-gray-700">Détails</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400 text-xs">Client</p>
              <p className="font-medium text-gray-800">{commande.client?.nom || '-'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Date de création</p>
              <p className="font-medium text-gray-800">
                {new Date(commande.createdAt).toLocaleDateString('fr-SN')}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Livraison prévue</p>
              <p className="font-medium text-gray-800">
                {commande.dateLivraisonPrevue
                  ? new Date(commande.dateLivraisonPrevue).toLocaleDateString('fr-SN')
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Lignes</p>
              <p className="font-medium text-gray-800">{commande.lignes?.length || 0}</p>
            </div>
          </div>
          {commande.notes && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">{commande.notes}</div>
          )}

          {/* Lignes */}
          <table className="w-full text-sm mt-2">
            <thead className="border-b">
              <tr className="text-xs text-gray-400">
                <th className="text-left py-2 font-medium">Produit / Description</th>
                <th className="text-right py-2 font-medium">Qté</th>
                <th className="text-right py-2 font-medium">PU</th>
                <th className="text-right py-2 font-medium">Total HT</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {commande.lignes?.map((l: { id: string; produit?: { nom: string }; description?: string; quantite: number; prixUnitaire: number; totalHT: number }) => (
                <tr key={l.id}>
                  <td className="py-2 text-gray-700">{l.produit?.nom || l.description || '—'}</td>
                  <td className="py-2 text-right text-gray-600">{l.quantite}</td>
                  <td className="py-2 text-right text-gray-600">{fmt(l.prixUnitaire)}</td>
                  <td className="py-2 text-right font-medium text-gray-800">{fmt(l.totalHT)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaux + liens */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <h2 className="font-semibold text-gray-700 mb-3">Montants</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Total HT</span>
                <span>{fmt(commande.totalHT ?? 0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>TVA</span>
                <span>{fmt((commande.totalTTC ?? 0) - (commande.totalHT ?? 0))}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 border-t pt-2">
                <span>Total TTC</span>
                <span>{fmt(commande.totalTTC ?? 0)}</span>
              </div>
            </div>
          </div>

          {/* OFs liés */}
          {commande.ordresFabrication?.length > 0 && (
            <div className="bg-white rounded-xl border shadow-sm p-5">
              <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Factory size={15} /> OFs liés
              </h2>
              <div className="space-y-2">
                {commande.ordresFabrication.map((of: { id: string; reference: string; statut: string }) => (
                  <button
                    key={of.id}
                    type="button"
                    onClick={() => router.push(`/${tenant}/production`)}
                    className="w-full text-left flex justify-between text-sm p-2 rounded hover:bg-gray-50"
                  >
                    <span className="text-blue-700">{of.reference}</span>
                    <span className="text-gray-500">{of.statut}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Factures liées */}
          {commande.factures?.length > 0 && (
            <div className="bg-white rounded-xl border shadow-sm p-5">
              <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FileText size={15} /> Factures
              </h2>
              {commande.factures.map((f: { id: string; reference: string; statut: string }) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => router.push(`/${tenant}/facturation`)}
                  className="w-full text-left flex justify-between text-sm p-2 rounded hover:bg-gray-50"
                >
                  <span className="text-purple-700">{f.reference}</span>
                  <span className="text-gray-500">{f.statut}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
