'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface LigneForm {
  produitId: string;
  quantite: string;
  prixUnitaire: string;
  description: string;
}

export default function NouvelleCommandePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();

  const [clientId, setClientId] = useState('');
  const [datelivraison, setDateLivraison] = useState('');
  const [notes, setNotes] = useState('');
  const [lignes, setLignes] = useState<LigneForm[]>([
    { produitId: '', quantite: '1', prixUnitaire: '', description: '' },
  ]);

  const { data: clients } = useQuery({
    queryKey: ['clients-select'],
    queryFn: async () => {
      const { data } = await api.get('/crm/clients', { params: { limite: 100 } });
      return data;
    },
  });

  const { data: produits } = useQuery({
    queryKey: ['produits-select'],
    queryFn: async () => {
      const { data } = await api.get('/crm/produits', { params: { limite: 100 } });
      return data;
    },
  });

  const creerMutation = useMutation({
    mutationFn: (payload: object) => api.post('/commandes', payload),
    onSuccess: (res) => {
      toast.success('Commande créée avec succès');
      router.push(`/${params.tenant as string}/commandes/${(res.data as { id: string }).id}`);
    },
    onError: () => toast.error('Erreur lors de la création de la commande'),
  });

  const ajouterLigne = () =>
    setLignes([...lignes, { produitId: '', quantite: '1', prixUnitaire: '', description: '' }]);

  const supprimerLigne = (idx: number) =>
    setLignes(lignes.filter((_, i) => i !== idx));

  const updateLigne = (idx: number, field: keyof LigneForm, val: string) => {
    const next = [...lignes];
    next[idx] = { ...next[idx], [field]: val };
    // Auto-remplir le prix si produit sélectionné
    if (field === 'produitId' && val) {
      const produit = produits?.items?.find((p: { id: string; prixVente?: number }) => p.id === val);
      if (produit?.prixVente) next[idx].prixUnitaire = String(produit.prixVente);
    }
    setLignes(next);
  };

  const totalHT = lignes.reduce((s, l) => s + (Number(l.quantite) * Number(l.prixUnitaire) || 0), 0);
  const totalTTC = totalHT * 1.18;

  const fmt = (v: number) => new Intl.NumberFormat('fr-SN', { maximumFractionDigits: 0 }).format(v) + ' FCFA';

  const soumettre = () => {
    if (!clientId) { toast.warning('Veuillez sélectionner un client'); return; }
    const lignesValides = lignes.filter((l) => l.produitId && l.quantite && l.prixUnitaire);
    if (lignesValides.length === 0) {
      toast.warning('Chaque ligne doit avoir un produit, une quantité et un prix unitaire'); return;
    }
    const lignesPayload = lignes
      .filter((l) => l.produitId && l.quantite && l.prixUnitaire)
      .map((l) => ({
        produitId: l.produitId,
        description: l.description || undefined,
        quantite: Number(l.quantite),
        prixUnitaire: Number(l.prixUnitaire),
      }));

    if (lignesPayload.length === 0) {
      toast.warning('Chaque ligne doit avoir un produit, une quantité et un prix'); return;
    }

    creerMutation.mutate({
      clientId,
      dateLivraison: datelivraison || undefined,
      notes: notes || undefined,
      lignes: lignesPayload,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Retour"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Nouvelle commande</h1>
      </div>

      {/* Informations générales */}
      <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-700">Informations générales</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cmd-client" className="text-sm text-gray-600">Client *</label>
            <select
              id="cmd-client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Sélectionner —</option>
              {clients?.items?.map((c: { id: string; nom: string }) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cmd-livraison" className="text-sm text-gray-600">Date de livraison prévue</label>
            <input
              id="cmd-livraison"
              type="date"
              value={datelivraison}
              onChange={(e) => setDateLivraison(e.target.value)}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="col-span-2">
            <label htmlFor="cmd-notes" className="text-sm text-gray-600">Notes</label>
            <textarea
              id="cmd-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Lignes de commande */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">Lignes de commande</h2>
          <button
            type="button"
            onClick={ajouterLigne}
            className="flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-800"
          >
            <Plus size={15} /> Ajouter une ligne
          </button>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b text-xs text-gray-500">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Produit</th>
              <th className="text-left px-4 py-2 font-medium">Description</th>
              <th className="text-right px-4 py-2 font-medium">Qté</th>
              <th className="text-right px-4 py-2 font-medium">Prix unit. (FCFA)</th>
              <th className="text-right px-4 py-2 font-medium">Total HT</th>
              <th scope="col" className="px-4 py-2 sr-only">Supprimer</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {lignes.map((l, idx) => (
              <tr key={idx}>
                <td className="px-4 py-2">
                  <select
                    aria-label={`Produit ligne ${idx + 1}`}
                    value={l.produitId}
                    onChange={(e) => updateLigne(idx, 'produitId', e.target.value)}
                    className={`w-full border rounded px-2 py-1 text-sm ${!l.produitId ? 'border-orange-300' : ''}`}
                  >
                    <option value="">— Sélectionner —</option>
                    {produits?.items?.map((p: { id: string; nom: string }) => (
                      <option key={p.id} value={p.id}>{p.nom}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    aria-label={`Description ligne ${idx + 1}`}
                    value={l.description}
                    onChange={(e) => updateLigne(idx, 'description', e.target.value)}
                    placeholder="Description libre..."
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    aria-label={`Quantité ligne ${idx + 1}`}
                    value={l.quantite}
                    onChange={(e) => updateLigne(idx, 'quantite', e.target.value)}
                    min="1"
                    className="w-20 border rounded px-2 py-1 text-sm text-right ml-auto block"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    aria-label={`Prix unitaire ligne ${idx + 1}`}
                    value={l.prixUnitaire}
                    onChange={(e) => updateLigne(idx, 'prixUnitaire', e.target.value)}
                    className="w-32 border rounded px-2 py-1 text-sm text-right ml-auto block"
                  />
                </td>
                <td className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                  {fmt(Number(l.quantite) * Number(l.prixUnitaire) || 0)}
                </td>
                <td className="px-4 py-2">
                  <button
                    type="button"
                    aria-label="Supprimer la ligne"
                    onClick={() => supprimerLigne(idx)}
                    disabled={lignes.length === 1}
                    className="text-gray-300 hover:text-red-500 disabled:opacity-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totaux */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <div className="space-y-1 text-sm min-w-48">
            <div className="flex justify-between text-gray-600">
              <span>Total HT</span>
              <span className="font-medium">{fmt(totalHT)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>TVA 18%</span>
              <span>{fmt(totalTTC - totalHT)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 border-t pt-1">
              <span>Total TTC</span>
              <span>{fmt(totalTTC)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={soumettre}
          disabled={creerMutation.isPending}
          className="bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50 font-medium"
        >
          {creerMutation.isPending ? 'Création...' : 'Créer la commande'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-lg text-sm border hover:bg-gray-50"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
