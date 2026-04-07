'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Plus, Eye } from 'lucide-react';

const STATUTS_COULEURS: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-700',
  confirmee: 'bg-blue-100 text-blue-700',
  en_production: 'bg-orange-100 text-orange-700',
  prete: 'bg-yellow-100 text-yellow-700',
  livree: 'bg-green-100 text-green-700',
  facturee: 'bg-purple-100 text-purple-700',
  annulee: 'bg-red-100 text-red-700',
};

interface Commande {
  id: string;
  reference: string;
  statut: string;
  totalTTC: number;
  createdAt: string;
  client?: { nom: string };
  lignes?: { id: string }[];
}

export default function CommandesPage() {
  const params = useParams();
  const router = useRouter();
  const [filtreStatut, setFiltreStatut] = useState('');
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['commandes', filtreStatut],
    queryFn: async () => {
      const { data } = await api.get('/commandes', {
        params: { statut: filtreStatut || undefined, limite: 50 },
      });
      return data;
    },
  });

  const changerStatutMutation = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: string }) =>
      api.put(`/commandes/${id}/statut`, { statut }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commandes'] });
      toast.success('Statut de la commande mis à jour');
    },
    onError: () => toast.error('Erreur lors du changement de statut'),
  });

  const formatMontant = (v: number) =>
    new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(v) + ' FCFA';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Commandes</h1>
        <button
          type="button"
          onClick={() => router.push(`/${params.tenant}/commandes/nouvelle`)}
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800"
        >
          <Plus size={16} />
          Nouvelle commande
        </button>
      </div>

      {/* Filtres statuts */}
      <div className="flex gap-2 flex-wrap">
        {['', 'brouillon', 'confirmee', 'en_production', 'livree', 'facturee'].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFiltreStatut(s)}
            className={`px-3 py-1 rounded-full text-xs border transition-colors ${
              filtreStatut === s
                ? 'bg-blue-700 text-white border-blue-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s || 'Toutes'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Référence</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Client</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Lignes</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Montant TTC</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Statut</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
                <th scope="col" className="px-4 py-3 sr-only">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.items?.map((cmd: Commande) => (
                <tr key={cmd.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-sm text-blue-700">{cmd.reference}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{cmd.client?.nom || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{cmd.lignes?.length || 0} ligne(s)</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {formatMontant(cmd.totalTTC)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${STATUTS_COULEURS[cmd.statut] || 'bg-gray-100 text-gray-600'}`}>
                      {cmd.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(cmd.createdAt).toLocaleDateString('fr-SN')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      aria-label="Voir le détail"
                      onClick={() => router.push(`/${params.tenant}/commandes/${cmd.id}`)}
                      className="text-gray-400 hover:text-blue-700"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {data?.items?.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">Aucune commande</div>
          )}
        </div>
      )}
    </div>
  );
}
