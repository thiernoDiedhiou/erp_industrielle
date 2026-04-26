'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saApi } from '@/lib/super-admin-api';
import {
  ArrowLeft, Building2, Users, Layers, ShoppingCart, FileText,
  CheckCircle2, AlertCircle, Plus, X, Pencil, Save, ToggleLeft,
  ToggleRight, Mail, Phone, MapPin, User, Shield, ChevronDown,
  ChevronRight, GitBranch, Settings2, Tag, ArrowRight, Circle, Info,
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

const ENTITES_WORKFLOW = [
  { code: 'commande',           label: 'Commande' },
  { code: 'ordre_fabrication',  label: 'Ordre de fabrication' },
];

const ENTITES_CHAMP = [
  { code: 'client',    label: 'Client' },
  { code: 'commande',  label: 'Commande' },
  { code: 'produit',   label: 'Produit' },
  { code: 'machine',   label: 'Machine' },
];

const TYPES_CHAMP = [
  { code: 'text',     label: 'Texte court' },
  { code: 'textarea', label: 'Texte long' },
  { code: 'number',   label: 'Nombre' },
  { code: 'date',     label: 'Date' },
  { code: 'boolean',  label: 'Oui / Non' },
  { code: 'select',   label: 'Liste de choix' },
];

const ROLES_DISPONIBLES = ['admin', 'direction', 'production', 'logistique', 'comptable', 'rh', 'commercial', 'qualite'];

// Transitions hardcodées côté backend — affichées quand aucun workflow BDD n'est configuré
const DEFAUTS_WORKFLOW = [
  {
    code: 'commande',
    label: 'Commande',
    transitions: [
      { de: 'Brouillon',      vers: ['Confirmée', 'Annulée'] },
      { de: 'Confirmée',      vers: ['En production', 'Annulée'] },
      { de: 'En production',  vers: ['Prête', 'Annulée'] },
      { de: 'Prête',          vers: ['Livrée'] },
      { de: 'Livrée',         vers: ['Facturée'] },
    ],
  },
  {
    code: 'ordre_fabrication',
    label: 'Ordre de fabrication',
    transitions: [
      { de: 'Planifié',  vers: ['En cours', 'Annulé'] },
      { de: 'En cours',  vers: ['Terminé', 'En pause'] },
      { de: 'En pause',  vers: ['En cours', 'Annulé'] },
    ],
  },
];

type WfEtat = { id: string; code: string; libelle: string; couleur: string; etapInitiale: boolean; etapFinale: boolean };
type WfTransition = { id: string; etatSourceCode: string; etatCibleCode: string; libelle: string; rolesAutorises: string[] };

// Templates de workflows par entité
const WORKFLOW_TEMPLATES: Record<string, {
  nom: string;
  etats: Array<{ code: string; libelle: string; couleur: string; etapInitiale?: boolean; etapFinale?: boolean }>;
  transitions: Array<{ etatSourceCode: string; etatCibleCode: string; libelle: string; rolesAutorises: string[] }>;
}> = {
  commande: {
    nom: 'Cycle de vie commande',
    etats: [
      { code: 'brouillon',     libelle: 'Brouillon',      couleur: '#9CA3AF', etapInitiale: true },
      { code: 'confirmee',     libelle: 'Confirmée',      couleur: '#3B82F6' },
      { code: 'en_production', libelle: 'En production',  couleur: '#F59E0B' },
      { code: 'prete',         libelle: 'Prête',          couleur: '#8B5CF6' },
      { code: 'livree',        libelle: 'Livrée',         couleur: '#10B981' },
      { code: 'facturee',      libelle: 'Facturée',       couleur: '#065F46', etapFinale: true },
      { code: 'annulee',       libelle: 'Annulée',        couleur: '#EF4444', etapFinale: true },
    ],
    transitions: [
      { etatSourceCode: 'brouillon',     etatCibleCode: 'confirmee',     libelle: 'Confirmer',      rolesAutorises: ['admin', 'direction'] },
      { etatSourceCode: 'confirmee',     etatCibleCode: 'en_production', libelle: 'Lancer prod.',   rolesAutorises: ['admin', 'production'] },
      { etatSourceCode: 'en_production', etatCibleCode: 'prete',         libelle: 'Marquer prête',  rolesAutorises: ['admin', 'production'] },
      { etatSourceCode: 'prete',         etatCibleCode: 'livree',        libelle: 'Livrer',         rolesAutorises: ['admin', 'logistique'] },
      { etatSourceCode: 'livree',        etatCibleCode: 'facturee',      libelle: 'Facturer',       rolesAutorises: ['admin', 'comptable'] },
      { etatSourceCode: 'confirmee',     etatCibleCode: 'annulee',       libelle: 'Annuler',        rolesAutorises: ['admin', 'direction'] },
      { etatSourceCode: 'en_production', etatCibleCode: 'annulee',       libelle: 'Annuler',        rolesAutorises: ['admin', 'direction'] },
    ],
  },
  ordre_fabrication: {
    nom: 'Cycle de vie OF',
    etats: [
      { code: 'planifie',  libelle: 'Planifié',   couleur: '#3B82F6', etapInitiale: true },
      { code: 'en_cours',  libelle: 'En cours',   couleur: '#F59E0B' },
      { code: 'en_pause',  libelle: 'En pause',   couleur: '#9CA3AF' },
      { code: 'termine',   libelle: 'Terminé',    couleur: '#10B981', etapFinale: true },
      { code: 'annule',    libelle: 'Annulé',     couleur: '#EF4444', etapFinale: true },
    ],
    transitions: [
      { etatSourceCode: 'planifie', etatCibleCode: 'en_cours',  libelle: 'Démarrer',  rolesAutorises: ['admin', 'production', 'direction'] },
      { etatSourceCode: 'en_cours', etatCibleCode: 'termine',   libelle: 'Terminer',  rolesAutorises: ['admin', 'production', 'direction'] },
      { etatSourceCode: 'en_cours', etatCibleCode: 'en_pause',  libelle: 'Mettre en pause', rolesAutorises: ['admin', 'production'] },
      { etatSourceCode: 'en_pause', etatCibleCode: 'en_cours',  libelle: 'Reprendre', rolesAutorises: ['admin', 'production'] },
      { etatSourceCode: 'planifie', etatCibleCode: 'annule',    libelle: 'Annuler',   rolesAutorises: ['admin', 'direction'] },
      { etatSourceCode: 'en_pause', etatCibleCode: 'annule',    libelle: 'Annuler',   rolesAutorises: ['admin', 'direction'] },
    ],
  },
};

const COULEUR_ETAT_STYLE: Record<string, string> = {};

function EtatBadge({ libelle, couleur, initial, final: fin }: { libelle: string; couleur?: string; initial?: boolean; final?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: couleur ?? '#9CA3AF' }}>
      {initial && <span className="text-[10px] opacity-80">▶</span>}
      {fin && <span className="text-[10px] opacity-80">■</span>}
      {libelle}
    </span>
  );
}

