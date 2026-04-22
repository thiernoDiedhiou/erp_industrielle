'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Recycle, Plus, X, CheckCircle2 } from 'lucide-react';
import { usePermissions } from '@/lib/permissions-context';

const STATUTS_COULEURS: Record<string, string> = {
  planifiee: 'bg-gray-100 text-gray-700',
  en_cours:  'bg-blue-100 text-blue-700',
  completee: 'bg-green-100 text-green-700',
  annulee:   'bg-red-100 text-red-700',
};

const STATUTS_LABELS: Record<string, string> = {
  planifiee: 'Planifiée',
  en_cours:  'En cours',
  completee: 'Complétée',
  annulee:   'Annulée',
};

const FORM_VIDE = { typeDechet: '', quantite: '', unite: 'kg', collecteur: '' };

export default function RecyclagePage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(FORM_VIDE);
  const toast = useToast();
  const { peutEcrire } = usePermissions('recyclage');

  const { data: stats } = useQuery({
    queryKey: ['recyclage-stats'],
    queryFn: async () => {
      const { data } = await api.get('/recyclage/stats');
      return data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['collectes'],
    queryFn: async () => {
      const { data } = await api.get('/recyclage/collectes');
      return data;
    },
  });

  const creerMutation = useMutation({
    mutationFn: (d: object) => api.post('/recyclage/collectes', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectes'] });
      queryClient.invalidateQueries({ queryKey: ['recyclage-stats'] });
      setShowForm(false);
      setForm(FORM_VIDE);
      toast.success('Collecte enregistrée');
    },
    onError: () => toast.error('Erreur lors de l\'enregistrement'),
  });

  const changerStatutMutation = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: string }) =>
      api.put(`/recyclage/collectes/${id}/statut`, { statut }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectes'] });
      queryClient.invalidateQueries({ queryKey: ['recyclage-stats'] });
      toast.success('Statut mis à jour');
    },
    onError: () => toast.error('Erreur lors du changement de statut'),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Recyclage</h1>
        {peutEcrire && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700"
          >
            <Plus size={16} />
            Nouvelle collecte
          </button>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <p className="text-sm text-gray-500">Total collectes</p>
            <p className="text-2xl font-bold text-teal-700">{stats.totalCollectes}</p>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <p className="text-sm text-gray-500">Quantité totale</p>
            <p className="text-2xl font-bold text-teal-700">{stats.totalQuantite} kg</p>
          </div>
        </div>
      )}

      {/* Modal création */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Nouvelle collecte</h2>
              <button type="button" aria-label="Fermer" onClick={() => setShowForm(false)}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="r-type" className="text-sm text-gray-600">Type de déchet *</label>
                <input
                  id="r-type"
                  type="text"
                  value={form.typeDechet}
                  onChange={(e) => setForm({ ...form, typeDechet: e.target.value })}
                  placeholder="ex: plastique_pp, carton"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label htmlFor="r-qte" className="text-sm text-gray-600">Quantité *</label>
                <input
                  id="r-qte"
                  type="number"
                  value={form.quantite}
                  onChange={(e) => setForm({ ...form, quantite: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label htmlFor="r-unite" className="text-sm text-gray-600">Unité</label>
                <select
                  id="r-unite"
                  value={form.unite}
                  onChange={(e) => setForm({ ...form, unite: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="kg">kg</option>
                  <option value="tonne">tonne</option>
                  <option value="litre">litre</option>
                  <option value="m3">m³</option>
                  <option value="unité">unité</option>
                </select>
              </div>
              <div className="col-span-2">
                <label htmlFor="r-collecteur" className="text-sm text-gray-600">Collecteur</label>
                <input
                  id="r-collecteur"
                  type="text"
                  value={form.collecteur}
                  onChange={(e) => setForm({ ...form, collecteur: e.target.value })}
                  placeholder="Nom du collecteur / entreprise"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button
                type="button"
                onClick={() => creerMutation.mutate({ ...form, quantite: parseFloat(form.quantite) })}
                disabled={!form.typeDechet || !form.quantite || creerMutation.isPending}
                className="flex-1 bg-teal-600 text-white py-2 rounded-lg text-sm hover:bg-teal-700 disabled:opacity-50"
              >
                {creerMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste collectes */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[580px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Quantité</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Collecteur</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Statut</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
                <th scope="col" className="px-4 py-3 sr-only">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.items?.map((c: {
                id: string;
                typeDechet: string;
                quantite: number;
                unite?: string;
                collecteur?: string;
                statut: string;
                dateCollecte: string;
              }) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Recycle size={14} className="text-teal-600" />
                      <span className="text-sm font-medium text-gray-800">{c.typeDechet}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {c.quantite} {c.unite || 'kg'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{c.collecteur || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${STATUTS_COULEURS[c.statut] ?? 'bg-teal-50 text-teal-700'}`}>
                      {STATUTS_LABELS[c.statut] ?? c.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(c.dateCollecte).toLocaleDateString('fr-SN')}
                  </td>
                  <td className="px-4 py-3">
                    {peutEcrire && c.statut === 'planifiee' && (
                      <button
                        type="button"
                        aria-label="Marquer comme complétée"
                        title="Compléter"
                        onClick={() => changerStatutMutation.mutate({ id: c.id, statut: 'completee' })}
                        className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600"
                      >
                        <CheckCircle2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {data?.items?.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">Aucune collecte enregistrée</div>
          )}
        </div>
      )}
    </div>
  );
}
