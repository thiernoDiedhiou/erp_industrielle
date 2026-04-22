'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { AlertTriangle, Package, TrendingDown, Plus, Pencil, ClipboardList, X } from 'lucide-react';
import { usePermissions } from '@/lib/permissions-context';

interface MatierePremiere {
  id: string;
  nom: string;
  reference?: string;
  stockActuel: number;
  stockMinimum?: number;
  unite?: string;
  fournisseur?: { nom: string };
}

const FORM_VIDE = { nom: '', reference: '', unite: 'kg', stockActuel: '', stockMinimum: '', fournisseur: '' };

export default function StockPage() {
  const [modal, setModal] = useState<'create' | 'edit' | 'inventaire' | null>(null);
  const [selected, setSelected] = useState<MatierePremiere | null>(null);
  const [form, setForm] = useState(FORM_VIDE);
  const [stockReel, setStockReel] = useState('');
  const queryClient = useQueryClient();
  const toast = useToast();
  const { peutEcrire } = usePermissions('stock');

  const { data, isLoading } = useQuery({
    queryKey: ['stock-tableau-bord'],
    queryFn: async () => {
      const { data } = await api.get('/stock/tableau-bord');
      return data;
    },
  });

  const creerMutation = useMutation({
    mutationFn: (d: object) => api.post('/matieres-premieres', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-tableau-bord'] });
      fermerModal();
      toast.success('Matière première créée');
    },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const modifierMutation = useMutation({
    mutationFn: (d: object) => api.put(`/matieres-premieres/${selected!.id}`, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-tableau-bord'] });
      fermerModal();
      toast.success('Matière mise à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const inventaireMutation = useMutation({
    mutationFn: ({ id, stockReel }: { id: string; stockReel: number }) =>
      api.patch(`/matieres-premieres/${id}/stock`, { quantite: stockReel, type: 'ajustement', motif: 'Inventaire' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-tableau-bord'] });
      fermerModal();
      toast.success('Inventaire enregistré');
    },
    onError: () => toast.error('Erreur lors de l\'inventaire'),
  });

  const ouvrirCreation = () => {
    setForm(FORM_VIDE);
    setSelected(null);
    setModal('create');
  };

  const ouvrirEdition = (m: MatierePremiere) => {
    setSelected(m);
    setForm({
      nom: m.nom,
      reference: m.reference ?? '',
      unite: m.unite ?? 'kg',
      stockActuel: String(m.stockActuel),
      stockMinimum: String(m.stockMinimum ?? ''),
      fournisseur: m.fournisseur?.nom ?? '',
    });
    setModal('edit');
  };

  const ouvrirInventaire = (m: MatierePremiere) => {
    setSelected(m);
    setStockReel(String(m.stockActuel));
    setModal('inventaire');
  };

  const fermerModal = () => {
    setModal(null);
    setSelected(null);
    setForm(FORM_VIDE);
    setStockReel('');
  };

  const soumettre = () => {
    const payload = {
      nom: form.nom,
      reference: form.reference || undefined,
      unite: form.unite,
      stockActuel: Number(form.stockActuel),
      stockMinimum: form.stockMinimum ? Number(form.stockMinimum) : undefined,
    };
    if (modal === 'create') creerMutation.mutate(payload);
    else modifierMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
      </div>
    );
  }

  const alertes: MatierePremiere[] = data?.alertes || [];
  const matieres: MatierePremiere[] = data?.matieres || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Gestion du stock</h1>
        {peutEcrire && (
          <button
            type="button"
            onClick={ouvrirCreation}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800"
          >
            <Plus size={16} />
            Nouvelle matière
          </button>
        )}
      </div>

      {/* Alertes */}
      {alertes.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-red-600" />
            <h2 className="font-semibold text-red-800">
              {alertes.length} matière(s) sous le seuil minimum
            </h2>
          </div>
          <div className="space-y-1">
            {alertes.map((m) => (
              <div key={m.id} className="flex justify-between text-sm text-red-700">
                <span>{m.nom}</span>
                <span>{m.stockActuel} {m.unite} (min: {m.stockMinimum})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
          <Package size={16} className="text-gray-500" />
          <h2 className="font-semibold text-gray-700">Matières premières</h2>
          <span className="ml-auto text-xs text-gray-400">{matieres.length} articles</span>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[620px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Matière</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Fournisseur</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Stock actuel</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Seuil min</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">État</th>
              <th scope="col" className="px-4 py-3 sr-only">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {matieres.map((m) => {
              const enAlerte = m.stockActuel <= (m.stockMinimum ?? 0);
              return (
                <tr key={m.id} className={`hover:bg-gray-50 ${enAlerte ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm text-gray-800">{m.nom}</p>
                    {m.reference && <p className="text-xs text-gray-400">{m.reference}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{m.fournisseur?.nom || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold text-sm ${enAlerte ? 'text-red-600' : 'text-gray-800'}`}>
                      {m.stockActuel}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">{m.unite}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-500">{m.stockMinimum ?? '-'}</td>
                  <td className="px-4 py-3">
                    {enAlerte ? (
                      <span className="flex items-center gap-1 text-xs text-red-600">
                        <TrendingDown size={12} /> Alerte
                      </span>
                    ) : (
                      <span className="text-xs text-green-600">Normal</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {peutEcrire && (
                        <button
                          type="button"
                          aria-label="Faire l'inventaire"
                          onClick={() => ouvrirInventaire(m)}
                          className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600"
                          title="Inventaire"
                        >
                          <ClipboardList size={14} />
                        </button>
                      )}
                      {peutEcrire && (
                        <button
                          type="button"
                          aria-label="Modifier"
                          onClick={() => ouvrirEdition(m)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        {matieres.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">Aucune matière première</div>
        )}
      </div>

      {/* Modal création / édition */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">
                {modal === 'create' ? 'Nouvelle matière première' : 'Modifier la matière'}
              </h2>
              <button type="button" aria-label="Fermer" onClick={fermerModal}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { id: 'f-nom', label: 'Nom *', key: 'nom', type: 'text' },
                { id: 'f-ref', label: 'Référence', key: 'reference', type: 'text' },
                { id: 'f-unite', label: 'Unité', key: 'unite', type: 'text' },
                { id: 'f-stock', label: 'Stock actuel', key: 'stockActuel', type: 'number' },
                { id: 'f-min', label: 'Seuil minimum', key: 'stockMinimum', type: 'number' },
              ].map(({ id, label, key, type }) => (
                <div key={key}>
                  <label htmlFor={id} className="text-sm text-gray-600">{label}</label>
                  <input
                    id={id}
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button
                type="button"
                onClick={soumettre}
                disabled={!form.nom || creerMutation.isPending || modifierMutation.isPending}
                className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50"
              >
                {creerMutation.isPending || modifierMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={fermerModal} className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal inventaire */}
      {modal === 'inventaire' && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Inventaire — {selected.nom}</h2>
              <button type="button" aria-label="Fermer" onClick={fermerModal}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">
                Stock actuel enregistré : <strong>{selected.stockActuel} {selected.unite}</strong>
              </p>
              <div>
                <label htmlFor="stock-reel" className="text-sm text-gray-600">Stock réel constaté ({selected.unite})</label>
                <input
                  id="stock-reel"
                  type="number"
                  value={stockReel}
                  onChange={(e) => setStockReel(e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button
                type="button"
                onClick={() => inventaireMutation.mutate({ id: selected.id, stockReel: Number(stockReel) })}
                disabled={!stockReel || inventaireMutation.isPending}
                className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50"
              >
                {inventaireMutation.isPending ? 'Enregistrement...' : 'Valider l\'inventaire'}
              </button>
              <button type="button" onClick={fermerModal} className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
