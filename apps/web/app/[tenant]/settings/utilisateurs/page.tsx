'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import {
  Plus, Search, Pencil, Trash2, X, UserCheck, UserX,
  KeyRound, Shield, CheckCircle, XCircle,
} from 'lucide-react';

const ROLES = [
  { value: 'admin',       label: 'Administrateur',  color: 'bg-red-50 text-red-700' },
  { value: 'direction',   label: 'Direction',        color: 'bg-purple-50 text-purple-700' },
  { value: 'commercial',  label: 'Commercial',       color: 'bg-blue-50 text-blue-700' },
  { value: 'production',  label: 'Production',       color: 'bg-orange-50 text-orange-700' },
  { value: 'magasinier',  label: 'Magasinier',       color: 'bg-yellow-50 text-yellow-700' },
  { value: 'comptable',   label: 'Comptable',        color: 'bg-green-50 text-green-700' },
] as const;

const roleConfig = Object.fromEntries(ROLES.map((r) => [r.value, r]));

interface Utilisateur {
  id: string;
  nom: string;
  prenom?: string;
  email: string;
  role: string;
  telephone?: string;
  actif: boolean;
  derniereConnexion?: string;
  createdAt: string;
}

const FORM_VIDE = {
  nom: '', prenom: '', email: '', password: '',
  role: 'commercial', telephone: '',
};

const fmt = (d?: string) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const initiales = (u: Utilisateur) =>
  `${u.nom.charAt(0)}${u.prenom?.charAt(0) ?? ''}`.toUpperCase();

