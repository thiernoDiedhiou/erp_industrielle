'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import {
  AlertTriangle, Package, TrendingDown, Plus, Pencil,
  ClipboardList, X, ArrowUpDown, ArrowUp, ArrowDown,
  Factory, Trash2,
} from 'lucide-react';
import { usePermissions } from '@/lib/permissions-context';

interface MatierePremiere {
  id: string;
  nom: string;
  reference?: string;
  stockActuel: number;
  stockMin?: number;
  unite?: string;
  fournisseur?: { nom: string };
}

interface ProduitFini {
  id: string;
  nom: string;
  reference?: string;
  stockActuel: number;
  stockMin?: number;
  unite?: string;
}

interface Mouvement {
  id: string;
  type: string;
  reference?: string;
  quantite: number;
  motif?: string;
  createdAt: string;
  matierePremiere?: { nom: string; unite?: string };
  produit?: { nom: string; reference?: string };
}

const TYPE_MOUVEMENT: Record<string, { label: string; style: string; icon: React.ReactNode }> = {
  entree:              { label: 'Entrée',            style: 'text-green-700 bg-green-50',  icon: <ArrowUp size={12} /> },
  entree_production:   { label: 'Entrée prod.',      style: 'text-green-700 bg-green-50',  icon: <ArrowUp size={12} /> },
  entree_recyclage:    { label: 'Entrée recyclage',  style: 'text-teal-700 bg-teal-50',    icon: <ArrowUp size={12} /> },
  sortie:              { label: 'Sortie',             style: 'text-red-700 bg-red-50',      icon: <ArrowDown size={12} /> },
  sortie_livraison:    { label: 'Sortie livraison',  style: 'text-orange-700 bg-orange-50',icon: <ArrowDown size={12} /> },
  ajustement_positif:  { label: 'Ajust. +',          style: 'text-blue-700 bg-blue-50',    icon: <ArrowUp size={12} /> },
  ajustement_negatif:  { label: 'Ajust. −',          style: 'text-purple-700 bg-purple-50',icon: <ArrowDown size={12} /> },
};

const FORM_VIDE    = { nom: '', reference: '', unite: 'kg', stockActuel: '', stockMin: '' };
const PF_FORM_VIDE = { nom: '', reference: '', unite: 'pce', stockMin: '', prixUnitaire: '', categorie: 'standard' };