export default function SuperAdminTenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  // Sections collapsibles
  const [workflowsOpen, setWorkflowsOpen] = useState(false);
  const [champsOpen, setChampsOpen] = useState(false);

  // Edit tenant
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Record<string, string>>({});

  // Utilisateurs
  const [showAddUser, setShowAddUser] = useState(false);
  const [userForm, setUserForm] = useState(FORM_USER_VIDE);

  // Workflows
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [workflowEntite, setWorkflowEntite] = useState('commande');

  // Champs personnalisés
  const [showChampModal, setShowChampModal] = useState(false);
  const [champForm, setChampForm] = useState({ entite: 'client', nom: '', label: '', type: 'text', obligatoire: false });
  const [champEntiteFiltre, setChampEntiteFiltre] = useState('tous');

  // Éditeur de workflow
  const [wfNom, setWfNom] = useState('');
  const [wfEtats, setWfEtats] = useState<WfEtat[]>([]);
  const [wfTransitions, setWfTransitions] = useState<WfTransition[]>([]);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);

  // ─── Helpers éditeur workflow ─────────────────────────────────────────────

  const ouvrirEditionWorkflow = (wf: any) => {
    setEditingWorkflowId(wf.id);
    setWorkflowEntite(wf.entite);
    setWfNom(wf.nom);
    setWfEtats(
      (wf.etats ?? []).map((e: any) => ({
        id: e.id,
        code: e.code,
        libelle: e.libelle,
        couleur: e.couleur ?? '#9CA3AF',
        etapInitiale: e.etapInitiale ?? false,
        etapFinale: e.etapFinale ?? false,
      })),
    );
    setWfTransitions(
      (wf.transitions ?? []).map((t: any) => ({
        id: t.id,
        etatSourceCode: t.etatSource?.code ?? '',
        etatCibleCode: t.etatCible?.code ?? '',
        libelle: t.libelle ?? '',
        rolesAutorises: t.rolesAutorises ?? [],
      })),
    );
    setShowWorkflowModal(true);
  };

  const chargerTemplate = (entite: string) => {
    const tpl = WORKFLOW_TEMPLATES[entite];
    if (tpl) {
      setWfNom(tpl.nom);
      setWfEtats(tpl.etats.map((e, i) => ({
        id: `e${i}`,
        code: e.code,
        libelle: e.libelle,
        couleur: e.couleur ?? '#9CA3AF',
        etapInitiale: e.etapInitiale ?? false,
        etapFinale: e.etapFinale ?? false,
      })));
      setWfTransitions(tpl.transitions.map((t, i) => ({ id: `t${i}`, ...t })));
    } else {
      setWfNom('');
      setWfEtats([]);
      setWfTransitions([]);
    }
  };

  const updateEtat = (id: string, patch: Partial<WfEtat>) =>
    setWfEtats((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const supprimerEtat = (id: string) => {
    const etat = wfEtats.find((e) => e.id === id);
    setWfEtats((prev) => prev.filter((e) => e.id !== id));
    if (etat) {
      setWfTransitions((prev) =>
        prev.filter((t) => t.etatSourceCode !== etat.code && t.etatCibleCode !== etat.code),
      );
    }
  };

  const ajouterEtat = () =>
    setWfEtats((prev) => [...prev, { id: `e${Date.now()}`, code: '', libelle: '', couleur: '#6366F1', etapInitiale: false, etapFinale: false }]);

  const updateTransition = (id: string, patch: Partial<WfTransition>) =>
    setWfTransitions((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const supprimerTransition = (id: string) =>
    setWfTransitions((prev) => prev.filter((t) => t.id !== id));

  const ajouterTransition = () => {
    const firstCode = wfEtats[0]?.code ?? '';
    setWfTransitions((prev) => [
      ...prev,
      { id: `t${Date.now()}`, etatSourceCode: firstCode, etatCibleCode: firstCode, libelle: '', rolesAutorises: ['admin'] },
    ]);
  };

  const toggleRole = (transId: string, role: string) =>
    setWfTransitions((prev) =>
      prev.map((t) => {
        if (t.id !== transId) return t;
        const roles = t.rolesAutorises.includes(role)
          ? t.rolesAutorises.filter((r) => r !== role)
          : [...t.rolesAutorises, role];
        return { ...t, rolesAutorises: roles };
      }),
    );

  // ─── Queries ──────────────────────────────────────────────────────────────

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['sa-tenant', id],
    queryFn: async () => (await saApi.get(`/super-admin/tenants/${id}`)).data,
    enabled: !!id,
  });

  const { data: workflows = [] } = useQuery({
    queryKey: ['sa-tenant-workflows', id],
    queryFn: async () => (await saApi.get(`/super-admin/tenants/${id}/workflows`)).data,
    enabled: !!id && workflowsOpen,
  });

  const { data: champs = [], refetch: refetchChamps } = useQuery({
    queryKey: ['sa-tenant-champs', id],
    queryFn: async () => (await saApi.get(`/super-admin/tenants/${id}/champs`)).data,
    enabled: !!id && champsOpen,
  });

  // ─── Mutations ────────────────────────────────────────────────────────────

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

  const creerWorkflowMutation = useMutation({
    mutationFn: (data: any) => saApi.post(`/super-admin/tenants/${id}/workflows`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-tenant-workflows', id] });
      setShowWorkflowModal(false);
      setEditingWorkflowId(null);
    },
  });

  const modifierWorkflowMutation = useMutation({
    mutationFn: ({ workflowId, ...data }: any) =>
      saApi.put(`/super-admin/tenants/${id}/workflows/${workflowId}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-tenant-workflows', id] });
      setShowWorkflowModal(false);
      setEditingWorkflowId(null);
    },
  });

  const creerChampMutation = useMutation({
    mutationFn: (data: any) => saApi.post(`/super-admin/tenants/${id}/champs`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa-tenant-champs', id] });
      setShowChampModal(false);
      setChampForm({ entite: 'client', nom: '', label: '', type: 'text', obligatoire: false });
    },
  });

  const toggleChampMutation = useMutation({
    mutationFn: (champId: string) => saApi.patch(`/super-admin/tenants/${id}/champs/${champId}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sa-tenant-champs', id] }),
  });

  // ─── Helpers ──────────────────────────────────────────────────────────────

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

  const entitesDejaConfigures = (workflows as any[]).map((w: any) => w.entite);

  const champsAffiches = champEntiteFiltre === 'tous'
    ? (champs as any[])
    : (champs as any[]).filter((c: any) => c.entite === champEntiteFiltre);

  // ─── Render ───────────────────────────────────────────────────────────────

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
          { label: 'Utilisateurs',   value: tenant._count?.users      ?? 0, icon: <Users size={18} />,        color: 'text-blue-600',   bg: 'bg-blue-50' },
          { label: 'Modules actifs', value: activeModules.length,           icon: <Layers size={18} />,       color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Commandes',      value: tenant.statsCommandes ?? 0,     icon: <ShoppingCart size={18} />, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Factures',       value: tenant.statsFactures  ?? 0,     icon: <FileText size={18} />,     color: 'text-green-600',  bg: 'bg-green-50' },
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
                { icon: <Building2 size={14} />, label: 'Secteur',      value: tenant.secteur },
                { icon: <MapPin size={14} />,    label: 'Localisation', value: [tenant.ville, tenant.pays].filter(Boolean).join(', ') || '—' },
                { icon: <Phone size={14} />,     label: 'Téléphone',    value: tenant.telephone || '—' },
                { icon: <MapPin size={14} />,    label: 'Adresse',      value: tenant.adresse   || '—' },
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

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* Section Workflows                                                         */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setWorkflowsOpen(!workflowsOpen)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <GitBranch size={16} className="text-indigo-600" />
            <h2 className="font-semibold text-gray-700">Workflows & Statuts</h2>
            {(workflows as any[]).length > 0 && (
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                {(workflows as any[]).length} configuré(s)
              </span>
            )}
          </div>
          {workflowsOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
        </button>

        {workflowsOpen && (
          <div className="border-t">
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Configurez les cycles de vie des entités pour ce tenant.
              </p>
              <button
                type="button"
                onClick={() => {
                  const premiere = ENTITES_WORKFLOW.find((e) => !entitesDejaConfigures.includes(e.code));
                  const entite = premiere?.code ?? 'commande';
                  setWorkflowEntite(entite);
                  chargerTemplate(entite);
                  setShowWorkflowModal(true);
                }}
                className="flex items-center gap-1.5 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
              >
                <Plus size={12} /> Nouveau workflow
              </button>
            </div>

            {/* Workflows configurés */}
            {(workflows as any[]).length > 0 && (
              <div className="divide-y">
                {(workflows as any[]).map((wf: any) => (
                  <WorkflowCard key={wf.id} workflow={wf} onEdit={ouvrirEditionWorkflow} />
                ))}
              </div>
            )}

            {/* Bandeau défauts pour les entités non encore configurées */}
            {(() => {
              const entitesSansWorkflow = DEFAUTS_WORKFLOW.filter(
                (d) => !entitesDejaConfigures.includes(d.code),
              );
              if (entitesSansWorkflow.length === 0) return null;

              return (
                <div className="p-5 space-y-4">
                  {/* Bandeau d'avertissement */}
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <Info size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        Comportement par défaut actif
                      </p>
                      <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                        {entitesSansWorkflow.length === DEFAUTS_WORKFLOW.length
                          ? 'Aucun workflow personnalisé configuré pour ce tenant.'
                          : 'Certaines entités n\'ont pas encore de workflow configuré.'}
                        {' '}Le système applique les transitions standard ci-dessous.
                        Créez un workflow pour personnaliser complètement ces cycles de vie.
                      </p>
                    </div>
                  </div>

                  {/* Transitions par défaut par entité */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {entitesSansWorkflow.map((defaut) => (
                      <div key={defaut.code} className="border border-dashed border-gray-200 rounded-xl p-4 bg-gray-50/50">
                        <div className="flex items-center gap-2 mb-3">
                          <GitBranch size={14} className="text-gray-400" />
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                            {defaut.label}
                          </p>
                          <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full ml-auto">
                            Défaut
                          </span>
                        </div>
                        <div className="space-y-2">
                          {defaut.transitions.map((t, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <span className="bg-white border text-gray-600 px-2 py-1 rounded-lg font-medium flex-shrink-0 min-w-[90px] text-center">
                                {t.de}
                              </span>
                              <ArrowRight size={12} className="text-gray-300 mt-1.5 flex-shrink-0" />
                              <div className="flex flex-wrap gap-1">
                                {t.vers.map((v) => (
                                  <span
                                    key={v}
                                    className={`px-2 py-1 rounded-lg font-medium border ${
                                      v.toLowerCase().includes('annul')
                                        ? 'bg-red-50 text-red-600 border-red-200'
                                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                    }`}
                                  >
                                    {v}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* Section Champs personnalisés                                              */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setChampsOpen(!champsOpen)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings2 size={16} className="text-teal-600" />
            <h2 className="font-semibold text-gray-700">Champs personnalisés</h2>
            {(champs as any[]).length > 0 && (
              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                {(champs as any[]).length} champ(s)
              </span>
            )}
          </div>
          {champsOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
        </button>

        {champsOpen && (
          <div className="border-t">
            <div className="px-6 py-3 bg-gray-50 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
              {/* Filtre par entité */}
              <div className="flex flex-wrap gap-2">
                {['tous', ...ENTITES_CHAMP.map((e) => e.code)].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setChampEntiteFiltre(code)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      champEntiteFiltre === code
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'text-gray-500 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {code === 'tous' ? 'Tous' : ENTITES_CHAMP.find((e) => e.code === code)?.label ?? code}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowChampModal(true)}
                className="flex items-center gap-1.5 text-xs bg-teal-600 text-white px-3 py-1.5 rounded-lg hover:bg-teal-700 flex-shrink-0"
              >
                <Plus size={12} /> Ajouter un champ
              </button>
            </div>

            {champsAffiches.length === 0 ? (
              <div className="py-10 text-center text-gray-400">
                <Tag size={28} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucun champ personnalisé</p>
                <p className="text-xs mt-1">Ajoutez des champs pour capturer des données métier spécifiques à ce tenant.</p>
              </div>
            ) : (
              <>
                {/* Mobile: cartes */}
                <div className="divide-y md:hidden">
                  {champsAffiches.map((c: any) => (
                    <div key={c.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{c.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5 font-mono">{c.nom}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleChampMutation.mutate(c.id)}
                          disabled={toggleChampMutation.isPending}
                          className={`flex-shrink-0 w-10 h-5 rounded-full transition-colors relative ${c.actif ? 'bg-teal-500' : 'bg-gray-300'}`}
                          aria-label={c.actif ? 'Désactiver' : 'Activer'}
                        >
                          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${c.actif ? 'left-5' : 'left-0.5'}`} />
                        </button>
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {ENTITES_CHAMP.find((e) => e.code === c.entite)?.label ?? c.entite}
                        </span>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          {TYPES_CHAMP.find((t) => t.code === c.type)?.label ?? c.type}
                        </span>
                        {c.obligatoire && (
                          <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">Obligatoire</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: tableau */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Label</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Code</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Entité</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
                        <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Requis</th>
                        <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actif</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {champsAffiches.map((c: any) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3 font-medium text-gray-800">{c.label}</td>
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.nom}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {ENTITES_CHAMP.find((e) => e.code === c.entite)?.label ?? c.entite}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                              {TYPES_CHAMP.find((t) => t.code === c.type)?.label ?? c.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {c.obligatoire
                              ? <CheckCircle2 size={14} className="text-red-500 mx-auto" />
                              : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => toggleChampMutation.mutate(c.id)}
                              disabled={toggleChampMutation.isPending}
                              className={`w-10 h-5 rounded-full transition-colors relative ${c.actif ? 'bg-teal-500' : 'bg-gray-300'}`}
                              aria-label={c.actif ? 'Désactiver' : 'Activer'}
                            >
                              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${c.actif ? 'left-5' : 'left-0.5'}`} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* Modal ajout utilisateur                                                   */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md">
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
                {ajouterUserMutation.isPending ? 'Création...' : "Créer l'utilisateur"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* Modal éditeur de workflow                                                  */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {showWorkflowModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl flex flex-col max-h-[92vh]">

            {/* En-tête fixe */}
            <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
              <h3 className="font-semibold text-gray-800">
                {editingWorkflowId ? 'Modifier le workflow' : 'Créer un workflow'}
              </h3>
              <button
                type="button"
                onClick={() => { setShowWorkflowModal(false); setEditingWorkflowId(null); }}
                aria-label="Fermer"
              >
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {/* Corps scrollable */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">

              {/* Entité + Nom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Entité</label>
                  {editingWorkflowId ? (
                    // En mode édition, l'entité est verrouillée
                    <div className="p-3 rounded-xl border-2 border-indigo-200 bg-indigo-50">
                      <p className="text-sm font-medium text-indigo-700">
                        {ENTITES_WORKFLOW.find((e) => e.code === workflowEntite)?.label ?? workflowEntite}
                      </p>
                      <p className="text-xs text-indigo-400 mt-0.5">Entité non modifiable</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {ENTITES_WORKFLOW.map((e) => {
                        const dejaConfig = entitesDejaConfigures.includes(e.code);
                        return (
                          <button
                            key={e.code}
                            type="button"
                            disabled={dejaConfig}
                            onClick={() => { setWorkflowEntite(e.code); chargerTemplate(e.code); }}
                            className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                              dejaConfig
                                ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                                : workflowEntite === e.code
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 hover:border-indigo-300'
                            }`}
                          >
                            <p className="text-sm font-medium">{e.label}</p>
                            {dejaConfig && <p className="text-xs mt-0.5 text-gray-400">Déjà configuré</p>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor="wf-nom" className="text-sm font-medium text-gray-700 block mb-2">Nom du workflow</label>
                  <input
                    id="wf-nom"
                    value={wfNom}
                    onChange={(e) => setWfNom(e.target.value)}
                    placeholder="Ex : Cycle de vie commande"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Le template ci-dessous est pré-rempli mais entièrement modifiable.
                  </p>
                </div>
              </div>

              {/* ── États ──────────────────────────────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">États ({wfEtats.length})</p>
                  <button
                    type="button"
                    onClick={ajouterEtat}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    <Plus size={12} /> Ajouter un état
                  </button>
                </div>

                <div className="space-y-2">
                  {wfEtats.map((e) => (
                    <div key={e.id} className="flex items-center gap-2 p-2.5 border rounded-xl bg-gray-50">
                      {/* Couleur */}
                      <input
                        type="color"
                        value={e.couleur}
                        onChange={(ev) => updateEtat(e.id, { couleur: ev.target.value })}
                        className="w-8 h-8 rounded-lg border cursor-pointer p-0.5 flex-shrink-0"
                        title="Couleur"
                      />
                      {/* Label */}
                      <input
                        value={e.libelle}
                        placeholder="Label affiché"
                        onChange={(ev) => updateEtat(e.id, { libelle: ev.target.value })}
                        className="flex-1 min-w-0 bg-transparent text-sm font-medium focus:outline-none border-b border-transparent focus:border-indigo-400 placeholder:text-gray-300"
                      />
                      {/* Code */}
                      <input
                        value={e.code}
                        placeholder="code"
                        onChange={(ev) => updateEtat(e.id, { code: ev.target.value.toLowerCase().replace(/\s+/g, '_') })}
                        className="w-24 border rounded-lg px-2 py-1 text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 flex-shrink-0"
                        title="Code technique"
                      />
                      {/* Flags */}
                      <button
                        type="button"
                        onClick={() => updateEtat(e.id, { etapInitiale: !e.etapInitiale, ...(e.etapInitiale ? {} : { etapFinale: false }) })}
                        title="État initial"
                        className={`flex-shrink-0 text-xs px-2 py-1 rounded-lg border transition-colors ${e.etapInitiale ? 'bg-blue-100 text-blue-700 border-blue-300' : 'text-gray-400 border-gray-200 hover:bg-gray-100'}`}
                      >
                        ▶
                      </button>
                      <button
                        type="button"
                        onClick={() => updateEtat(e.id, { etapFinale: !e.etapFinale, ...(e.etapFinale ? {} : { etapInitiale: false }) })}
                        title="État final"
                        className={`flex-shrink-0 text-xs px-2 py-1 rounded-lg border transition-colors ${e.etapFinale ? 'bg-gray-200 text-gray-700 border-gray-400' : 'text-gray-400 border-gray-200 hover:bg-gray-100'}`}
                      >
                        ■
                      </button>
                      <button
                        type="button"
                        onClick={() => supprimerEtat(e.id)}
                        className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors"
                        aria-label="Supprimer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {wfEtats.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4 border border-dashed rounded-xl">
                      Aucun état — cliquez sur "Ajouter un état"
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  <span className="font-medium text-blue-600">▶</span> = état initial &nbsp;·&nbsp;
                  <span className="font-medium text-gray-600">■</span> = état final
                </p>
              </div>

              {/* ── Transitions ────────────────────────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">Transitions ({wfTransitions.length})</p>
                  <button
                    type="button"
                    onClick={ajouterTransition}
                    disabled={wfEtats.length < 2}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-40"
                  >
                    <Plus size={12} /> Ajouter une transition
                  </button>
                </div>

                <div className="space-y-3">
                  {wfTransitions.map((t) => (
                    <div key={t.id} className="border rounded-xl p-3 bg-gray-50 space-y-2.5">
                      {/* De → Vers + label */}
                      <div className="flex items-center gap-2">
                        <select
                          value={t.etatSourceCode}
                          onChange={(ev) => updateTransition(t.id, { etatSourceCode: ev.target.value })}
                          className="flex-1 border rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          aria-label="État source"
                        >
                          {wfEtats.map((e) => <option key={e.code} value={e.code}>{e.libelle || e.code || '—'}</option>)}
                        </select>
                        <ArrowRight size={14} className="text-gray-400 flex-shrink-0" />
                        <select
                          value={t.etatCibleCode}
                          onChange={(ev) => updateTransition(t.id, { etatCibleCode: ev.target.value })}
                          className="flex-1 border rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          aria-label="État cible"
                        >
                          {wfEtats.map((e) => <option key={e.code} value={e.code}>{e.libelle || e.code || '—'}</option>)}
                        </select>
                        <button
                          type="button"
                          onClick={() => supprimerTransition(t.id)}
                          className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors"
                          aria-label="Supprimer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      {/* Label */}
                      <input
                        value={t.libelle}
                        placeholder="Label de la transition (ex : Confirmer)"
                        onChange={(ev) => updateTransition(t.id, { libelle: ev.target.value })}
                        className="w-full border rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {/* Rôles */}
                      <div>
                        <p className="text-xs text-gray-400 mb-1.5">Rôles autorisés</p>
                        <div className="flex flex-wrap gap-1.5">
                          {ROLES_DISPONIBLES.map((role) => (
                            <button
                              key={role}
                              type="button"
                              onClick={() => toggleRole(t.id, role)}
                              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                                t.rolesAutorises.includes(role)
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'text-gray-500 border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {wfTransitions.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4 border border-dashed rounded-xl">
                      Aucune transition — ajoutez-en une ou sélectionnez un template
                    </p>
                  )}
                </div>
              </div>

              {(creerWorkflowMutation.isError || modifierWorkflowMutation.isError) && (
                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  Erreur lors de l'enregistrement du workflow.
                </p>
              )}
            </div>

            {/* Pied fixe */}
            <div className="flex gap-3 px-6 py-4 border-t bg-gray-50 flex-shrink-0">
              <button
                type="button"
                onClick={() => { setShowWorkflowModal(false); setEditingWorkflowId(null); }}
                className="px-4 py-2 rounded-xl text-sm border hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={
                  !wfNom.trim() ||
                  wfEtats.length === 0 ||
                  wfEtats.some((e) => !e.code || !e.libelle) ||
                  creerWorkflowMutation.isPending ||
                  modifierWorkflowMutation.isPending
                }
                onClick={() => {
                  const payload = {
                    nom: wfNom,
                    etats: wfEtats.map(({ id: _id, ...rest }) => rest),
                    transitions: wfTransitions.map(({ id: _id, ...rest }) => rest),
                  };
                  if (editingWorkflowId) {
                    modifierWorkflowMutation.mutate({ workflowId: editingWorkflowId, ...payload });
                  } else {
                    creerWorkflowMutation.mutate({ entite: workflowEntite, ...payload });
                  }
                }}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {(creerWorkflowMutation.isPending || modifierWorkflowMutation.isPending)
                  ? 'Enregistrement...'
                  : editingWorkflowId ? 'Enregistrer les modifications' : 'Créer le workflow'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* Modal nouveau champ personnalisé                                          */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {showChampModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">Nouveau champ personnalisé</h3>
              <button type="button" onClick={() => setShowChampModal(false)} aria-label="Fermer">
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="champ-entite" className="text-sm text-gray-600">Entité *</label>
                  <select
                    id="champ-entite"
                    value={champForm.entite}
                    onChange={(e) => setChampForm({ ...champForm, entite: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    {ENTITES_CHAMP.map((e) => <option key={e.code} value={e.code}>{e.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="champ-type" className="text-sm text-gray-600">Type *</label>
                  <select
                    id="champ-type"
                    value={champForm.type}
                    onChange={(e) => setChampForm({ ...champForm, type: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    {TYPES_CHAMP.map((t) => <option key={t.code} value={t.code}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="champ-label" className="text-sm text-gray-600">Label (affiché) *</label>
                <input
                  id="champ-label"
                  value={champForm.label}
                  placeholder="Ex : Numéro de TVA"
                  onChange={(e) => setChampForm({ ...champForm, label: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label htmlFor="champ-nom" className="text-sm text-gray-600">Code technique *</label>
                <input
                  id="champ-nom"
                  value={champForm.nom}
                  placeholder="Ex : numero_tva"
                  onChange={(e) => setChampForm({ ...champForm, nom: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-400 mt-1">Identifiant unique, minuscules et underscores uniquement.</p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={champForm.obligatoire}
                  onChange={(e) => setChampForm({ ...champForm, obligatoire: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">Champ obligatoire</span>
              </label>
              {creerChampMutation.isError && (
                <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  Erreur : code déjà utilisé pour cette entité, ou données invalides.
                </p>
              )}
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button type="button" onClick={() => setShowChampModal(false)}
                className="px-4 py-2 rounded-xl text-sm border hover:bg-gray-50">
                Annuler
              </button>
              <button
                type="button"
                disabled={!champForm.nom || !champForm.label || creerChampMutation.isPending}
                onClick={() => creerChampMutation.mutate(champForm)}
                className="flex-1 bg-teal-600 text-white py-2 rounded-xl text-sm hover:bg-teal-700 disabled:opacity-50"
              >
                {creerChampMutation.isPending ? 'Création...' : 'Créer le champ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── WorkflowCard ─────────────────────────────────────────────────────────────

function WorkflowCard({ workflow, onEdit }: { workflow: any; onEdit: (wf: any) => void }) {
  const [open, setOpen] = useState(false);

  const entiteLabel = ENTITES_WORKFLOW.find((e) => e.code === workflow.entite)?.label ?? workflow.entite;

  return (
    <div className="border-b last:border-0">
      <div className="px-6 py-4 flex items-center gap-4">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-800">{workflow.nom}</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{entiteLabel}</span>
            {!workflow.actif && <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">Inactif</span>}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {workflow.etats?.length ?? 0} états · {workflow.transitions?.length ?? 0} transitions
          </p>
        </button>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => onEdit(workflow)}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            <Pencil size={12} /> Modifier
          </button>
          {open
            ? <ChevronDown size={16} className="text-gray-400 cursor-pointer" onClick={() => setOpen(false)} />
            : <ChevronRight size={16} className="text-gray-400 cursor-pointer" onClick={() => setOpen(true)} />}
        </div>
      </div>

      {open && (
        <div className="px-6 pb-5 space-y-4">
          {/* États */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">États</p>
            <div className="flex flex-wrap gap-2">
              {(workflow.etats ?? []).map((e: any) => (
                <EtatBadge
                  key={e.id}
                  libelle={e.libelle}
                  couleur={e.couleur}
                  initial={e.etapInitiale}
                  final={e.etapFinale}
                />
              ))}
            </div>
          </div>

          {/* Transitions */}
          {(workflow.transitions ?? []).length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Transitions</p>
              {/* Mobile */}
              <div className="space-y-2 md:hidden">
                {(workflow.transitions ?? []).map((t: any) => (
                  <div key={t.id} className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg px-3 py-2">
                    <span className="font-medium text-gray-700">{t.etatSource?.libelle ?? '?'}</span>
                    <ArrowRight size={12} className="text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-700">{t.etatCible?.libelle ?? '?'}</span>
                    <span className="ml-auto text-gray-400 text-right truncate max-w-[100px]">
                      {(t.rolesAutorises as string[]).join(', ')}
                    </span>
                  </div>
                ))}
              </div>
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto rounded-lg border">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-500">De</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-500">Vers</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-500">Label</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-500">Rôles autorisés</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(workflow.transitions ?? []).map((t: any) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-xs"
                            style={{ backgroundColor: t.etatSource?.couleur ?? '#9CA3AF' }}>
                            {t.etatSource?.libelle ?? '?'}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-xs"
                            style={{ backgroundColor: t.etatCible?.couleur ?? '#9CA3AF' }}>
                            {t.etatCible?.libelle ?? '?'}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-600">{t.libelle}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-1">
                            {(t.rolesAutorises as string[]).map((r) => (
                              <span key={r} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">{r}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
