'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Shield, ChevronDown, ChevronUp, Check, X, Save, Eye, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

const MODULES = [
  { code: 'crm',                 label: 'CRM / Clients' },
  { code: 'commandes',           label: 'Commandes' },
  { code: 'production',          label: 'Production' },
  { code: 'stock',               label: 'Stock' },
  { code: 'facturation',         label: 'Facturation' },
  { code: 'recyclage',           label: 'Recyclage' },
  { code: 'reporting',           label: 'Reporting' },
  { code: 'fournisseurs',        label: 'Fournisseurs' },
  { code: 'machines',            label: 'Machines' },
  { code: 'matieres-premieres',  label: 'Matières Premières' },
  { code: 'logistique',          label: 'Logistique' },
  { code: 'bom',                 label: 'Nomenclatures (BOM)' },
] as const;

type ModuleCode = typeof MODULES[number]['code'];

interface PermissionModule { lire: boolean; ecrire: boolean; supprimer: boolean; }
type PermissionsMap = Partial<Record<ModuleCode, PermissionModule>>;

interface Groupe {
  id: string;
  code: string;
  nom: string;
  description?: string;
  permissions: PermissionsMap;
  actif: boolean;
}

const ROLE_COLORS: Record<string, string> = {
  admin:       'bg-red-50 text-red-700 border-red-200',
  direction:   'bg-purple-50 text-purple-700 border-purple-200',
  commercial:  'bg-blue-50 text-blue-700 border-blue-200',
  production:  'bg-orange-50 text-orange-700 border-orange-200',
  magasinier:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  comptable:   'bg-green-50 text-green-700 border-green-200',
};

const vide = (): PermissionModule => ({ lire: false, ecrire: false, supprimer: false });

// ─── Composant case à cocher permissions ────────────────────────────────────

