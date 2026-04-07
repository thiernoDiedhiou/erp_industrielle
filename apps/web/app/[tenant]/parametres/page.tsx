'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { useToast } from '@/components/ui/Toast';
import { Settings, Layers, Users, Plus, X, UserCheck, UserX, Shield } from 'lucide-react';

const ROLES = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'direction', label: 'Direction' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'production', label: 'Production' },
  { value: 'magasinier', label: 'Magasinier' },
  { value: 'comptable', label: 'Comptable' },
];

const ROLE_BADGES: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  direction: 'bg-purple-100 text-purple-700',
  commercial: 'bg-blue-100 text-blue-700',
  production: 'bg-orange-100 text-orange-700',
  magasinier: 'bg-yellow-100 text-yellow-700',
  comptable: 'bg-green-100 text-green-700',
};

const FORM_VIDE = { nom: '', email: '', role: 'commercial', telephone: '', motDePasse: '' };

interface Utilisateur {
  id: string;
  nom: string;
  email: string;
  role: string;
  telephone?: string;
  actif: boolean;
  derniereConnexion?: string;
  createdAt: string;
}

export default function ParametresPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(FORM_VIDE);
  const queryClient = useQueryClient();
  const toast = useToast();
  const currentUser = getUser();
  const isAdmin = currentUser?.role === 'admin';

  const { data: tenant } = useQuery({
    queryKey: ['tenant'],
    queryFn: async () => {
      const { data } = await api.get('/tenant');
      return data;
    },
  });

  const { data: utilisateurs } = useQuery({
    queryKey: ['utilisateurs'],
    queryFn: async () => {
      const { data } = await api.get('/tenant/utilisateurs');
      return data;
    },
    enabled: isAdmin,
  });

  const creerMutation = useMutation({
    mutationFn: (d: typeof form) => api.post('/tenant/utilisateurs', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs'] });
      setShowModal(false);
      setForm(FORM_VIDE);
      toast.success('Utilisateur créé — mot de passe temporaire: Bienvenue2025!');
    },
    onError: (e: { response?: { data?: { message?: string } } }) =>
      toast.error(e.response?.data?.message ?? 'Erreur lors de la création'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, actif }: { id: string; actif: boolean }) =>
      api.patch(`/tenant/utilisateurs/${id}/toggle`, { actif }),
    onSuccess: (_, { actif }) => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs'] });
      toast.success(actif ? 'Utilisateur activé' : 'Utilisateur désactivé');
    },
    onError: () => toast.error('Erreur lors de la modification'),
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.patch(`/tenant/utilisateurs/${id}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['utilisateurs'] });
      toast.success('Rôle mis à jour');
    },
    onError: () => toast.error('Erreur lors du changement de rôle'),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Paramètres</h1>

      {/* Gestion utilisateurs — admin seulement */}
      {isAdmin && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              <h2 className="font-semibold text-gray-700">Utilisateurs</h2>
              <span className="text-xs text-gray-400">({utilisateurs?.total ?? 0})</span>
            </div>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 text-sm bg-blue-700 text-white px-3 py-1.5 rounded-lg hover:bg-blue-800"
            >
              <Plus size={14} /> Inviter
            </button>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b text-xs text-gray-500">
              <tr>
                <th className="text-left px-5 py-2.5 font-medium">Nom</th>
                <th className="text-left px-5 py-2.5 font-medium">Email</th>
                <th className="text-left px-5 py-2.5 font-medium">Rôle</th>
                <th className="text-left px-5 py-2.5 font-medium">Dernière connexion</th>
                <th scope="col" className="px-5 py-2.5 sr-only">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {utilisateurs?.items?.map((u: Utilisateur) => (
                <tr key={u.id} className={`hover:bg-gray-50 ${!u.actif ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                        {u.nom.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{u.nom}</span>
                      {!u.actif && <span className="text-xs text-red-500">(inactif)</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{u.email}</td>
                  <td className="px-5 py-3">
                    <select
                      aria-label={`Rôle de ${u.nom}`}
                      value={u.role}
                      disabled={u.id === currentUser?.id}
                      onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value })}
                      className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer ${ROLE_BADGES[u.role] ?? 'bg-gray-100 text-gray-700'}`}
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">
                    {u.derniereConnexion
                      ? new Date(u.derniereConnexion).toLocaleDateString('fr-SN')
                      : 'Jamais'}
                  </td>
                  <td className="px-5 py-3">
                    {u.id !== currentUser?.id && (
                      <button
                        type="button"
                        aria-label={u.actif ? 'Désactiver' : 'Activer'}
                        title={u.actif ? 'Désactiver' : 'Activer'}
                        onClick={() => toggleMutation.mutate({ id: u.id, actif: !u.actif })}
                        className={`p-1.5 rounded hover:bg-gray-100 ${u.actif ? 'text-red-400 hover:text-red-600' : 'text-green-400 hover:text-green-600'}`}
                      >
                        {u.actif ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {utilisateurs?.items?.length === 0 && (
            <div className="text-center py-6 text-gray-400 text-sm">Aucun utilisateur</div>
          )}
        </div>
      )}

      {/* Modules actifs */}
      {tenant && (
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-700">Modules actifs</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {tenant.tenantModules?.map((tm: {
              id: string;
              actif: boolean;
              module: { code: string; nom: string };
            }) => (
              <div
                key={tm.id}
                className={`rounded-lg border p-3 ${tm.actif ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}
              >
                <p className="font-medium text-sm text-gray-800">{tm.module.nom}</p>
                <p className="text-xs text-gray-500 mt-0.5">{tm.module.code}</p>
                <span className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs ${tm.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {tm.actif ? 'Actif' : 'Inactif'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Infos tenant */}
      {tenant && (
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Settings size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-700">Informations société</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Nom', tenant.nom],
              ['Slug', tenant.slug],
              ['Plan', tenant.plan],
              ['Pays', tenant.pays ?? '—'],
              ['Ville', tenant.ville ?? '—'],
              ['Téléphone', tenant.telephone ?? '—'],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs text-gray-400">{label}</p>
                <p className="font-medium text-gray-800">{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal invitation */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-blue-600" />
                <h2 className="font-semibold text-gray-800">Inviter un utilisateur</h2>
              </div>
              <button type="button" aria-label="Fermer" onClick={() => setShowModal(false)}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { id: 'u-nom', label: 'Nom complet *', key: 'nom', type: 'text' },
                { id: 'u-email', label: 'Email *', key: 'email', type: 'email' },
                { id: 'u-tel', label: 'Téléphone', key: 'telephone', type: 'tel' },
                { id: 'u-mdp', label: 'Mot de passe temporaire', key: 'motDePasse', type: 'password' },
              ].map(({ id, label, key, type }) => (
                <div key={key}>
                  <label htmlFor={id} className="text-sm text-gray-600">{label}</label>
                  <input
                    id={id}
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={key === 'motDePasse' ? 'Bienvenue2025! (défaut)' : ''}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div>
                <label htmlFor="u-role" className="text-sm text-gray-600">Rôle *</label>
                <select
                  id="u-role"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button
                type="button"
                onClick={() => creerMutation.mutate(form)}
                disabled={!form.nom || !form.email || creerMutation.isPending}
                className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50"
              >
                {creerMutation.isPending ? 'Création...' : 'Créer l\'utilisateur'}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
