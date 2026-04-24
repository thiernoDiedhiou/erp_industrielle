'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import {
  ArrowLeft, Truck, Mail, Phone, MapPin, Clock, Star,
  Package, AlertTriangle, Pencil, X, ToggleLeft, ToggleRight,
  User, CreditCard, TrendingDown,
} from 'lucide-react';
import { usePermissions } from '@/lib/permissions-context';

interface MatiereLiee {
  id: string;
  nom: string;
  reference?: string;
  stockActuel: number;
  unite?: string;
}

interface Fournisseur {
  id: string;
  reference: string;
  nom: string;
  email?: string;
  telephone?: string;
  pays: string;
  actif: boolean;
  contactPrincipal?: string;
  delaiLivraisonMoyen?: number;
  noteEvaluation?: number;
  conditionsPaiement?: string;
  createdAt: string;
  matieresPrmieres: MatiereLiee[];
}

const FORM_VIDE = {
  nom: '', email: '', telephone: '', pays: 'SN',
  contactPrincipal: '', delaiLivraisonMoyen: '', noteEvaluation: '', conditionsPaiement: '',
};

function EtoilesNote({ note }: { note?: number | string | null }) {
  if (note == null) return <span className="text-sm text-gray-400">Non évalué</span>;
  const n = Number(note);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={16} className={i <= Math.round(n) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
      <span className="text-sm font-semibold text-gray-700 ml-1">{n.toFixed(1)} / 5</span>
    </div>
  );
}

