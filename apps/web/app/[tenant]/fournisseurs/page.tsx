'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Plus, Search, Phone, Mail, Globe, Pencil, Trash2, X, Truck, ToggleLeft, ToggleRight } from 'lucide-react';

interface Fournisseur {
  id: string;
  reference: string;
  nom: string;
  email?: string;
  telephone?: string;
  pays: string;
  actif: boolean;
  _count?: { matieresPrmieres: number };
}

const FORM_VIDE = { nom: '', email: '', telephone: '', pays: 'SN' };

export default function FournisseursPage() {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Fournisseur | null>(null);
  const [formData, setFormData] = useState(FORM_VIDE);
  const [confirmDelete, setConfirmDelete] = useState<Fournisseur | null>(null);
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['fournisseurs', search],
    queryFn: async () => (await api.get('/fournisseurs', { params: { search, limite: 50 } })).data,
  });

  const creerMutation = useMutation({
    mutationFn: (d: typeof formData) => api.post('/fournisseurs', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fournisseurs'] }); fermerModal(); toast.success('Fournisseur créé'); },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const modifierMutation = useMutation({
    mutationFn: (d: typeof formData) => api.put(`/fournisseurs/${selected!.id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fournisseurs'] }); fermerModal(); toast.success('Fournisseur mis à jour'); },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const supprimerMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/fournisseurs/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fournisseurs'] }); setConfirmDelete(null); toast.success('Fournisseur supprimé'); },
    onError: () => toast.error('Impossible — des matières premières sont liées'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/fournisseurs/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fournisseurs'] }),
  });

  const ouvrirCreation = () => { setFormData(FORM_VIDE); setSelected(null); setModal('create'); };
  const ouvrirEdition = (f: Fournisseur) => {
    setSelected(f);
    setFormData({ nom: f.nom, email: f.email ?? '', telephone: f.telephone ?? '', pays: f.pays });
    setModal('edit');
  };
  const fermerModal = () => { setModal(null); setSelected(null); setFormData(FORM_VIDE); };
  const soumettre = () => modal === 'create' ? creerMutation.mutate(formData) : modifierMutation.mutate(formData);
  const isPending = creerMutation.isPending || modifierMutation.isPending;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Fournisseurs</h1>
        <button
          type="button"
          onClick={ouvrirCreation}
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800"
        >
          <Plus size={16} /> Nouveau fournisseur
        </button>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un fournisseur..."
          className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Fournisseur</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Contact</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Pays</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">MP liées</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Statut</th>
                  <th scope="col" className="px-4 py-3 sr-only">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.items?.map((f: Fournisseur) => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                          <Truck size={14} />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-800">{f.nom}</p>
                          <p className="text-xs text-gray-400">{f.reference}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {f.email && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail size={11} /> {f.email}
                          </div>
                        )}
                        {f.telephone && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Phone size={11} /> {f.telephone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Globe size={11} /> {f.pays}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-700">
                        {f._count?.matieresPrmieres ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => toggleMutation.mutate(f.id)}>
                        {f.actif
                          ? <span className="px-2 py-1 rounded-full text-xs bg-green-50 text-green-700 flex items-center gap-1"><ToggleRight size={12} /> Actif</span>
                          : <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-500 flex items-center gap-1"><ToggleLeft size={12} /> Inactif</span>
                        }
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button type="button" aria-label="Modifier" onClick={() => ouvrirEdition(f)}
                          className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                          <Pencil size={14} />
                        </button>
                        <button type="button" aria-label="Supprimer" onClick={() => setConfirmDelete(f)}
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
          {data?.items?.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">Aucun fournisseur trouvé</div>
          )}
        </div>
      )}

      {/* Modal création / édition */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">
                {modal === 'create' ? 'Nouveau fournisseur' : 'Modifier le fournisseur'}
              </h2>
              <button type="button" aria-label="Fermer" onClick={fermerModal}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: 'Nom *', key: 'nom', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Téléphone', key: 'telephone', type: 'tel' },
                { label: 'Pays', key: 'pays', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label htmlFor={`field-${key}`} className="text-sm text-gray-600">{label}</label>
                  <input
                    id={`field-${key}`}
                    type={type}
                    value={formData[key as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button type="button" onClick={soumettre} disabled={!formData.nom || isPending}
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

      {/* Confirmation suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Supprimer ce fournisseur ?</h3>
            <p className="text-sm text-gray-500 mb-5">
              <strong>{confirmDelete.nom}</strong> sera définitivement supprimé.
            </p>
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
