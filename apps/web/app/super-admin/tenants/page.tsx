'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { saApi } from '@/lib/super-admin-api';
import {
  Building2, Plus, Search, Eye, ToggleLeft, ToggleRight, X,
  Users, Layers, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { LogoUpload } from '@/components/ui/LogoUpload';

const PLANS = ['starter', 'pro', 'enterprise'];
const PLAN_STYLES: Record<string, string> = {
  starter:    'bg-gray-100 text-gray-700',
  pro:        'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
};
const ALL_MODULES = [
  'crm', 'commandes', 'production', 'stock', 'facturation',
  'recyclage', 'reporting', 'fournisseurs', 'machines', 'matieres-premieres', 'logistique', 'bom',
];

const FORM_VIDE = {
  slug: '', nom: '', secteur: '', plan: 'starter',
  pays: 'SN', ville: '', telephone: '', adresse: '',
  couleurPrimaire: '#1565C0', couleurSecondaire: '#4CAF50', logo: '',
  adminEmail: '', adminNom: '', adminPassword: '',
  moduleCodes: ALL_MODULES,
};

export default function SuperAdminTenantsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(FORM_VIDE);
  const [step, setStep] = useState<1 | 2>(1);

  const { data: tenants, isLoading } = useQuery({
    queryKey: ['sa-tenants', search],
    queryFn: async () => (await saApi.get('/super-admin/tenants', { params: { search: search || undefined } })).data,
  });

  const creerMutation = useMutation({
    mutationFn: (d: typeof formData) => saApi.post('/super-admin/tenants', d),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['sa-tenants'] });
      qc.invalidateQueries({ queryKey: ['sa-stats'] });
      setShowModal(false);
      setFormData(FORM_VIDE);
      setStep(1);
      router.push(`/super-admin/tenants/${res.data.id}`);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => saApi.patch(`/super-admin/tenants/${id}/toggle-actif`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-tenants'] }),
  });

  const toggleModule = (code: string) => {
    const current = formData.moduleCodes;
    setFormData({
      ...formData,
      moduleCodes: current.includes(code) ? current.filter((c) => c !== code) : [...current, code],
    });
  };

  const field = (label: string, key: keyof typeof FORM_VIDE, type = 'text', placeholder = '') => (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        type={type}
        value={formData[key] as string}
        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
        placeholder={placeholder}
        className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-500 text-sm mt-1">Gestion de toutes les entreprises clientes</p>
        </div>
        <button
          type="button"
          onClick={() => { setFormData(FORM_VIDE); setStep(1); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-800"
        >
          <Plus size={16} /> Nouveau tenant
        </button>
      </div>

      {/* Recherche */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou slug..."
          className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Entreprise</th>
                  <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Plan</th>
                  <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Utilisateurs</th>
                  <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Modules</th>
                  <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Statut</th>
                  <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Créé le</th>
                  <th className="px-5 py-3 sr-only">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tenants?.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                          {t.nom.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{t.nom}</p>
                          <p className="text-xs text-gray-400">{t.slug} · {t.secteur}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${PLAN_STYLES[t.plan] ?? 'bg-gray-100 text-gray-600'}`}>
                        {t.plan}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Users size={14} className="text-gray-400" /> {t.nbUsers}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Layers size={14} className="text-gray-400" /> {t.nbModules} actif(s)
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button type="button" onClick={() => toggleMutation.mutate(t.id)}>
                        {t.actif ? (
                          <span className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">
                            <CheckCircle2 size={12} /> Actif
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-medium">
                            <AlertCircle size={12} /> Suspendu
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => router.push(`/super-admin/tenants/${t.id}`)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600"
                        aria-label="Voir le détail"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tenants?.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              <Building2 size={32} className="mx-auto mb-2 text-gray-300" />
              Aucun tenant trouvé
            </div>
          )}
        </div>
      )}

      {/* Modal création tenant */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <div>
                <h2 className="font-semibold text-gray-800">Nouveau tenant</h2>
                <p className="text-xs text-gray-400">Étape {step}/2</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} aria-label="Fermer">
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {step === 1 && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {field('Nom de l\'entreprise *', 'nom', 'text', 'ex: GISAC Industrie')}
                  {field('Slug unique *', 'slug', 'text', 'ex: gisac')}
                  {field('Secteur *', 'secteur', 'text', 'ex: Industrie plastique')}
                  <div>
                    <label htmlFor="form-plan" className="text-sm text-gray-600">Plan *</label>
                    <select
                      id="form-plan"
                      value={formData.plan}
                      onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                      className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  {field('Pays', 'pays', 'text', 'SN')}
                  {field('Ville', 'ville', 'text', 'Dakar')}
                  {field('Téléphone', 'telephone', 'tel', '+221...')}
                  {field('Adresse', 'adresse', 'text', '')}
                </div>

                {/* Charte graphique */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Charte graphique</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="form-couleur-primaire" className="text-sm text-gray-600">Couleur primaire</label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          id="form-couleur-primaire"
                          type="color"
                          value={formData.couleurPrimaire}
                          onChange={(e) => setFormData({ ...formData, couleurPrimaire: e.target.value })}
                          className="h-9 w-12 rounded border cursor-pointer p-0.5"
                        />
                        <span className="text-sm text-gray-500 font-mono">{formData.couleurPrimaire}</span>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="form-couleur-secondaire" className="text-sm text-gray-600">Couleur secondaire</label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          id="form-couleur-secondaire"
                          type="color"
                          value={formData.couleurSecondaire}
                          onChange={(e) => setFormData({ ...formData, couleurSecondaire: e.target.value })}
                          className="h-9 w-12 rounded border cursor-pointer p-0.5"
                        />
                        <span className="text-sm text-gray-500 font-mono">{formData.couleurSecondaire}</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <LogoUpload
                        value={formData.logo}
                        onChange={(url) => setFormData({ ...formData, logo: url })}
                        nomFallback={formData.nom.charAt(0) || '?'}
                      />
                    </div>
                  </div>
                  {/* Aperçu */}
                  <div
                    className="mt-3 rounded-xl p-3 flex items-center gap-3"
                    style={{ backgroundColor: formData.couleurPrimaire }}
                  >
                    {formData.logo ? (
                      <img src={formData.logo} alt="logo" className="h-8 w-8 rounded object-contain bg-white p-0.5" />
                    ) : (
                      <div className="h-8 w-8 rounded bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                        {formData.nom.charAt(0) || '?'}
                      </div>
                    )}
                    <div>
                      <p className="text-white text-sm font-semibold leading-tight">{formData.nom || 'Nom entreprise'}</p>
                      <p className="text-white/60 text-xs">{formData.slug || 'slug'}</p>
                    </div>
                    <div className="ml-auto h-3 w-3 rounded-full" style={{ backgroundColor: formData.couleurSecondaire }} />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="p-6 space-y-5">
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Compte administrateur du tenant</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {field('Nom admin *', 'adminNom', 'text', 'ex: Mamadou Diallo')}
                    {field('Email admin *', 'adminEmail', 'email', 'admin@entreprise.sn')}
                    <div className="col-span-2">
                      {field('Mot de passe *', 'adminPassword', 'password', '')}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">
                    Modules à activer
                    <span className="text-xs text-gray-400 font-normal ml-2">({formData.moduleCodes.length}/{ALL_MODULES.length})</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ALL_MODULES.map((code) => {
                      const active = formData.moduleCodes.includes(code);
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => toggleModule(code)}
                          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                            active ? 'bg-blue-700 text-white border-blue-700' : 'text-gray-500 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {code}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 px-6 pb-6">
              {step === 1 ? (
                <>
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl text-sm border hover:bg-gray-50">
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!formData.nom || !formData.slug || !formData.secteur}
                    className="flex-1 bg-blue-700 text-white py-2 rounded-xl text-sm hover:bg-blue-800 disabled:opacity-50"
                  >
                    Suivant →
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-xl text-sm border hover:bg-gray-50">
                    ← Retour
                  </button>
                  <button
                    type="button"
                    onClick={() => creerMutation.mutate(formData)}
                    disabled={!formData.adminEmail || !formData.adminNom || !formData.adminPassword || creerMutation.isPending}
                    className="flex-1 bg-blue-700 text-white py-2 rounded-xl text-sm hover:bg-blue-800 disabled:opacity-50"
                  >
                    {creerMutation.isPending ? 'Création...' : 'Créer le tenant'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
