'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Plus, Search, Phone, Mail, MapPin, Pencil, Trash2, X, Eye } from 'lucide-react';
import { usePermissions } from '@/lib/permissions-context';

const TYPES_CLIENT = ['industriel', 'agricole', 'alimentaire', 'distributeur', 'autre'] as const;

const TYPE_STYLES: Record<string, string> = {
  industriel:   'bg-blue-50 text-blue-700',
  agricole:     'bg-green-50 text-green-700',
  alimentaire:  'bg-orange-50 text-orange-700',
  distributeur: 'bg-purple-50 text-purple-700',
  autre:        'bg-gray-100 text-gray-600',
};

const STATUT_STYLES: Record<string, string> = {
  actif:    'bg-green-50 text-green-700',
  inactif:  'bg-gray-100 text-gray-500',
  prospect: 'bg-yellow-50 text-yellow-700',
};

interface Client {
  id: string;
  nom: string;
  type?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  ninea?: string;
  statut?: string;
  contact?: string;
  commercialId?: string;
  plafondCredit?: number;
  delaiPaiement?: number;
}

const FORM_VIDE = {
  nom: '', type: '', email: '', telephone: '',
  adresse: '', ville: '', ninea: '', statut: 'actif',
  contact: '', commercialId: '',
  plafondCredit: '', delaiPaiement: '',
};