export default function StockPage() {
  const [onglet, setOnglet] = useState<'mp' | 'pf' | 'mouvements'>('mp');
  const [modal, setModal] = useState<'create' | 'edit' | 'inventaire' | 'inventaire-pf' | 'create-pf' | 'edit-pf' | null>(null);
  const [selected, setSelected] = useState<MatierePremiere | ProduitFini | null>(null);
  const [form, setForm] = useState(FORM_VIDE);
  const [pfForm, setPfForm] = useState(PF_FORM_VIDE);
  const [stockReel, setStockReel] = useState('');
  const [confirmDeletePf, setConfirmDeletePf] = useState<ProduitFini | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();
  const { peutEcrire, peutSupprimer } = usePermissions('stock');

  // ── Requêtes ────────────────────────────────────────────────────────────────

  const { data: dataMp, isLoading: loadingMp } = useQuery({
    queryKey: ['stock-tableau-bord'],
    queryFn: async () => (await api.get('/stock/tableau-bord')).data,
    enabled: onglet === 'mp',
  });

  const { data: dataPf, isLoading: loadingPf } = useQuery({
    queryKey: ['stock-produits-finis'],
    queryFn: async () => (await api.get('/stock/produits-finis')).data,
    enabled: onglet === 'pf',
  });

  const { data: dataMouvements, isLoading: loadingMouvements } = useQuery({
    queryKey: ['stock-mouvements'],
    queryFn: async () => (await api.get('/stock/mouvements', { params: { limite: 50 } })).data,
    enabled: onglet === 'mouvements',
  });

  // ── Mutations MP ─────────────────────────────────────────────────────────────

  const creerMutation = useMutation({
    mutationFn: (d: object) => api.post('/matieres-premieres', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-tableau-bord'] });
      fermerModal();
      toast.success('Matière première créée');
    },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const modifierMutation = useMutation({
    mutationFn: (d: object) => api.put(`/matieres-premieres/${selected!.id}`, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-tableau-bord'] });
      fermerModal();
      toast.success('Matière mise à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const inventaireMpMutation = useMutation({
    mutationFn: ({ id, stockReel }: { id: string; stockReel: number }) =>
      api.post(`/stock/matieres/${id}/inventaire`, { stockReel, motif: 'Inventaire physique' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-tableau-bord'] });
      queryClient.invalidateQueries({ queryKey: ['stock-mouvements'] });
      fermerModal();
      toast.success('Inventaire MP enregistré');
    },
    onError: () => toast.error('Erreur lors de l\'inventaire'),
  });

  const inventairePfMutation = useMutation({
    mutationFn: ({ id, stockReel }: { id: string; stockReel: number }) =>
      api.post(`/stock/produits-finis/${id}/inventaire`, { stockReel, motif: 'Inventaire physique' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-produits-finis'] });
      queryClient.invalidateQueries({ queryKey: ['stock-mouvements'] });
      fermerModal();
      toast.success('Inventaire PF enregistré');
    },
    onError: () => toast.error('Erreur lors de l\'inventaire'),
  });

  const creerPfMutation = useMutation({
    mutationFn: (d: object) => api.post('/stock/produits-finis', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-produits-finis'] });
      fermerModal();
      toast.success('Produit fini créé');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erreur lors de la création'),
  });

  const modifierPfMutation = useMutation({
    mutationFn: ({ id, ...d }: { id: string } & object) => api.patch(`/stock/produits-finis/${id}`, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-produits-finis'] });
      fermerModal();
      toast.success('Produit mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const supprimerPfMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/stock/produits-finis/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-produits-finis'] });
      setConfirmDeletePf(null);
      toast.success('Produit archivé');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Erreur lors de la suppression'),
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const ouvrirCreation = () => { setForm(FORM_VIDE); setSelected(null); setModal('create'); };

  const ouvrirEdition = (m: MatierePremiere) => {
    setSelected(m);
    setForm({ nom: m.nom, reference: m.reference ?? '', unite: m.unite ?? 'kg', stockActuel: String(m.stockActuel), stockMin: String(m.stockMin ?? '') });
    setModal('edit');
  };

  const ouvrirInventaireMP = (m: MatierePremiere) => {
    setSelected(m);
    setStockReel(String(m.stockActuel));
    setModal('inventaire');
  };

  const ouvrirInventairePF = (p: ProduitFini) => {
    setSelected(p);
    setStockReel(String(p.stockActuel));
    setModal('inventaire-pf');
  };

  const ouvrirCreationPF = () => {
    setPfForm(PF_FORM_VIDE);
    setSelected(null);
    setModal('create-pf');
  };

  const ouvrirEditionPF = (p: ProduitFini) => {
    setSelected(p);
    setPfForm({
      nom: p.nom,
      reference: p.reference ?? '',
      unite: p.unite ?? 'pce',
      stockMin: String(p.stockMin ?? '0'),
      prixUnitaire: '',
      categorie: 'standard',
    });
    setModal('edit-pf');
  };

  const soumettrepf = () => {
    const payload = {
      nom: pfForm.nom,
      reference: pfForm.reference || undefined,
      unite: pfForm.unite,
      stockMin: pfForm.stockMin ? Number(pfForm.stockMin) : 0,
      prixUnitaire: pfForm.prixUnitaire ? Number(pfForm.prixUnitaire) : undefined,
      categorie: pfForm.categorie || 'standard',
    };
    if (modal === 'create-pf') creerPfMutation.mutate(payload);
    else modifierPfMutation.mutate({ id: selected!.id, ...payload });
  };

  const fermerModal = () => {
    setModal(null);
    setSelected(null);
    setForm(FORM_VIDE);
    setPfForm(PF_FORM_VIDE);
    setStockReel('');
  };

  const soumettre = () => {
    const payload = { nom: form.nom, reference: form.reference || undefined, unite: form.unite, stockActuel: Number(form.stockActuel), stockMin: form.stockMin ? Number(form.stockMin) : undefined };
    if (modal === 'create') creerMutation.mutate(payload);
    else modifierMutation.mutate(payload);
  };

  // ── Données ──────────────────────────────────────────────────────────────────

  const alertesMp: MatierePremiere[] = dataMp?.alertes || [];
  const matieres: MatierePremiere[] = dataMp?.matieres || [];
  const alertesPf: ProduitFini[] = dataPf?.alertes || [];
  const produitsFinis: ProduitFini[] = dataPf?.produits || [];
  const mouvements: Mouvement[] = dataMouvements?.items || [];

  const totalAlertes = alertesMp.length + alertesPf.length;

  const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Gestion du stock</h1>
          {totalAlertes > 0 && (
            <p className="text-xs text-red-600 mt-0.5 flex items-center gap-1">
              <AlertTriangle size={12} /> {totalAlertes} alerte(s) de stock
            </p>
          )}
        </div>
        {peutEcrire && onglet === 'mp' && (
          <button type="button" onClick={ouvrirCreation}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
            <Plus size={16} /> Nouvelle matière
          </button>
        )}
        {peutEcrire && onglet === 'pf' && (
          <button type="button" onClick={ouvrirCreationPF}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800">
            <Plus size={16} /> Nouveau produit
          </button>
        )}
      </div>

      {/* Onglets */}
      <div className="flex gap-1 border-b">
        {[
          { key: 'mp',         label: 'Matières premières', icon: <Package size={14} /> },
          { key: 'pf',         label: 'Produits finis',     icon: <Factory size={14} /> },
          { key: 'mouvements', label: 'Mouvements',         icon: <ArrowUpDown size={14} /> },
        ].map(({ key, label, icon }) => (
          <button key={key} type="button"
            onClick={() => setOnglet(key as typeof onglet)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              onglet === key
                ? 'border-blue-700 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {icon} {label}
            {key === 'mp' && alertesMp.length > 0 && (
              <span className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded-full">{alertesMp.length}</span>
            )}
            {key === 'pf' && alertesPf.length > 0 && (
              <span className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded-full">{alertesPf.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Onglet Matières premières ─────────────────────────────────────────── */}
      {onglet === 'mp' && (
        <>
          {alertesMp.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-red-600" />
                <h2 className="font-semibold text-red-800 text-sm">
                  {alertesMp.length} matière(s) sous le seuil minimum
                </h2>
              </div>
              <div className="space-y-1">
                {alertesMp.map((m) => (
                  <div key={m.id} className="flex justify-between text-sm text-red-700">
                    <span>{m.nom}</span>
                    <span>{m.stockActuel} {m.unite} (min: {m.stockMin})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
              <Package size={15} className="text-gray-500" />
              <h2 className="font-semibold text-gray-700 text-sm">Matières premières</h2>
              <span className="ml-auto text-xs text-gray-400">{matieres.length} articles</span>
            </div>
            {loadingMp ? (
              <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px]">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Matière</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Fournisseur</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Stock actuel</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Seuil min</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">État</th>
                      <th scope="col" className="px-4 py-3 sr-only">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {matieres.map((m) => {
                      const enAlerte = m.stockActuel <= (m.stockMin ?? 0);
                      return (
                        <tr key={m.id} className={`hover:bg-gray-50 ${enAlerte ? 'bg-red-50' : ''}`}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-sm text-gray-800">{m.nom}</p>
                            {m.reference && <p className="text-xs text-gray-400">{m.reference}</p>}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{m.fournisseur?.nom || '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-semibold text-sm ${enAlerte ? 'text-red-600' : 'text-gray-800'}`}>{m.stockActuel}</span>
                            <span className="text-xs text-gray-400 ml-1">{m.unite}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-500">{m.stockMin ?? '—'}</td>
                          <td className="px-4 py-3">
                            {enAlerte ? (
                              <span className="flex items-center gap-1 text-xs text-red-600"><TrendingDown size={12} /> Alerte</span>
                            ) : (
                              <span className="text-xs text-green-600">Normal</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 justify-end">
                              {peutEcrire && (
                                <button type="button" aria-label="Faire l'inventaire"
                                  onClick={() => ouvrirInventaireMP(m)}
                                  className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600" title="Inventaire">
                                  <ClipboardList size={14} />
                                </button>
                              )}
                              {peutEcrire && (
                                <button type="button" aria-label="Modifier"
                                  onClick={() => ouvrirEdition(m)}
                                  className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                                  <Pencil size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {!loadingMp && matieres.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">Aucune matière première</div>
            )}
          </div>
        </>
      )}

      {/* ── Onglet Produits finis ─────────────────────────────────────────────── */}
      {onglet === 'pf' && (
        <>
          {alertesPf.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-red-600" />
                <h2 className="font-semibold text-red-800 text-sm">
                  {alertesPf.length} produit(s) fini(s) sous le seuil minimum
                </h2>
              </div>
              <div className="space-y-1">
                {alertesPf.map((p) => (
                  <div key={p.id} className="flex justify-between text-sm text-red-700">
                    <span>{p.nom}</span>
                    <span>{Number(p.stockActuel)} {p.unite} (min: {p.stockMin ?? 0})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
              <Factory size={15} className="text-gray-500" />
              <h2 className="font-semibold text-gray-700 text-sm">Produits finis</h2>
              <span className="ml-auto text-xs text-gray-400">{produitsFinis.length} produits</span>
            </div>
            {loadingPf ? (
              <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Produit</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Stock actuel</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Seuil min</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">État</th>
                      <th scope="col" className="px-4 py-3 sr-only">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {produitsFinis.map((p) => {
                      const enAlerte = Number(p.stockActuel) <= Number(p.stockMin ?? 0);
                      return (
                        <tr key={p.id} className={`hover:bg-gray-50 ${enAlerte ? 'bg-red-50' : ''}`}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-sm text-gray-800">{p.nom}</p>
                            {p.reference && <p className="text-xs text-gray-400">{p.reference}</p>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-semibold text-sm ${enAlerte ? 'text-red-600' : 'text-gray-800'}`}>
                              {Number(p.stockActuel)}
                            </span>
                            <span className="text-xs text-gray-400 ml-1">{p.unite}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-gray-500">{p.stockMin ?? '—'}</td>
                          <td className="px-4 py-3">
                            {enAlerte ? (
                              <span className="flex items-center gap-1 text-xs text-red-600"><TrendingDown size={12} /> Alerte</span>
                            ) : (
                              <span className="text-xs text-green-600">Normal</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 justify-end">
                              {peutEcrire && (
                                <button type="button" aria-label="Inventaire"
                                  onClick={() => ouvrirInventairePF(p)}
                                  className="p-1.5 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600" title="Ajuster le stock">
                                  <ClipboardList size={14} />
                                </button>
                              )}
                              {peutEcrire && (
                                <button type="button" aria-label="Modifier"
                                  onClick={() => ouvrirEditionPF(p)}
                                  className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Modifier">
                                  <Pencil size={14} />
                                </button>
                              )}
                              {peutSupprimer && (
                                <button type="button" aria-label="Supprimer"
                                  onClick={() => setConfirmDeletePf(p)}
                                  className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500" title="Supprimer">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {!loadingPf && produitsFinis.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">Aucun produit fini</div>
            )}
          </div>
        </>
      )}

      {/* ── Onglet Mouvements ─────────────────────────────────────────────────── */}
      {onglet === 'mouvements' && (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
            <ArrowUpDown size={15} className="text-gray-500" />
            <h2 className="font-semibold text-gray-700 text-sm">Mouvements de stock</h2>
            <span className="ml-auto text-xs text-gray-400">50 derniers</span>
          </div>
          {loadingMouvements ? (
            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-700" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Type</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Article</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Référence</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Quantité</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mouvements.map((m) => {
                    const cfg = TYPE_MOUVEMENT[m.type] ?? { label: m.type, style: 'text-gray-700 bg-gray-50', icon: null };
                    const article = m.matierePremiere?.nom ?? m.produit?.nom ?? '—';
                    const unite = m.matierePremiere?.unite ?? '';
                    const isEntree = m.type.startsWith('entree') || m.type === 'ajustement_positif';
                    return (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmt(m.createdAt)}</td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit font-medium ${cfg.style}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-800">{article}</p>
                          {m.motif && <p className="text-xs text-gray-400">{m.motif}</p>}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{m.reference ?? '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-semibold text-sm ${isEntree ? 'text-green-700' : 'text-red-700'}`}>
                            {isEntree ? '+' : '−'}{Number(m.quantite)}
                          </span>
                          {unite && <span className="text-xs text-gray-400 ml-1">{unite}</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {!loadingMouvements && mouvements.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">Aucun mouvement enregistré</div>
          )}
        </div>
      )}

      {/* Modal création / édition MP */}
      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">
                {modal === 'create' ? 'Nouvelle matière première' : 'Modifier la matière'}
              </h2>
              <button type="button" aria-label="Fermer" onClick={fermerModal}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { id: 'f-nom', label: 'Nom *', key: 'nom', type: 'text' },
                { id: 'f-ref', label: 'Référence', key: 'reference', type: 'text' },
                { id: 'f-unite', label: 'Unité', key: 'unite', type: 'text' },
                { id: 'f-stock', label: 'Stock actuel', key: 'stockActuel', type: 'number' },
                { id: 'f-min', label: 'Seuil minimum', key: 'stockMin', type: 'number' },
              ].map(({ id, label, key, type }) => (
                <div key={key}>
                  <label htmlFor={id} className="text-sm text-gray-600">{label}</label>
                  <input id={id} type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button type="button" onClick={soumettre}
                disabled={!form.nom || creerMutation.isPending || modifierMutation.isPending}
                className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50">
                {creerMutation.isPending || modifierMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={fermerModal} className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal inventaire MP */}
      {modal === 'inventaire' && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Inventaire — {selected.nom}</h2>
              <button type="button" aria-label="Fermer" onClick={fermerModal}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">
                Stock enregistré : <strong>{Number(selected.stockActuel)} {(selected as MatierePremiere).unite}</strong>
              </p>
              <div>
                <label htmlFor="stock-reel-mp" className="text-sm text-gray-600">
                  Stock réel constaté ({(selected as MatierePremiere).unite})
                </label>
                <input id="stock-reel-mp" type="number" value={stockReel}
                  onChange={(e) => setStockReel(e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button type="button"
                onClick={() => inventaireMpMutation.mutate({ id: selected.id, stockReel: Number(stockReel) })}
                disabled={!stockReel || inventaireMpMutation.isPending}
                className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50">
                {inventaireMpMutation.isPending ? 'Enregistrement...' : 'Valider l\'inventaire'}
              </button>
              <button type="button" onClick={fermerModal} className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal créer / modifier Produit fini */}
      {(modal === 'create-pf' || modal === 'edit-pf') && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">
                {modal === 'create-pf' ? 'Nouveau produit fini' : `Modifier — ${selected?.nom}`}
              </h2>
              <button type="button" aria-label="Fermer" onClick={fermerModal}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {([
                { id: 'pf-nom',   label: 'Nom *',          key: 'nom',          type: 'text',   span: 2 },
                { id: 'pf-ref',   label: 'Référence',       key: 'reference',    type: 'text',   span: 1 },
                { id: 'pf-unite', label: 'Unité',           key: 'unite',        type: 'text',   span: 1 },
                { id: 'pf-min',   label: 'Seuil minimum',   key: 'stockMin',     type: 'number', span: 1 },
                { id: 'pf-prix',  label: 'Prix unitaire (FCFA)', key: 'prixUnitaire', type: 'number', span: 1 },
                { id: 'pf-cat',   label: 'Catégorie',       key: 'categorie',    type: 'text',   span: 2 },
              ] as { id: string; label: string; key: keyof typeof pfForm; type: string; span: number }[]).map(({ id, label, key, type, span }) => (
                <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                  <label htmlFor={id} className="text-sm text-gray-600">{label}</label>
                  <input id={id} type={type} min={type === 'number' ? 0 : undefined}
                    value={pfForm[key]}
                    onChange={(e) => setPfForm({ ...pfForm, [key]: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button type="button" onClick={soumettrepf}
                disabled={!pfForm.nom || creerPfMutation.isPending || modifierPfMutation.isPending}
                className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50 font-medium">
                {creerPfMutation.isPending || modifierPfMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={fermerModal}
                className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation suppression PF */}
      {confirmDeletePf && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Archiver ce produit ?</h3>
            <p className="text-sm text-gray-500 mb-5">
              <strong>{confirmDeletePf.nom}</strong> sera archivé et n'apparaîtra plus dans le stock.
            </p>
            <div className="flex gap-3">
              <button type="button"
                onClick={() => supprimerPfMutation.mutate(confirmDeletePf.id)}
                disabled={supprimerPfMutation.isPending}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50">
                {supprimerPfMutation.isPending ? 'Archivage...' : 'Archiver'}
              </button>
              <button type="button" onClick={() => setConfirmDeletePf(null)}
                className="flex-1 border py-2 rounded-lg text-sm hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal inventaire PF */}
      {modal === 'inventaire-pf' && selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-800">Inventaire PF — {selected.nom}</h2>
              <button type="button" aria-label="Fermer" onClick={fermerModal}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">
                Stock enregistré : <strong>{Number(selected.stockActuel)} {(selected as ProduitFini).unite}</strong>
              </p>
              <div>
                <label htmlFor="stock-reel-pf" className="text-sm text-gray-600">
                  Stock réel constaté ({(selected as ProduitFini).unite})
                </label>
                <input id="stock-reel-pf" type="number" value={stockReel}
                  onChange={(e) => setStockReel(e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button type="button"
                onClick={() => inventairePfMutation.mutate({ id: selected.id, stockReel: Number(stockReel) })}
                disabled={!stockReel || inventairePfMutation.isPending}
                className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50">
                {inventairePfMutation.isPending ? 'Enregistrement...' : 'Valider l\'inventaire'}
              </button>
              <button type="button" onClick={fermerModal} className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
