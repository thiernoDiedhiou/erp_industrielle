'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { Plus, Search, Pencil, Trash2, X, Cog, MapPin, Calendar, AlertTriangle, Eye } from 'lucide-react';
import { usePermissions } from '@/lib/permissions-context';

interface Machine {
  id: string;
  code: string;
  nom: string;
  type: string;
  statut: string;
  capacite?: number;
  unite?: string;
  actif: boolean;
  localisation?: string;
  dateDerniereMaintenance?: string;
  prochaineMaintenanceDate?: string;
  _count?: { ofs: number };
}

const STATUTS = ['disponible', 'en_production', 'maintenance', 'en_panne'];

const STATUT_STYLES: Record<string, string> = {
  disponible:    'bg-green-50 text-green-700',
  en_production: 'bg-blue-50 text-blue-700',
  maintenance:   'bg-yellow-50 text-yellow-700',
  en_panne:      'bg-red-50 text-red-700',
};

const FORM_VIDE = {
  code: '', nom: '', type: '', capacite: '', unite: 'kg/h',
  localisation: '', dateDerniereMaintenance: '', prochaineMaintenanceDate: '',
};

function alerteMaintenance(date?: string): boolean {
  if (!date) return false;
  return new Date(date) <= new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 jours
}

export default function MachinesPage() {
  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Machine | null>(null);
  const [formData, setFormData] = useState(FORM_VIDE);
  const [confirmDelete, setConfirmDelete] = useState<Machine | null>(null);
  const [detailMachine, setDetailMachine] = useState<Machine | null>(null);
  const qc = useQueryClient();
  const toast = useToast();
  const { peutEcrire, peutSupprimer } = usePermissions('machines');

  const { data, isLoading } = useQuery({
    queryKey: ['machines', search, filtreStatut],
    queryFn: async () =>
      (await api.get('/machines', { params: { search, statut: filtreStatut || undefined, limite: 50 } })).data,
  });

  const creerMutation = useMutation({
    mutationFn: (d: typeof formData) => api.post('/machines', {
      ...d,
      capacite: d.capacite ? +d.capacite : undefined,
      dateDerniereMaintenance: d.dateDerniereMaintenance || undefined,
      prochaineMaintenanceDate: d.prochaineMaintenanceDate || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['machines'] }); fermerModal(); toast.success('Machine créée'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erreur lors de la création'),
  });

  const modifierMutation = useMutation({
    mutationFn: (d: typeof formData) => api.put(`/machines/${selected!.id}`, {
      ...d,
      capacite: d.capacite ? +d.capacite : undefined,
      dateDerniereMaintenance: d.dateDerniereMaintenance || undefined,
      prochaineMaintenanceDate: d.prochaineMaintenanceDate || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['machines'] }); fermerModal(); toast.success('Machine mise à jour'); },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const changerStatutMutation = useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: string }) =>
      api.patch(`/machines/${id}/statut`, { statut }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['machines'] }),
  });

  const supprimerMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/machines/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['machines'] }); setConfirmDelete(null); toast.success('Machine supprimée'); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Impossible de supprimer cette machine'),
  });

  const ouvrirCreation = () => { setFormData(FORM_VIDE); setSelected(null); setModal('create'); };
  const ouvrirEdition = (m: Machine) => {
    setSelected(m);
    setFormData({
      code: m.code, nom: m.nom, type: m.type,
      capacite: m.capacite?.toString() ?? '', unite: m.unite ?? 'kg/h',
      localisation: m.localisation ?? '',
      dateDerniereMaintenance: m.dateDerniereMaintenance ? m.dateDerniereMaintenance.slice(0, 10) : '',
      prochaineMaintenanceDate: m.prochaineMaintenanceDate ? m.prochaineMaintenanceDate.slice(0, 10) : '',
    });
    setModal('edit');
  };
  const fermerModal = () => { setModal(null); setSelected(null); setFormData(FORM_VIDE); };
  const soumettre = () => modal === 'create' ? creerMutation.mutate(formData) : modifierMutation.mutate(formData);
  const isPending = creerMutation.isPending || modifierMutation.isPending;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Parc Machines</h1>
        {peutEcrire && (
          <button type="button" onClick={ouvrirCreation}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
            <Plus size={16} /> Nouvelle machine
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une machine..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select aria-label="Filtrer par statut" value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">Tous les statuts</option>
          {STATUTS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {/* KPIs */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATUTS.map((s) => {
            const count = data.items?.filter((m: Machine) => m.statut === s).length ?? 0;
            return (
              <div key={s} className="bg-white rounded-xl border shadow-sm p-3 text-center">
                <div className={`text-lg font-bold ${s === 'disponible' ? 'text-green-600' : s === 'en_production' ? 'text-blue-600' : s === 'maintenance' ? 'text-yellow-600' : 'text-red-600'}`}>
                  {count}
                </div>
                <div className="text-xs text-gray-500 capitalize">{s.replace('_', ' ')}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grille machines */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.items?.map((m: Machine) => {
            const maintenanceUrgente = alerteMaintenance(m.prochaineMaintenanceDate);
            return (
              <div key={m.id} className={`bg-white rounded-xl border shadow-sm p-4 ${maintenanceUrgente ? 'border-yellow-300' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Cog size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-gray-800 text-sm">{m.nom}</p>
                        {maintenanceUrgente && (
                          <span title="Maintenance à prévoir">
                            <AlertTriangle size={13} className="text-yellow-500" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{m.code}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button type="button" aria-label={`Voir ${m.nom}`} onClick={() => setDetailMachine(m)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                      <Eye size={13} />
                    </button>
                    {peutEcrire && (
                      <button type="button" aria-label={`Modifier ${m.nom}`} onClick={() => ouvrirEdition(m)}
                        className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                        <Pencil size={13} />
                      </button>
                    )}
                    {peutSupprimer && (
                      <button type="button" aria-label={`Supprimer ${m.nom}`} onClick={() => setConfirmDelete(m)}
                        className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Type</span><span className="font-medium text-gray-700">{m.type}</span>
                  </div>
                  {m.capacite && (
                    <div className="flex justify-between">
                      <span>Capacité</span><span className="font-medium text-gray-700">{m.capacite} {m.unite}</span>
                    </div>
                  )}
                  {m.localisation && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin size={10} /> {m.localisation}
                    </div>
                  )}
                  {m.prochaineMaintenanceDate && (
                    <div className={`flex items-center gap-1 ${maintenanceUrgente ? 'text-yellow-600 font-medium' : 'text-gray-500'}`}>
                      <Calendar size={10} />
                      Maint. {new Date(m.prochaineMaintenanceDate).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>OFs réalisés</span><span className="font-medium text-gray-700">{m._count?.ofs ?? 0}</span>
                  </div>
                </div>

                {/* Changement de statut */}
                <div className="mt-3">
                  <select value={m.statut}
                    aria-label={`Statut de ${m.nom}`}
                    onChange={(e) => changerStatutMutation.mutate({ id: m.id, statut: e.target.value })}
                    className={`w-full text-xs px-2 py-1.5 rounded-lg border-0 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${STATUT_STYLES[m.statut] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUTS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {data?.items?.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">Aucune machine trouvée</div>
      )}

      {/* Modal détail machine */}
      {detailMachine && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Cog size={18} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">{detailMachine.nom}</h2>
                  <p className="text-xs text-gray-400">{detailMachine.code}</p>
                </div>
              </div>
              <button type="button" aria-label="Fermer" onClick={() => setDetailMachine(null)}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-400">Type</p><p className="font-medium text-gray-700">{detailMachine.type}</p></div>
                <div>
                  <p className="text-xs text-gray-400">Statut</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUT_STYLES[detailMachine.statut] ?? 'bg-gray-100 text-gray-600'}`}>
                    {detailMachine.statut.replace('_', ' ')}
                  </span>
                </div>
                {detailMachine.capacite != null && (
                  <div><p className="text-xs text-gray-400">Capacité</p><p className="font-medium text-gray-700">{detailMachine.capacite} {detailMachine.unite}</p></div>
                )}
                {detailMachine.localisation && (
                  <div className="flex items-start gap-1.5">
                    <MapPin size={13} className="text-gray-400 mt-0.5" />
                    <div><p className="text-xs text-gray-400">Localisation</p><p className="font-medium text-gray-700">{detailMachine.localisation}</p></div>
                  </div>
                )}
                {detailMachine.dateDerniereMaintenance && (
                  <div className="flex items-start gap-1.5">
                    <Calendar size={13} className="text-gray-400 mt-0.5" />
                    <div><p className="text-xs text-gray-400">Dernière maintenance</p><p className="font-medium text-gray-700">{new Date(detailMachine.dateDerniereMaintenance).toLocaleDateString('fr-FR')}</p></div>
                  </div>
                )}
                {detailMachine.prochaineMaintenanceDate && (
                  <div className="flex items-start gap-1.5">
                    <Calendar size={13} className={`mt-0.5 ${alerteMaintenance(detailMachine.prochaineMaintenanceDate) ? 'text-yellow-500' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-xs text-gray-400">Prochaine maintenance</p>
                      <p className={`font-medium ${alerteMaintenance(detailMachine.prochaineMaintenanceDate) ? 'text-yellow-600' : 'text-gray-700'}`}>
                        {new Date(detailMachine.prochaineMaintenanceDate).toLocaleDateString('fr-FR')}
                        {alerteMaintenance(detailMachine.prochaineMaintenanceDate) && ' ⚠️'}
                      </p>
                    </div>
                  </div>
                )}
                <div><p className="text-xs text-gray-400">OFs réalisés</p><p className="font-medium text-gray-700">{detailMachine._count?.ofs ?? 0}</p></div>
              </div>
            </div>
            <div className="px-6 pb-5">
              <button type="button" onClick={() => setDetailMachine(null)}
                className="w-full border py-2 rounded-lg text-sm hover:bg-gray-50">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal création / édition */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-800">
                {modal === 'create' ? 'Nouvelle machine' : 'Modifier la machine'}
              </h2>
              <button type="button" aria-label="Fermer" onClick={fermerModal}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: 'Code *', key: 'code', type: 'text' },
                { label: 'Nom *', key: 'nom', type: 'text', span: 2 },
                { label: 'Type *', key: 'type', type: 'text' },
                { label: 'Capacité', key: 'capacite', type: 'number' },
                { label: 'Unité (ex: kg/h)', key: 'unite', type: 'text' },
                { label: 'Localisation', key: 'localisation', type: 'text' },
                { label: 'Dernière maintenance', key: 'dateDerniereMaintenance', type: 'date' },
                { label: 'Prochaine maintenance', key: 'prochaineMaintenanceDate', type: 'date' },
              ].map(({ label, key, type, span }) => (
                <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                  <label htmlFor={`field-${key}`} className="text-sm text-gray-600">{label}</label>
                  <input id={`field-${key}`} type={type}
                    value={formData[key as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button type="button" onClick={soumettre}
                disabled={!formData.code || !formData.nom || !formData.type || isPending}
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
            <h3 className="font-semibold text-gray-800 mb-1">Supprimer cette machine ?</h3>
            <p className="text-sm text-gray-500 mb-5"><strong>{confirmDelete.nom}</strong> sera supprimée.</p>
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
