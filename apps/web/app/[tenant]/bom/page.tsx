'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import {
  Plus, Search, Trash2, X, Layers, ChevronDown, ChevronRight,
  ToggleLeft, ToggleRight, Calculator,
} from 'lucide-react';
import { usePermissions } from '@/lib/permissions-context';

interface BomItem {
  id: string;
  quantite: number;
  unite: string;
  pertes: number;
  notes?: string;
  matierePremiere?: { id: string; nom: string; reference: string; unite: string; prixAchat?: number };
  produit?: { id: string; nom: string; reference: string };
}

interface Bom {
  id: string;
  nom: string;
  version: string;
  actif: boolean;
  notes?: string;
  produitFini?: { id: string; nom: string; reference: string };
  items?: BomItem[];
  _count?: { items: number };
}

const FORM_VIDE = { nom: '', produitFiniId: '', version: '1.0', notes: '' };

export default function BomPage() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modal, setModal] = useState<'create' | 'cout' | null>(null);
  const [selected, setSelected] = useState<Bom | null>(null);
  const [coutQte, setCoutQte] = useState('100');
  const [coutResult, setCoutResult] = useState<any>(null);
  const [formData, setFormData] = useState(FORM_VIDE);
  const [confirmDelete, setConfirmDelete] = useState<Bom | null>(null);
  const qc = useQueryClient();
  const toast = useToast();
  const { peutEcrire, peutSupprimer } = usePermissions('bom');

  const { data, isLoading } = useQuery({
    queryKey: ['bom', search],
    queryFn: async () => (await api.get('/bom', { params: { search, limite: 50 } })).data,
  });

  const { data: bomDetail } = useQuery({
    queryKey: ['bom-detail', expanded],
    queryFn: async () => expanded ? (await api.get(`/bom/${expanded}`)).data : null,
    enabled: !!expanded,
  });

  const creerMutation = useMutation({
    mutationFn: (d: typeof formData) => api.post('/bom', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bom'] });
      setModal(null);
      setFormData(FORM_VIDE);
      toast.success('Nomenclature créée');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erreur lors de la création'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/bom/${id}/toggle-actif`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bom'] }),
  });

  const supprimerMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/bom/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bom'] });
      setExpanded(null);
      setConfirmDelete(null);
      toast.success('Nomenclature supprimée');
    },
    onError: () => toast.error('Impossible de supprimer cette nomenclature'),
  });

  const calculerCout = async () => {
    if (!selected) return;
    try {
      const res = await api.get(`/bom/${selected.id}/cout`, { params: { quantite: coutQte } });
      setCoutResult(res.data);
    } catch {
      toast.error('Erreur lors du calcul du coût');
    }
  };

  const toggleExpand = (id: string) => setExpanded(expanded === id ? null : id);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Nomenclatures (BOM)</h1>
          <p className="text-xs text-gray-500 mt-0.5">Bill of Materials — composition des produits finis</p>
        </div>
        {peutEcrire && (
          <button type="button" onClick={() => { setFormData(FORM_VIDE); setModal('create'); }}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
            <Plus size={16} /> Nouvelle nomenclature
          </button>
        )}
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une nomenclature..."
          className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Liste accordéon */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden divide-y">
          {data?.items?.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
              <Layers size={32} className="mx-auto mb-2 text-gray-300" />
              Aucune nomenclature. Créez-en une pour définir la composition de vos produits.
            </div>
          )}
          {data?.items?.map((bom: Bom) => (
            <div key={bom.id}>
              {/* En-tête */}
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                <button type="button" aria-label={expanded === bom.id ? 'Réduire' : 'Développer'}
                  onClick={() => toggleExpand(bom.id)}
                  className="text-gray-400 hover:text-gray-600">
                  {expanded === bom.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                  <Layers size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm text-gray-800">{bom.nom}</p>
                    <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">v{bom.version}</span>
                    {bom.actif
                      ? <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">Actif</span>
                      : <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Inactif</span>
                    }
                  </div>
                  {bom.produitFini && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Produit : {bom.produitFini.nom} ({bom.produitFini.reference})
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 text-xs text-gray-400">
                  {bom._count?.items ?? 0} composant(s)
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button type="button" aria-label="Calculer le coût théorique"
                    onClick={() => { setSelected(bom); setCoutResult(null); setModal('cout'); }}
                    className="p-1.5 rounded hover:bg-green-50 text-gray-400 hover:text-green-600">
                    <Calculator size={14} />
                  </button>
                  <button type="button" aria-label={bom.actif ? 'Désactiver la nomenclature' : 'Activer la nomenclature'}
                    onClick={() => toggleMutation.mutate(bom.id)}
                    className="p-1.5 rounded hover:bg-yellow-50 text-gray-400 hover:text-yellow-600">
                    {bom.actif ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  </button>
                  {peutSupprimer && (
                    <button type="button" aria-label="Supprimer la nomenclature"
                      onClick={() => setConfirmDelete(bom)}
                      className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Items en accordéon */}
              {expanded === bom.id && (
                <div className="bg-gray-50 border-t px-6 py-4">
                  {!bomDetail ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700" />
                    </div>
                  ) : bomDetail.items?.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">
                      Aucun composant défini pour cette nomenclature.
                    </p>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-500 border-b">
                          <th className="text-left pb-2 font-medium">Composant</th>
                          <th className="text-right pb-2 font-medium">Qté</th>
                          <th className="text-right pb-2 font-medium">Unité</th>
                          <th className="text-right pb-2 font-medium">Pertes %</th>
                          <th className="text-right pb-2 font-medium">Prix unit.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {bomDetail.items.map((item: BomItem) => {
                          const nom = item.matierePremiere?.nom ?? item.produit?.nom ?? '—';
                          const ref = item.matierePremiere?.reference ?? item.produit?.reference ?? '';
                          const prix = item.matierePremiere?.prixAchat;
                          return (
                            <tr key={item.id} className="text-gray-600">
                              <td className="py-1.5">
                                <span className="font-medium text-gray-700">{nom}</span>
                                {ref && <span className="text-gray-400 ml-1">({ref})</span>}
                              </td>
                              <td className="text-right py-1.5">{Number(item.quantite).toFixed(3)}</td>
                              <td className="text-right py-1.5">{item.unite}</td>
                              <td className="text-right py-1.5">
                                {Number(item.pertes) > 0
                                  ? <span className="text-orange-500">{Number(item.pertes)}%</span>
                                  : <span className="text-gray-400">0%</span>
                                }
                              </td>
                              <td className="text-right py-1.5">
                                {prix ? `${Number(prix).toLocaleString('fr-FR')} F` : <span className="text-gray-400">—</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                  {bomDetail?.notes && (
                    <p className="text-xs text-gray-500 mt-3 italic border-t pt-2">{bomDetail.notes}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal création */}
      {modal === 'create' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Nouvelle nomenclature</h2>
              <button type="button" aria-label="Fermer" onClick={() => setModal(null)}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="bom-nom" className="text-sm text-gray-600">Nom *</label>
                <input id="bom-nom" type="text" value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  placeholder="ex: Nomenclature Sac PE 50kg"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="bom-produit" className="text-sm text-gray-600">ID Produit fini *</label>
                <input id="bom-produit" type="text" value={formData.produitFiniId}
                  onChange={(e) => setFormData({ ...formData, produitFiniId: e.target.value })}
                  placeholder="UUID de la matière première ou produit"
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-gray-400 mt-1">Collez l&apos;ID depuis la page Matières Premières ou Produits</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="bom-version" className="text-sm text-gray-600">Version</label>
                  <input id="bom-version" type="text" value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label htmlFor="bom-notes" className="text-sm text-gray-600">Notes</label>
                <textarea id="bom-notes" rows={2} value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button type="button"
                onClick={() => creerMutation.mutate(formData)}
                disabled={!formData.nom || !formData.produitFiniId || creerMutation.isPending}
                className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50">
                {creerMutation.isPending ? 'Création...' : 'Créer la nomenclature'}
              </button>
              <button type="button" onClick={() => setModal(null)}
                className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal calcul coût */}
      {modal === 'cout' && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Coût théorique — {selected.nom}</h2>
              <button type="button" aria-label="Fermer" onClick={() => setModal(null)}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor="cout-qte" className="text-sm text-gray-600">Quantité à produire</label>
                  <input id="cout-qte" type="number" min={1} value={coutQte}
                    onChange={(e) => setCoutQte(e.target.value)}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex items-end">
                  <button type="button" onClick={calculerCout}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center gap-2">
                    <Calculator size={15} /> Calculer
                  </button>
                </div>
              </div>

              {coutResult && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Coût unitaire</span>
                    <span className="font-semibold text-gray-800">{Number(coutResult.coutUnitaire).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-3">
                    <span className="text-gray-600 font-medium">Coût total ({coutResult.quantite} unités)</span>
                    <span className="font-bold text-blue-700 text-base">{Number(coutResult.coutTotal).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  {coutResult.details?.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-xs font-medium text-gray-600 mb-2">Détail par composant</p>
                      <div className="space-y-1">
                        {coutResult.details.map((d: any, i: number) => (
                          <div key={i} className="flex justify-between text-xs text-gray-500">
                            <span>{d.nom} ({d.quantite.toFixed(3)} kg)</span>
                            <span>{Number(d.sousTotal).toLocaleString('fr-FR')} F</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="px-6 pb-6">
              <button type="button" onClick={() => setModal(null)}
                className="w-full border py-2 rounded-lg text-sm hover:bg-gray-50">
                Fermer
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
            <h3 className="font-semibold text-gray-800 mb-1">Supprimer cette nomenclature ?</h3>
            <p className="text-sm text-gray-500 mb-5">
              <strong>{confirmDelete.nom}</strong> et tous ses composants seront supprimés.
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