function CasePermission({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={() => !disabled && onChange(!checked)}
      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors mx-auto
        ${checked
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'bg-white border-gray-300 hover:border-blue-400'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
      {checked && <Check size={12} />}
    </button>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export default function GroupesPage() {
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [editionId, setEditionId] = useState<string | null>(null);
  const [permissionsLocales, setPermissionsLocales] = useState<PermissionsMap>({});
  const qc = useQueryClient();
  const toast = useToast();

  const { data: groupes = [], isLoading } = useQuery<Groupe[]>({
    queryKey: ['groupes'],
    queryFn: async () => (await api.get('/groupes')).data,
  });

  const sauvegarderMutation = useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: PermissionsMap }) =>
      api.patch(`/groupes/${id}/permissions`, { permissions }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groupes'] });
      setEditionId(null);
      toast.success('Permissions mises à jour');
    },
    onError: () => toast.error('Erreur lors de la sauvegarde'),
  });

  const toggleActifMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/groupes/${id}/toggle-actif`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groupes'] }),
    onError: () => toast.error('Erreur'),
  });

  const ouvrirEdition = (groupe: Groupe) => {
    setEditionId(groupe.id);
    setOuvert(groupe.id);
    // Initialiser avec les permissions actuelles (compléter les modules manquants)
    const init: PermissionsMap = {};
    for (const m of MODULES) {
      init[m.code] = groupe.permissions[m.code] ?? vide();
    }
    setPermissionsLocales(init);
  };

  const annulerEdition = () => { setEditionId(null); setPermissionsLocales({}); };

  const setPermission = (moduleCode: ModuleCode, action: keyof PermissionModule, value: boolean) => {
    setPermissionsLocales((prev) => {
      const modulePerms = prev[moduleCode] ?? vide();
      const updated = { ...modulePerms, [action]: value };
      // Si ecrire ou supprimer activé → lire obligatoire
      if ((action === 'ecrire' || action === 'supprimer') && value) updated.lire = true;
      // Si lire désactivé → tout désactiver
      if (action === 'lire' && !value) { updated.ecrire = false; updated.supprimer = false; }
      return { ...prev, [moduleCode]: updated };
    });
  };

  const toutCocher = (moduleCode: ModuleCode, valeur: boolean) => {
    setPermissionsLocales((prev) => ({
      ...prev,
      [moduleCode]: { lire: valeur, ecrire: valeur, supprimer: valeur },
    }));
  };

  if (isLoading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Groupes & Permissions</h1>
        <p className="text-sm text-gray-500">Configurez les droits d'accès par module pour chaque groupe d'utilisateurs</p>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap gap-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
        <div className="flex items-center gap-1.5"><Eye size={13} /> <span><strong>Lire</strong> — consulter les données</span></div>
        <div className="flex items-center gap-1.5"><Pencil size={13} /> <span><strong>Écrire</strong> — créer et modifier</span></div>
        <div className="flex items-center gap-1.5"><X size={13} /> <span><strong>Supprimer</strong> — archiver / supprimer</span></div>
      </div>

      {/* Groupes */}
      <div className="space-y-3">
        {groupes.map((groupe) => {
          const isOuvert = ouvert === groupe.id;
          const isEnEdition = editionId === groupe.id;
          const permsAffichees = isEnEdition ? permissionsLocales : groupe.permissions;
          const colorClass = ROLE_COLORS[groupe.code] ?? 'bg-gray-50 text-gray-700 border-gray-200';

          return (
            <div key={groupe.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${!groupe.actif ? 'opacity-60' : ''}`}>
              {/* En-tête groupe */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1.5 rounded-lg border text-sm font-semibold ${colorClass}`}>
                    <Shield size={13} className="inline mr-1.5" />
                    {groupe.nom}
                  </div>
                  <div>
                    {groupe.description && <p className="text-sm text-gray-500">{groupe.description}</p>}
                    <p className="text-xs text-gray-400">
                      {MODULES.filter((m) => permsAffichees[m.code]?.lire).length} module(s) accessibles
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Toggle actif */}
                  <button type="button"
                    onClick={() => toggleActifMutation.mutate(groupe.id)}
                    title={groupe.actif ? 'Désactiver le groupe' : 'Activer le groupe'}
                    className="text-gray-400 hover:text-blue-600 transition-colors">
                    {groupe.actif
                      ? <ToggleRight size={22} className="text-green-500" />
                      : <ToggleLeft size={22} />}
                  </button>
                  {/* Déplier / replier */}
                  <button type="button"
                    onClick={() => { setOuvert(isOuvert ? null : groupe.id); if (isEnEdition) annulerEdition(); }}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    {isOuvert ? <><ChevronUp size={16} /> Masquer</> : <><ChevronDown size={16} /> Voir les droits</>}
                  </button>
                </div>
              </div>

              {/* Tableau permissions */}
              {isOuvert && (
                <div className="border-t">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 w-56">Module</th>
                          <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500 w-24">
                            <Eye size={12} className="inline mr-1" />Lire
                          </th>
                          <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500 w-24">
                            <Pencil size={12} className="inline mr-1" />Écrire
                          </th>
                          <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500 w-24">
                            <X size={12} className="inline mr-1" />Supprimer
                          </th>
                          {isEnEdition && (
                            <th className="text-center px-4 py-2.5 text-xs font-medium text-gray-500 w-24">Tout</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {MODULES.map((mod) => {
                          const p = permsAffichees[mod.code] ?? vide();
                          const toutActif = p.lire && p.ecrire && p.supprimer;
                          return (
                            <tr key={mod.code} className={`hover:bg-gray-50 ${!p.lire ? 'opacity-50' : ''}`}>
                              <td className="px-5 py-2.5 text-sm text-gray-700 font-medium">{mod.label}</td>
                              <td className="px-4 py-2.5">
                                <CasePermission checked={p.lire} disabled={!isEnEdition}
                                  onChange={(v) => setPermission(mod.code, 'lire', v)} />
                              </td>
                              <td className="px-4 py-2.5">
                                <CasePermission checked={p.ecrire} disabled={!isEnEdition}
                                  onChange={(v) => setPermission(mod.code, 'ecrire', v)} />
                              </td>
                              <td className="px-4 py-2.5">
                                <CasePermission checked={p.supprimer} disabled={!isEnEdition}
                                  onChange={(v) => setPermission(mod.code, 'supprimer', v)} />
                              </td>
                              {isEnEdition && (
                                <td className="px-4 py-2.5">
                                  <button type="button"
                                    onClick={() => toutCocher(mod.code, !toutActif)}
                                    className={`text-xs px-2 py-0.5 rounded border mx-auto block transition-colors
                                      ${toutActif ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-blue-300'}`}>
                                    {toutActif ? 'Aucun' : 'Tous'}
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Barre d'actions */}
                  <div className="px-5 py-3 bg-gray-50 border-t flex items-center justify-between">
                    {isEnEdition ? (
                      <div className="flex gap-2">
                        <button type="button"
                          onClick={() => sauvegarderMutation.mutate({ id: groupe.id, permissions: permissionsLocales })}
                          disabled={sauvegarderMutation.isPending}
                          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50">
                          <Save size={14} />
                          {sauvegarderMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                        <button type="button" onClick={annulerEdition}
                          className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-100">
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => ouvrirEdition(groupe)}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                        <Pencil size={14} /> Modifier les permissions
                      </button>
                    )}
                    <p className="text-xs text-gray-400">
                      {Object.values(permsAffichees).filter((p) => p?.lire).length} / {MODULES.length} modules
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