export default function ClientsPage() {
  const params = useParams();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filtreType, setFiltreType] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Client | null>(null);
  const [formData, setFormData] = useState(FORM_VIDE);
  const [confirmDelete, setConfirmDelete] = useState<Client | null>(null);
  const qc = useQueryClient();
  const toast = useToast();
  const { peutEcrire, peutSupprimer } = usePermissions('crm');

  const { data, isLoading } = useQuery({
    queryKey: ['clients', search, filtreType],
    queryFn: async () =>
      (await api.get('/crm/clients', { params: { search, type: filtreType || undefined, limite: 50 } })).data,
  });

  const creerMutation = useMutation({
    mutationFn: (d: typeof formData) => api.post('/crm/clients', {
      ...d,
      plafondCredit: d.plafondCredit ? +d.plafondCredit : undefined,
      delaiPaiement: d.delaiPaiement ? +d.delaiPaiement : undefined,
      type: d.type || undefined,
      commercialId: d.commercialId || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); fermerModal(); toast.success('Client créé'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erreur lors de la création'),
  });

  const modifierMutation = useMutation({
    mutationFn: (d: typeof formData) => api.put(`/crm/clients/${selected!.id}`, {
      ...d,
      plafondCredit: d.plafondCredit ? +d.plafondCredit : undefined,
      delaiPaiement: d.delaiPaiement ? +d.delaiPaiement : undefined,
      type: d.type || undefined,
      commercialId: d.commercialId || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); fermerModal(); toast.success('Client mis à jour'); },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const supprimerMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/crm/clients/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); setConfirmDelete(null); toast.success('Client archivé'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Impossible de supprimer ce client'),
  });

  const ouvrirCreation = () => { setFormData(FORM_VIDE); setSelected(null); setModal('create'); };
  const ouvrirEdition = (c: Client) => {
    setSelected(c);
    setFormData({
      nom: c.nom, type: c.type ?? '', email: c.email ?? '',
      telephone: c.telephone ?? '', adresse: c.adresse ?? '',
      ville: c.ville ?? '', ninea: c.ninea ?? '', statut: c.statut ?? 'actif',
      contact: c.contact ?? '', commercialId: c.commercialId ?? '',
      plafondCredit: c.plafondCredit?.toString() ?? '',
      delaiPaiement: c.delaiPaiement?.toString() ?? '',
    });
    setModal('edit');
  };
  const fermerModal = () => { setModal(null); setSelected(null); setFormData(FORM_VIDE); };
  const soumettre = () => modal === 'create' ? creerMutation.mutate(formData) : modifierMutation.mutate(formData);
  const isPending = creerMutation.isPending || modifierMutation.isPending;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Clients</h1>
        {peutEcrire && (
          <button type="button" onClick={ouvrirCreation}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
            <Plus size={16} /> Nouveau client
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client, email, ville..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select aria-label="Filtrer par type" value={filtreType} onChange={(e) => setFiltreType(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">Tous les types</option>
          {TYPES_CLIENT.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Nom</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Ville</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Contact</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Statut</th>
                  <th scope="col" className="px-4 py-3 sr-only">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.items?.map((c: Client) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {c.nom.charAt(0)}
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => router.push(`/${params.tenant}/clients/${c.id}`)}
                            className="font-medium text-sm text-gray-800 hover:text-blue-700 hover:underline text-left"
                          >
                            {c.nom}
                          </button>
                          {c.ninea && <p className="text-xs text-gray-400">NINEA: {c.ninea}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {c.type ? (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${TYPE_STYLES[c.type] ?? 'bg-gray-100 text-gray-600'}`}>
                          {c.type}
                        </span>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {c.ville ? (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin size={10} /> {c.ville}
                        </div>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {c.email && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail size={10} /> {c.email}
                          </div>
                        )}
                        {c.telephone && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Phone size={10} /> {c.telephone}
                          </div>
                        )}
                        {c.contact && <p className="text-xs text-gray-400">{c.contact}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUT_STYLES[c.statut ?? 'actif'] ?? 'bg-gray-100 text-gray-600'}`}>
                        {c.statut ?? 'actif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button type="button" aria-label={`Voir ${c.nom}`}
                          onClick={() => router.push(`/${params.tenant}/clients/${c.id}`)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                          <Eye size={14} />
                        </button>
                        {peutEcrire && (
                          <button type="button" aria-label={`Modifier ${c.nom}`} onClick={() => ouvrirEdition(c)}
                            className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                            <Pencil size={14} />
                          </button>
                        )}
                        {peutSupprimer && (
                          <button type="button" aria-label={`Supprimer ${c.nom}`} onClick={() => setConfirmDelete(c)}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        )}
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-800">
                {modal === 'create' ? 'Nouveau client' : 'Modifier le client'}
              </h2>
              <button type="button" aria-label="Fermer" onClick={fermerModal}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="field-nom" className="text-sm text-gray-600">Nom *</label>
                <input id="field-nom" type="text" value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="field-type" className="text-sm text-gray-600">Type de client</label>
                <select id="field-type" value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">— Sélectionner —</option>
                  {TYPES_CLIENT.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="field-statut" className="text-sm text-gray-600">Statut</label>
                <select id="field-statut" value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="actif">Actif</option>
                  <option value="prospect">Prospect</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
              <div>
                <label htmlFor="field-email" className="text-sm text-gray-600">Email</label>
                <input id="field-email" type="email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="field-telephone" className="text-sm text-gray-600">Téléphone</label>
                <input id="field-telephone" type="tel" value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="field-contact" className="text-sm text-gray-600">Contact principal</label>
                <input id="field-contact" type="text" value={formData.contact}
                  placeholder="Mamadou Diallo"
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="field-ninea" className="text-sm text-gray-600">NINEA</label>
                <input id="field-ninea" type="text" value={formData.ninea}
                  onChange={(e) => setFormData({ ...formData, ninea: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label htmlFor="field-adresse" className="text-sm text-gray-600">Adresse</label>
                <input id="field-adresse" type="text" value={formData.adresse}
                  placeholder="Zone Industrielle, Dakar"
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="field-ville" className="text-sm text-gray-600">Ville</label>
                <input id="field-ville" type="text" value={formData.ville}
                  placeholder="Dakar"
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="field-plafond" className="text-sm text-gray-600">Plafond crédit (FCFA)</label>
                <input id="field-plafond" type="number" min="0" value={formData.plafondCredit}
                  onChange={(e) => setFormData({ ...formData, plafondCredit: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="field-delai" className="text-sm text-gray-600">Délai paiement (jours)</label>
                <input id="field-delai" type="number" min="0" max="365" value={formData.delaiPaiement}
                  onChange={(e) => setFormData({ ...formData, delaiPaiement: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button type="button" onClick={soumettre}
                disabled={!formData.nom || isPending}
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
            <h3 className="font-semibold text-gray-800 mb-1">Archiver ce client ?</h3>
            <p className="text-sm text-gray-500 mb-5">
              <strong>{confirmDelete.nom}</strong> sera archivé (les données sont conservées).
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => supprimerMutation.mutate(confirmDelete.id)}
                disabled={supprimerMutation.isPending}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
                {supprimerMutation.isPending ? 'Archivage...' : 'Archiver'}
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
