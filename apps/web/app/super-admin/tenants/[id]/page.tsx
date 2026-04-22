'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saApi } from '@/lib/super-admin-api';
import {
  ArrowLeft, Building2, Users, Layers, ShoppingCart, FileText,
  CheckCircle2, AlertCircle, Plus, X, Pencil, Save, ToggleLeft,
  ToggleRight, Mail, Phone, MapPin, User, Shield,
} from 'lucide-react';
import { LogoUpload } from '@/components/ui/LogoUpload';

const ALL_MODULES = [
  'crm', 'commandes', 'production', 'stock', 'facturation',
  'recyclage', 'reporting', 'fournisseurs', 'machines', 'matieres-premieres', 'logistique', 'bom',
];

const PLANS = ['starter', 'pro', 'enterprise'];
const PLAN_STYLES: Record<string, string> = {
  starter:    'bg-gray-100 text-gray-700',
  pro:        'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
};

const FORM_USER_VIDE = { nom: '', email: '', password: '' };

export default function SuperAdminTenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [showAddUser, setShowAddUser] = useState(false);
  const [userForm, setUserForm] = useState(FORM_USER_VIDE);

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['sa-tenant', id],
    queryFn: async () => (await saApi.get(`/super-admin/tenants/${id}`)).data,
    enabled: !!id,
  });

  const modifierMutation = useMutation({
    mutationFn: (d: Record<string, string>) => saApi.put(`/super-admin/tenants/${id}`, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-tenant', id] });
      qc.invalidateQueries({ queryKey: ['sa-tenants'] });
      setEditMode(false);
    },
  });

  const toggleActifMutation = useMutation({
    mutationFn: () => saApi.patch(`/super-admin/tenants/${id}/toggle-actif`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-tenant', id] });
      qc.invalidateQueries({ queryKey: ['sa-tenants'] });
      qc.invalidateQueries({ queryKey: ['sa-stats'] });
    },
  });

  const modifierModulesMutation = useMutation({
    mutationFn: (moduleCodes: string[]) =>
      saApi.patch(`/super-admin/tenants/${id}/modules`, { moduleCodes }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-tenant', id] }),
  });

  const ajouterUserMutation = useMutation({
    mutationFn: (d: typeof userForm) => saApi.post(`/super-admin/tenants/${id}/users`, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-tenant', id] });
      setShowAddUser(false);
      setUserForm(FORM_USER_VIDE);
    },
  });

  const startEdit = () => {
    setEditData({
      nom:              tenant.nom              ?? '',
      secteur:          tenant.secteur          ?? '',
      plan:             tenant.plan             ?? 'starter',
      pays:             tenant.pays             ?? '',
      ville:            tenant.ville            ?? '',
      telephone:        tenant.telephone        ?? '',
      adresse:          tenant.adresse          ?? '',
      couleurPrimaire:  tenant.couleurPrimaire  ?? '#1565C0',
      couleurSecondaire:tenant.couleurSecondaire ?? '#4CAF50',
      logo:             tenant.logo             ?? '',
    });
    setEditMode(true);
  };

  const activeModules: string[] = tenant?.tenantModules?.map((tm: any) => tm.module?.code) ?? [];

  const toggleModule = (code: string) => {
    const next = activeModules.includes(code)
      ? activeModules.filter((c) => c !== code)
      : [...activeModules, code];
    modifierModulesMutation.mutate(next);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-20 text-gray-400">
        <Building2 size={40} className="mx-auto mb-3 text-gray-300" />
        <p>Tenant introuvable</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => router.push('/super-admin/tenants')}
          className="mt-1 p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          aria-label="Retour"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center flex-shrink-0">
              {tenant.nom.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tenant.nom}</h1>
              <p className="text-gray-400 text-sm">{tenant.slug} · {tenant.secteur}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ml-1 ${PLAN_STYLES[tenant.plan] ?? 'bg-gray-100 text-gray-600'}`}>
              {tenant.plan}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${tenant.actif ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {tenant.actif ? 'Actif' : 'Suspendu'}
            </span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {!editMode && (
            <button
              type="button"
              onClick={startEdit}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm hover:bg-gray-50"
            >
              <Pencil size={14} /> Modifier
            </button>
          )}
          <button
            type="button"
            onClick={() => toggleActifMutation.mutate()}
            disabled={toggleActifMutation.isPending}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
              tenant.actif
                ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
            }`}
          >
            {tenant.actif ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            {tenant.actif ? 'Suspendre' : 'Réactiver'}
          </button>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Utilisateurs',  value: tenant._count?.users      ?? 0, icon: <Users size={18} />,        color: 'text-blue-600',   bg: 'bg-blue-50' },
          { label: 'Modules actifs', value: activeModules.length,          icon: <Layers size={18} />,       color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Commandes',     value: tenant.statsCommandes ?? 0, icon: <ShoppingCart size={18} />, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Factures',      value: tenant.statsFactures  ?? 0, icon: <FileText size={18} />,     color: 'text-green-600',  bg: 'bg-green-50' },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl ${k.bg} ${k.color} flex items-center justify-center mb-3`}>
              {k.icon}
            </div>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-sm text-gray-500 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Infos / formulaire */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Informations</h2>
            {editMode && (
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditMode(false)}
                  className="text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-50 text-gray-600">
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => modifierMutation.mutate(editData)}
                  disabled={modifierMutation.isPending}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50"
                >
                  <Save size={12} /> Enregistrer
                </button>
              </div>
            )}
          </div>

          {editMode ? (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Nom', key: 'nom' },
                { label: 'Secteur', key: 'secteur' },
                { label: 'Pays', key: 'pays' },
                { label: 'Ville', key: 'ville' },
                { label: 'Téléphone', key: 'telephone' },
                { label: 'Adresse', key: 'adresse' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label htmlFor={`edit-${key}`} className="text-xs text-gray-500">{label}</label>
                  <input
                    id={`edit-${key}`}
                    value={editData[key] ?? ''}
                    onChange={(e) => setEditData({ ...editData, [key]: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label htmlFor="edit-plan" className="text-xs text-gray-500">Plan</label>
                <select
                  id="edit-plan"
                  value={editData.plan}
                  onChange={(e) => setEditData({ ...editData, plan: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Charte graphique */}
              <div className="col-span-2 pt-2 border-t">
                <p className="text-xs font-medium text-gray-500 mb-3">Charte graphique</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-couleur-primaire" className="text-xs text-gray-500">Couleur primaire</label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        id="edit-couleur-primaire"
                        type="color"
                        value={editData.couleurPrimaire ?? '#1565C0'}
                        onChange={(e) => setEditData({ ...editData, couleurPrimaire: e.target.value })}
                        className="h-9 w-12 rounded border cursor-pointer p-0.5"
                      />
                      <span className="text-xs text-gray-400 font-mono">{editData.couleurPrimaire}</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="edit-couleur-secondaire" className="text-xs text-gray-500">Couleur secondaire</label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        id="edit-couleur-secondaire"
                        type="color"
                        value={editData.couleurSecondaire ?? '#4CAF50'}
                        onChange={(e) => setEditData({ ...editData, couleurSecondaire: e.target.value })}
                        className="h-9 w-12 rounded border cursor-pointer p-0.5"
                      />
                      <span className="text-xs text-gray-400 font-mono">{editData.couleurSecondaire}</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <LogoUpload
                      value={editData.logo ?? ''}
                      onChange={(url) => setEditData({ ...editData, logo: url })}
                      nomFallback={(editData.nom || tenant.nom).charAt(0)}
                    />
                  </div>
                </div>
                {/* Aperçu sidebar */}
                <div
                  className="mt-3 rounded-xl p-3 flex items-center gap-3"
                  style={{ backgroundColor: editData.couleurPrimaire ?? '#1565C0' }}
                >
                  {editData.logo ? (
                    <img src={editData.logo} alt="logo" className="h-8 w-8 rounded object-contain bg-white p-0.5" />
                  ) : (
                    <div className="h-8 w-8 rounded bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                      {(editData.nom || tenant.nom).charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-white text-sm font-semibold">{editData.nom || tenant.nom}</p>
                    <p className="text-white/60 text-xs">{tenant.slug}</p>
                  </div>
                  <div className="ml-auto h-3 w-3 rounded-full" style={{ backgroundColor: editData.couleurSecondaire ?? '#4CAF50' }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { icon: <Building2 size={14} />, label: 'Secteur',    value: tenant.secteur },
                { icon: <MapPin size={14} />,    label: 'Localisation', value: [tenant.ville, tenant.pays].filter(Boolean).join(', ') || '—' },
                { icon: <Phone size={14} />,     label: 'Téléphone',  value: tenant.telephone || '—' },
                { icon: <MapPin size={14} />,    label: 'Adresse',    value: tenant.adresse   || '—' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="mt-0.5 text-gray-400">{icon}</span>
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm text-gray-700">{value}</p>
                  </div>
                </div>
              ))}
              <div className="pt-2 text-xs text-gray-400">
                Créé le {new Date(tenant.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          )}
        </div>

        {/* Modules */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={16} className="text-purple-600" />
            <h2 className="font-semibold text-gray-800">Modules</h2>
            <span className="text-xs text-gray-400 ml-1">({activeModules.length}/{ALL_MODULES.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ALL_MODULES.map((code) => {
              const active = activeModules.includes(code);
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => toggleModule(code)}
                  disabled={modifierModulesMutation.isPending}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors disabled:opacity-60 ${
                    active
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'text-gray-500 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {code}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-4">Cliquez sur un module pour l'activer ou le désactiver.</p>
        </div>
      </div>

      {/* Utilisateurs */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-gray-500" />
            <h2 className="font-semibold text-gray-700">Utilisateurs ({tenant.users?.length ?? 0})</h2>
          </div>
          <button
            type="button"
            onClick={() => { setUserForm(FORM_USER_VIDE); setShowAddUser(true); }}
            className="flex items-center gap-1.5 text-xs bg-blue-700 text-white px-3 py-1.5 rounded-lg hover:bg-blue-800"
          >
            <Plus size={12} /> Ajouter
          </button>
        </div>

        {tenant.users?.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">
            <User size={28} className="mx-auto mb-2 text-gray-300" />
            Aucun utilisateur
          </div>
        ) : (
          <div className="divide-y">
            {tenant.users?.map((u: any) => (
              <div key={u.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {u.nom?.charAt(0)?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{u.nom}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Mail size={10} /> {u.email}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {u.isAdmin && (
                    <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      <Shield size={10} /> Admin
                    </span>
                  )}
                  {u.actif ? (
                    <span className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={10} /> Actif
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
                      <AlertCircle size={10} /> Inactif
                    </span>
                  )}
                  {u.derniereConnexion && (
                    <span className="text-xs text-gray-400 hidden sm:block">
                      {new Date(u.derniereConnexion).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal ajout utilisateur */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">Ajouter un utilisateur</h3>
              <button type="button" onClick={() => setShowAddUser(false)} aria-label="Fermer">
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Nom complet *', key: 'nom', type: 'text' },
                { label: 'Email *', key: 'email', type: 'email' },
                { label: 'Mot de passe *', key: 'password', type: 'password' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label htmlFor={`user-${key}`} className="text-sm text-gray-600">{label}</label>
                  <input
                    id={`user-${key}`}
                    type={type}
                    value={userForm[key as keyof typeof userForm]}
                    onChange={(e) => setUserForm({ ...userForm, [key]: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              {ajouterUserMutation.isError && (
                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  Erreur : email déjà utilisé ou données invalides.
                </p>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button type="button" onClick={() => setShowAddUser(false)}
                className="px-4 py-2 rounded-xl text-sm border hover:bg-gray-50">
                Annuler
              </button>
              <button
                type="button"
                onClick={() => ajouterUserMutation.mutate(userForm)}
                disabled={!userForm.nom || !userForm.email || !userForm.password || ajouterUserMutation.isPending}
                className="flex-1 bg-blue-700 text-white py-2 rounded-xl text-sm hover:bg-blue-800 disabled:opacity-50"
              >
                {ajouterUserMutation.isPending ? 'Création...' : 'Créer l\'utilisateur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
