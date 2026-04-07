'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Plus, Search, Pencil, Trash2, X, Layers, AlertTriangle, ArrowDown, ArrowUp, SlidersHorizontal } from 'lucide-react';

interface Fournisseur { id: string; nom: string; reference: string; }

interface MatierePremiere {
  id: string;
  reference: string;
  nom: string;
  type: string;
  unite: string;
  stockActuel: number;
  stockMinimum: number;
  prixAchat: number;
  isRecycle: boolean;
  critique: boolean;
  fournisseur?: Fournisseur;
}

const FORM_VIDE = {
  reference: '', nom: '', type: '', fournisseurId: '',
  unite: 'kg', prixAchat: '', stockMinimum: '', isRecycle: false,
};

const FORM_STOCK_VIDE = { quantite: '', type: 'entree' as 'entree' | 'sortie' | 'ajustement', motif: '' };

export default function MatieresPremiereesPage() {
  const [search, setSearch] = useState('');
  const [filtreCritique, setFiltreCritique] = useState(false);
  const [modal, setModal] = useState<'create' | 'edit' | 'stock' | null>(null);
  const [selected, setSelected] = useState<MatierePremiere | null>(null);
  const [formData, setFormData] = useState(FORM_VIDE);
  const [formStock, setFormStock] = useState(FORM_STOCK_VIDE);
  const [confirmDelete, setConfirmDelete] = useState<MatierePremiere | null>(null);
  const qc = useQueryClient();
  const toast = useToast();

  const { data: mpData, isLoading } = useQuery({
    queryKey: ['matieres-premieres', search, filtreCritique],
    queryFn: async () =>
      (await api.get('/matieres-premieres', { params: { search, critique: filtreCritique || undefined, limite: 50 } })).data,
  });

  const { data: fournisseursData } = useQuery({
    queryKey: ['fournisseurs-select'],
    queryFn: async () => (await api.get('/fournisseurs', { params: { limite: 100 } })).data,
  });

  const creerMutation = useMutation({
    mutationFn: (d: typeof formData) => api.post('/matieres-premieres', {
      ...d,
      prixAchat: d.prixAchat ? +d.prixAchat : undefined,
      stockMinimum: d.stockMinimum ? +d.stockMinimum : undefined,
      fournisseurId: d.fournisseurId || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['matieres-premieres'] }); fermerModal(); toast.success('Matière première créée'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erreur lors de la création'),
  });

  const modifierMutation = useMutation({
    mutationFn: (d: typeof formData) => api.put(`/matieres-premieres/${selected!.id}`, {
      ...d,
      prixAchat: d.prixAchat ? +d.prixAchat : undefined,
      stockMinimum: d.stockMinimum ? +d.stockMinimum : undefined,
      fournisseurId: d.fournisseurId || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['matieres-premieres'] }); fermerModal(); toast.success('Matière première mise à jour'); },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const stockMutation = useMutation({
    mutationFn: (d: typeof formStock) => api.patch(`/matieres-premieres/${selected!.id}/stock`, {
      quantite: +d.quantite,
      type: d.type,
      motif: d.motif || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['matieres-premieres'] }); fermerModal(); toast.success('Stock mis à jour'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erreur lors de l\'ajustement'),
  });

  const supprimerMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/matieres-premieres/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['matieres-premieres'] }); setConfirmDelete(null); toast.success('Matière première supprimée'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Impossible de supprimer'),
  });

  const ouvrirCreation = () => { setFormData(FORM_VIDE); setSelected(null); setModal('create'); };
  const ouvrirEdition = (mp: MatierePremiere) => {
    setSelected(mp);
    setFormData({
      reference: mp.reference, nom: mp.nom, type: mp.type,
      fournisseurId: mp.fournisseur?.id ?? '',
      unite: mp.unite, prixAchat: mp.prixAchat?.toString() ?? '',
      stockMinimum: mp.stockMinimum?.toString() ?? '', isRecycle: mp.isRecycle,
    });
    setModal('edit');
  };
  const ouvrirStock = (mp: MatierePremiere) => { setSelected(mp); setFormStock(FORM_STOCK_VIDE); setModal('stock'); };
  const fermerModal = () => { setModal(null); setSelected(null); };
  const soumettre = () => modal === 'create' ? creerMutation.mutate(formData) : modifierMutation.mutate(formData);
  const isPending = creerMutation.isPending || modifierMutation.isPending;

  const nbCritique = mpData?.items?.filter((m: MatierePremiere) => m.critique).length ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Matières Premières</h1>
          {nbCritique > 0 && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
              <AlertTriangle size={12} /> {nbCritique} MP sous seuil minimum
            </p>
          )}
        </div>
        <button type="button" onClick={ouvrirCreation}
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
          <Plus size={16} /> Nouvelle MP
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une matière première..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="button" onClick={() => setFiltreCritique(!filtreCritique)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-colors ${filtreCritique ? 'bg-red-50 border-red-300 text-red-700' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
          <AlertTriangle size={14} /> Stocks critiques
        </button>
      </div>

      {/* Liste */}
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
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Matière première</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Fournisseur</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Stock actuel</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Stock min.</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Prix achat</th>
                  <th scope="col" className="px-4 py-3 sr-only">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mpData?.items?.map((mp: MatierePremiere) => (
                  <tr key={mp.id} className={`hover:bg-gray-50 ${mp.critique ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${mp.critique ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          <Layers size={14} />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-800 flex items-center gap-1">
                            {mp.nom}
                            {mp.isRecycle && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded">recyclé</span>}
                          </p>
                          <p className="text-xs text-gray-400">{mp.reference}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{mp.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{mp.fournisseur?.nom ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-sm font-semibold ${mp.critique ? 'text-red-600' : 'text-gray-800'}`}>
                        {Number(mp.stockActuel).toLocaleString('fr-FR')} {mp.unite}
                      </span>
                      {mp.critique && <AlertTriangle size={12} className="text-red-500 inline ml-1" />}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-500">
                      {Number(mp.stockMinimum).toLocaleString('fr-FR')} {mp.unite}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {Number(mp.prixAchat).toLocaleString('fr-FR')} FCFA
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button type="button" title="Mouvement stock" onClick={() => ouvrirStock(mp)}
                          className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600">
                          <SlidersHorizontal size={14} />
                        </button>
                        <button type="button" aria-label="Modifier" onClick={() => ouvrirEdition(mp)}
                          className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                          <Pencil size={14} />
                        </button>
                        <button type="button" aria-label="Supprimer" onClick={() => setConfirmDelete(mp)}
                          className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {mpData?.items?.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">Aucune matière première trouvée</div>
          )}
        </div>
      )}

      {/* Modal création / édition */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-800">
                {modal === 'create' ? 'Nouvelle matière première' : 'Modifier la matière première'}
              </h2>
              <button type="button" aria-label="Fermer" onClick={fermerModal}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {([
                { label: 'Référence *', key: 'reference', type: 'text', col: 1 },
                { label: 'Type *', key: 'type', type: 'text', col: 1 },
                { label: 'Nom *', key: 'nom', type: 'text', col: 2 },
                { label: 'Unité (kg, L…)', key: 'unite', type: 'text', col: 1 },
                { label: 'Prix achat (FCFA)', key: 'prixAchat', type: 'number', col: 1 },
                { label: 'Stock minimum', key: 'stockMinimum', type: 'number', col: 1 },
              ] as { label: string; key: string; type: string; col: number }[]).map(({ label, key, type, col }) => (
                <div key={key} className={col === 2 ? 'col-span-2' : ''}>
                  <label htmlFor={`field-${key}`} className="text-sm text-gray-600">{label}</label>
                  <input id={`field-${key}`} type={type}
                    value={formData[key as keyof typeof formData] as string}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label htmlFor="field-fournisseur" className="text-sm text-gray-600">Fournisseur</label>
                <select id="field-fournisseur" value={formData.fournisseurId}
                  onChange={(e) => setFormData({ ...formData, fournisseurId: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">— Sans fournisseur —</option>
                  {fournisseursData?.items?.map((f: Fournisseur) => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="field-isRecycle" checked={formData.isRecycle}
                  onChange={(e) => setFormData({ ...formData, isRecycle: e.target.checked })}
                  className="rounded border-gray-300" />
                <label htmlFor="field-isRecycle" className="text-sm text-gray-600">Matière recyclée</label>
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button type="button" onClick={soumettre}
                disabled={!formData.reference || !formData.nom || !formData.type || isPending}
                className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50">
                {isPending ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={fermerModal}
                className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal mouvement de stock */}
      {modal === 'stock' && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="font-semibold text-gray-800">Mouvement de stock</h2>
                <p className="text-xs text-gray-400">{selected.nom} — Stock actuel : <strong>{Number(selected.stockActuel)} {selected.unite}</strong></p>
              </div>
              <button type="button" aria-label="Fermer" onClick={fermerModal}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-600">Type de mouvement</label>
                <div className="flex gap-2 mt-1">
                  {(['entree', 'sortie', 'ajustement'] as const).map((t) => (
                    <button key={t} type="button"
                      onClick={() => setFormStock({ ...formStock, type: t })}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-1
                        ${formStock.type === t ? (t === 'entree' ? 'bg-green-600 text-white border-green-600' : t === 'sortie' ? 'bg-red-600 text-white border-red-600' : 'bg-blue-600 text-white border-blue-600') : 'hover:bg-gray-50'}`}>
                      {t === 'entree' ? <ArrowDown size={12} /> : t === 'sortie' ? <ArrowUp size={12} /> : <SlidersHorizontal size={12} />}
                      {t === 'entree' ? 'Entrée' : t === 'sortie' ? 'Sortie' : 'Ajustement'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="field-qte" className="text-sm text-gray-600">
                  {formStock.type === 'ajustement' ? 'Nouveau stock' : 'Quantité'} ({selected.unite}) *
                </label>
                <input id="field-qte" type="number" min="0" value={formStock.quantite}
                  onChange={(e) => setFormStock({ ...formStock, quantite: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="field-motif" className="text-sm text-gray-600">Motif</label>
                <input id="field-motif" type="text" value={formStock.motif}
                  onChange={(e) => setFormStock({ ...formStock, motif: e.target.value })}
                  placeholder="Ex: Livraison fournisseur, retour production..."
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button type="button"
                onClick={() => stockMutation.mutate(formStock)}
                disabled={!formStock.quantite || stockMutation.isPending}
                className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50">
                {stockMutation.isPending ? 'Enregistrement...' : 'Valider le mouvement'}
              </button>
              <button type="button" onClick={fermerModal}
                className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Supprimer cette MP ?</h3>
            <p className="text-sm text-gray-500 mb-5"><strong>{confirmDelete.nom}</strong> sera supprimée (stock doit être à 0).</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => supprimerMutation.mutate(confirmDelete.id)}
                disabled={supprimerMutation.isPending}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
                {supprimerMutation.isPending ? 'Suppression...' : 'Supprimer'}
              </button>
              <button type="button" onClick={() => setConfirmDelete(null)}
                className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