export default function FournisseurDetailPage() {
  const params = useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const toast = useToast();
  const { peutEcrire } = usePermissions('fournisseurs');

  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState(FORM_VIDE);

  const { data: f, isLoading } = useQuery<Fournisseur>({
    queryKey: ['fournisseur', params.id],
    queryFn: async () => (await api.get(`/fournisseurs/${params.id}`)).data,
  });

  const modifierMutation = useMutation({
    mutationFn: (d: typeof editForm) => api.put(`/fournisseurs/${params.id}`, {
      ...d,
      delaiLivraisonMoyen: d.delaiLivraisonMoyen ? +d.delaiLivraisonMoyen : undefined,
      noteEvaluation: d.noteEvaluation ? +d.noteEvaluation : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fournisseur', params.id] });
      qc.invalidateQueries({ queryKey: ['fournisseurs'] });
      setShowEdit(false);
      toast.success('Fournisseur mis à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  const toggleMutation = useMutation({
    mutationFn: () => api.patch(`/fournisseurs/${params.id}/toggle`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fournisseur', params.id] });
      qc.invalidateQueries({ queryKey: ['fournisseurs'] });
    },
  });

  const ouvrirEdit = () => {
    if (!f) return;
    setEditForm({
      nom:                  f.nom,
      email:                f.email                ?? '',
      telephone:            f.telephone            ?? '',
      pays:                 f.pays,
      contactPrincipal:     f.contactPrincipal     ?? '',
      delaiLivraisonMoyen:  f.delaiLivraisonMoyen?.toString() ?? '',
      noteEvaluation:       f.noteEvaluation?.toString()       ?? '',
      conditionsPaiement:   f.conditionsPaiement   ?? '',
    });
    setShowEdit(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700" />
      </div>
    );
  }

  if (!f) return <div className="text-center py-16 text-gray-400">Fournisseur introuvable</div>;

  const mpEnAlerte = f.matieresPrmieres.filter(
    (m) => Number(m.stockActuel) <= 0,
  );

  return (
    <div className="space-y-5 max-w-4xl mx-auto">

      {/* ── En-tête ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <button type="button" aria-label="Retour"
          onClick={() => router.push(`/${params.tenant}/fournisseurs`)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
          <ArrowLeft size={18} />
        </button>
        <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0">
          <Truck size={18} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-800">{f.nom}</h1>
            <span className="text-xs text-gray-400">{f.reference}</span>
            <button type="button" onClick={() => toggleMutation.mutate()}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors ${
                f.actif
                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
              }`}>
              {f.actif ? <><ToggleRight size={12} /> Actif</> : <><ToggleLeft size={12} /> Inactif</>}
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-0.5">
            {f.matieresPrmieres.length} matière(s) première(s) approvisionnée(s)
          </p>
        </div>
        {peutEcrire && (
          <button type="button" onClick={ouvrirEdit}
            className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 text-gray-600">
            <Pencil size={14} /> Modifier
          </button>
        )}
      </div>

      {/* ── Alerte stock MP ── */}
      {mpEnAlerte.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {mpEnAlerte.length} matière(s) en rupture de stock
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {mpEnAlerte.map((m) => m.nom).join(', ')}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Matières premières liées ── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="px-5 py-3 border-b bg-gray-50 flex items-center gap-2">
              <Package size={15} className="text-gray-500" />
              <h2 className="font-semibold text-gray-700 text-sm">Matières premières approvisionnées</h2>
              <span className="ml-auto text-xs text-gray-400">{f.matieresPrmieres.length} article(s)</span>
            </div>
            {f.matieresPrmieres.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                Aucune matière première liée à ce fournisseur
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Matière</th>
                    <th className="text-right px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">Stock actuel</th>
                    <th className="text-left px-5 py-2.5 text-xs font-medium text-gray-500 uppercase">État</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {f.matieresPrmieres.map((m) => {
                    const enRupture = Number(m.stockActuel) <= 0;
                    return (
                      <tr key={m.id} className={`hover:bg-gray-50 ${enRupture ? 'bg-red-50' : ''}`}>
                        <td className="px-5 py-3">
                          <p className="text-sm font-medium text-gray-800">{m.nom}</p>
                          {m.reference && <p className="text-xs text-gray-400">{m.reference}</p>}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className={`font-semibold text-sm ${enRupture ? 'text-red-600' : 'text-gray-800'}`}>
                            {Number(m.stockActuel)}
                          </span>
                          {m.unite && <span className="text-xs text-gray-400 ml-1">{m.unite}</span>}
                        </td>
                        <td className="px-5 py-3">
                          {enRupture ? (
                            <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                              <TrendingDown size={12} /> Rupture
                            </span>
                          ) : (
                            <span className="text-xs text-green-600">En stock</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">

          {/* Contact */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Contact</h3>
            <div className="space-y-3">
              {f.contactPrincipal && (
                <div className="flex items-start gap-2.5">
                  <User size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Contact principal</p>
                    <p className="text-sm font-medium text-gray-800">{f.contactPrincipal}</p>
                  </div>
                </div>
              )}
              {f.email ? (
                <div className="flex items-start gap-2.5">
                  <Mail size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <a href={`mailto:${f.email}`} className="text-sm text-blue-600 hover:underline">{f.email}</a>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2.5">
                  <Mail size={14} className="text-gray-300 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-300 italic">Email non renseigné</p>
                </div>
              )}
              {f.telephone ? (
                <div className="flex items-start gap-2.5">
                  <Phone size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Téléphone</p>
                    <a href={`tel:${f.telephone}`} className="text-sm font-medium text-gray-800 hover:text-blue-600">{f.telephone}</a>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2.5">
                  <Phone size={14} className="text-gray-300 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-300 italic">Tél. non renseigné</p>
                </div>
              )}
              <div className="flex items-start gap-2.5">
                <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Pays</p>
                  <p className="text-sm font-medium text-gray-800">{f.pays}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Performance</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Évaluation</p>
                <EtoilesNote note={f.noteEvaluation} />
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Délai livraison moyen</p>
                  <p className="text-sm font-medium text-gray-800">
                    {f.delaiLivraisonMoyen ? `${f.delaiLivraisonMoyen} jours` : <span className="text-gray-300 italic">Non renseigné</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CreditCard size={14} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Conditions de paiement</p>
                  <p className="text-sm font-medium text-gray-800">
                    {f.conditionsPaiement || <span className="text-gray-300 italic">Non renseignées</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal d'édition ── */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-800">Modifier le fournisseur</h2>
              <button type="button" aria-label="Fermer" onClick={() => setShowEdit(false)}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: 'Nom *',              key: 'nom',                 type: 'text',   span: 2 },
                { label: 'Contact principal',   key: 'contactPrincipal',    type: 'text',   span: 2 },
                { label: 'Email',               key: 'email',               type: 'email',  span: 1 },
                { label: 'Téléphone',           key: 'telephone',           type: 'tel',    span: 1 },
                { label: 'Pays',                key: 'pays',                type: 'text',   span: 1 },
                { label: 'Délai livraison (j)', key: 'delaiLivraisonMoyen', type: 'number', span: 1 },
                { label: 'Note (0–5)',           key: 'noteEvaluation',      type: 'number', span: 1 },
                { label: 'Conditions paiement', key: 'conditionsPaiement',  type: 'text',   span: 1 },
              ].map(({ label, key, type, span }) => (
                <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                  <label htmlFor={`ef-${key}`} className="text-sm text-gray-600">{label}</label>
                  <input id={`ef-${key}`} type={type}
                    min={type === 'number' ? 0 : undefined}
                    max={key === 'noteEvaluation' ? 5 : undefined}
                    step={key === 'noteEvaluation' ? 0.1 : undefined}
                    value={editForm[key as keyof typeof editForm]}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button type="button"
                onClick={() => modifierMutation.mutate(editForm)}
                disabled={!editForm.nom || modifierMutation.isPending}
                className="flex-1 bg-blue-700 text-white py-2 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50 font-medium">
                {modifierMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" onClick={() => setShowEdit(false)}
                className="px-4 py-2 rounded-lg text-sm border hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