export default function UtilisateursPage() {
  const [search, setSearch] = useState('');
  const [filtreRole, setFiltreRole] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Utilisateur | null>(null);
  const [formData, setFormData] = useState(FORM_VIDE);
  const [confirmDelete, setConfirmDelete] = useState<Utilisateur | null>(null);
  const [motDePasseTemp, setMotDePasseTemp] = useState<string | null>(null);
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['utilisateurs', search, filtreRole],
    queryFn: async () =>
      (await api.get('/users', { params: { search, role: filtreRole || undefined, limite: 50 } })).data,
  });

  const creerMutation = useMutation({
    mutationFn: (d: typeof formData) => api.post('/users', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['utilisateurs'] }); fermerModal(); toast.success('Utilisateur créé'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erreur lors de la création'),
  });

  const modifierMutation = useMutation({
    mutationFn: (d: typeof formData) => api.put(`/users/${selected!.id}`, {
      ...d,
      password: d.password || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['utilisateurs'] }); fermerModal(); toast.success('Utilisateur mis à jour'); },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/toggle-actif`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['utilisateurs'] }),
    onError: () => toast.error('Erreur'),
  });

  const resetMdpMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/reset-password`),
    onSuccess: (res) => { setMotDePasseTemp(res.data.temporaryPassword); qc.invalidateQueries({ queryKey: ['utilisateurs'] }); },
    onError: () => toast.error('Erreur lors de la réinitialisation'),
  });

  const supprimerMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['utilisateurs'] }); setConfirmDelete(null); toast.success('Utilisateur supprimé'); },
    onError: () => toast.error('Impossible de supprimer cet utilisateur'),
  });

  const ouvrirCreation = () => { setFormData(FORM_VIDE); setSelected(null); setModal('create'); };
  const ouvrirEdition = (u: Utilisateur) => {
    setSelected(u);
    setFormData({ nom: u.nom, prenom: u.prenom ?? '', email: u.email, password: '', role: u.role, telephone: u.telephone ?? '' });
    setModal('edit');
  };
  const fermerModal = () => { setModal(null); setSelected(null); setFormData(FORM_VIDE); };
  const soumettre = () => modal === 'create' ? creerMutation.mutate(formData) : modifierMutation.mutate(formData);
  const isPending = creerMutation.isPending || modifierMutation.isPending;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Gestion des utilisateurs</h1>
          <p className="text-sm text-gray-500">Créez et gérez les accès au système</p>
        </div>
        <button type="button" onClick={ouvrirCreation}
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
          <Plus size={16} /> Nouvel utilisateur
        </button>
      </div>

      {/* KPIs */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-800">{data.total}</p>
            <p className="text-xs text-gray-500">Utilisateurs total</p>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <p className="text-2xl font-bold text-green-600">{data.items?.filter((u: Utilisateur) => u.actif).length ?? 0}</p>
            <p className="text-xs text-gray-500">Actifs</p>
          </div>
          <div className="bg-white rounded-xl border shadow-sm p-4">
            <p className="text-2xl font-bold text-gray-400">{data.items?.filter((u: Utilisateur) => !u.actif).length ?? 0}</p>
            <p className="text-xs text-gray-500">Désactivés</p>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select aria-label="Filtrer par rôle" value={filtreRole} onChange={(e) => setFiltreRole(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">Tous les rôles</option>
          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {/* Table */}
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
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Utilisateur</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Rôle</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Téléphone</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Dernière connexion</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Statut</th>
                  <th scope="col" className="px-4 py-3 sr-only">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.items?.map((u: Utilisateur) => {
                  const rc = roleConfig[u.role];
                  return (
                    <tr key={u.id} className={`hover:bg-gray-50 ${!u.actif ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${u.actif ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                            {initiales(u)}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-800">{u.nom} {u.prenom}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${rc?.color ?? 'bg-gray-100 text-gray-600'}`}>
                          <Shield size={10} className="inline mr-1" />
                          {rc?.label ?? u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{u.telephone ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{fmt(u.derniereConnexion)}</td>
                      <td className="px-4 py-3">
                        <button type="button"
                          onClick={() => toggleMutation.mutate(u.id)}
                          className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full font-medium transition-colors ${u.actif ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                          {u.actif
                            ? <><CheckCircle size={11} /> Actif</>
                            : <><XCircle size={11} /> Inactif</>}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button type="button" aria-label={`Réinitialiser le mot de passe de ${u.nom}`}
                            onClick={() => resetMdpMutation.mutate(u.id)}
                            title="Réinitialiser le mot de passe"
                            className="p-1.5 rounded hover:bg-yellow-50 text-gray-400 hover:text-yellow-600">
                            <KeyRound size={14} />
                          </button>
                          <button type="button" aria-label={`Modifier ${u.nom}`} onClick={() => ouvrirEdition(u)}
                            className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                            <Pencil size={14} />
                          </button>
                          <button type="button" aria-label={`Supprimer ${u.nom}`} onClick={() => setConfirmDelete(u)}
                            className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {data?.items?.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">Aucun utilisateur trouvé</div>
          )}
        </div>
      )}

      {/* Modal création / édition */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-800">
                {modal === 'create' ? 'Nouvel utilisateur' : 'Modifier l\'utilisateur'}
              </h2>
              <button type="button" aria-label="Fermer" onClick={fermerModal}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="u-nom" className="text-sm text-gray-600">Nom *</label>
                <input id="u-nom" type="text" value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="u-prenom" className="text-sm text-gray-600">Prénom</label>
                <input id="u-prenom" type="text" value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label htmlFor="u-email" className="text-sm text-gray-600">Email *</label>
                <input id="u-email" type="email" value={formData.email}
                  disabled={modal === 'edit'}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400" />
              </div>
              <div>
                <label htmlFor="u-role" className="text-sm text-gray-600">Rôle *</label>
                <select id="u-role" value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="u-tel" className="text-sm text-gray-600">Téléphone</label>
                <input id="u-tel" type="tel" value={formData.telephone}
                  placeholder="+221 77 000 00 00"
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="col-span-2">
                <label htmlFor="u-pwd" className="text-sm text-gray-600">
                  {modal === 'create' ? 'Mot de passe *' : 'Nouveau mot de passe (laisser vide pour ne pas changer)'}
                </label>
                <input id="u-pwd" type="password" value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={modal === 'edit' ? '••••••••' : ''}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* Résumé des droits du rôle sélectionné */}
            <div className="mx-6 mb-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
              <Shield size={12} className="inline mr-1" />
              {formData.role === 'admin' && 'Accès complet à tous les modules et paramètres.'}
              {formData.role === 'direction' && 'Accès lecture à tous modules + reporting + validation commandes.'}
              {formData.role === 'commercial' && 'CRM, Commandes, Logistique, Facturation.'}
              {formData.role === 'production' && 'Production, Machines, Matières premières, BOM, Stock.'}
              {formData.role === 'magasinier' && 'Stock, Matières premières, Fournisseurs, Logistique.'}
              {formData.role === 'comptable' && 'Facturation, Reporting financier.'}
            </div>

            <div className="flex gap-2 px-6 pb-6">
              <button type="button" onClick={soumettre}
                disabled={!formData.nom || !formData.email || (modal === 'create' && !formData.password) || isPending}
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

      {/* Modal mot de passe temporaire */}
      {motDePasseTemp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
              <KeyRound size={22} className="text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Mot de passe réinitialisé</h3>
            <p className="text-sm text-gray-500 mb-3">Communiquez ce mot de passe temporaire à l'utilisateur :</p>
            <div className="bg-gray-100 rounded-lg px-4 py-3 font-mono text-lg font-bold text-gray-800 mb-5 select-all">
              {motDePasseTemp}
            </div>
            <p className="text-xs text-gray-400 mb-4">L'utilisateur devra le changer à sa prochaine connexion.</p>
            <button type="button" onClick={() => setMotDePasseTemp(null)}
              className="w-full bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800">
              Compris, fermer
            </button>
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
            <h3 className="font-semibold text-gray-800 mb-1">Supprimer cet utilisateur ?</h3>
            <p className="text-sm text-gray-500 mb-5">
              <strong>{confirmDelete.nom} {confirmDelete.prenom}</strong> perdra tout accès immédiatement.
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
