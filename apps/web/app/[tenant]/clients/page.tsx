'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Plus, Search, Phone, Mail, Building, Pencil, Trash2, X } from 'lucide-react';

interface Client {
  id: string;
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  statut?: string;
  ninea?: string;
}

const FORM_VIDE = { nom: '', email: '', telephone: '', adresse: '', ninea: '' };

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Client | null>(null);
  const [formData, setFormData] = useState(FORM_VIDE);
  const [confirmDelete, setConfirmDelete] = useState<Client | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['clients', search],
    queryFn: async () => {
      const { data } = await api.get('/crm/clients', { params: { search, limite: 50 } });
      return data;
    },
  });

  const creerMutation = useMutation({
    mutationFn: (d: typeof formData) => api.post('/crm/clients', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      fermerModal();
      toast.success('Client créé avec succès');
    },
    onError: () => toast.error('Erreur lors de la création du client'),
  });

  const modifierMutation = useMutation({
    mutationFn: (d: typeof formData) => api.put(`/crm/clients/${selected!.id}`, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      fermerModal();
      toast.success('Client mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const supprimerMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/crm/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setConfirmDelete(null);
      toast.success('Client supprimé');
    },
    onError: () => toast.error('Impossible de supprimer ce client'),
  });

  const ouvrirCreation = () => {
    setFormData(FORM_VIDE);
    setSelected(null);
    setModal('create');
  };

  const ouvrirEdition = (client: Client) => {
    setSelected(client);
    setFormData({
      nom: client.nom,
      email: client.email ?? '',
      telephone: client.telephone ?? '',
      adresse: client.adresse ?? '',
      ninea: client.ninea ?? '',
    });
    setModal('edit');
  };

  const fermerModal = () => {
    setModal(null);
    setSelected(null);
    setFormData(FORM_VIDE);
  };

  const soumettre = () => {
    if (modal === 'create') creerMutation.mutate(formData);
    else modifierMutation.mutate(formData);
  };

  const isPending = creerMutation.isPending || modifierMutation.isPending;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Clients</h1>
        <button
          type="button"
          onClick={ouvrirCreation}
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800"
        >
          <Plus size={16} />
          Nouveau client
        </button>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un client..."
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
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Nom</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Contact</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Adresse</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Statut</th>
                <th scope="col" className="px-4 py-3 sr-only">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.items?.map((client: Client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                        {client.nom.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-800">{client.nom}</p>
                        {client.ninea && <p className="text-xs text-gray-400">NINEA: {client.ninea}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      {client.email && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Mail size={11} /> {client.email}
                        </div>
                      )}
                      {client.telephone && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone size={11} /> {client.telephone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {client.adresse && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Building size={11} /> {client.adresse}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-50 text-green-700">
                      {client.statut || 'actif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        aria-label="Modifier"
                        onClick={() => ouvrirEdition(client)}
                        className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label="Supprimer"
                        onClick={() => setConfirmDelete(client)}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                      >
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
            <div className="text-center py-8 text-gray-400 text-sm">Aucun client trouvé</div>
          )}
        </div>
      )}

      {/* Modal création / édition */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">
                {modal === 'create' ? 'Nouveau client' : 'Modifier le client'}
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
                { label: 'NINEA', key: 'ninea', type: 'text' },
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
              <div className="col-span-2">
                <label htmlFor="field-adresse" className="text-sm text-gray-600">Adresse</label>
                <input
                  id="field-adresse"
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button
                type="button"
                onClick={soumettre}
                disabled={!formData.nom || isPending}
                className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50"
              >
                {isPending ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                type="button"
                onClick={fermerModal}
                className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50"
              >
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
            <h3 className="font-semibold text-gray-800 mb-1">Supprimer ce client ?</h3>
            <p className="text-sm text-gray-500 mb-5">
              <strong>{confirmDelete.nom}</strong> sera définitivement supprimé.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => supprimerMutation.mutate(confirmDelete.id)}
                disabled={supprimerMutation.isPending}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
              >
                {supprimerMutation.isPending ? 'Suppression...' : 'Supprimer'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50"
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
