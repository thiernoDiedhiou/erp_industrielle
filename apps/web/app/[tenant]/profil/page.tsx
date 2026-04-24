'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  User, Mail, Phone, Shield, Calendar, Clock,
  Lock, CheckCircle, Edit3, Building2, Save, X,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  direction: 'Direction',
  commercial: 'Commercial',
  production: 'Production',
  magasinier: 'Magasinier',
  comptable: 'Comptable',
};

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

function fmt(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-SN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-SN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profil {
  id: string;
  nom: string;
  prenom?: string | null;
  email: string;
  role: string;
  telephone?: string | null;
  derniereConnexion?: string | null;
  createdAt: string;
  tenant: {
    nom: string;
    slug: string;
    plan: string;
    couleurPrimaire?: string;
    couleurSecondaire?: string;
    logo?: string;
  };
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function ProfilPage() {
  const qc = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [pwMode, setPwMode] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // ── Formulaire infos
  const [form, setForm] = useState({ nom: '', prenom: '', telephone: '' });

  // ── Formulaire mot de passe
  const [pw, setPw] = useState({ actuel: '', nouveau: '', confirmer: '' });
  const [pwErr, setPwErr] = useState('');

  // ── Données profil
  const { data: profil, isLoading } = useQuery<Profil>({
    queryKey: ['auth-me'],
    queryFn: () => api.get('/auth/me').then((r) => r.data),
  });

  useEffect(() => {
    if (profil) {
      setForm({
        nom: profil.nom ?? '',
        prenom: profil.prenom ?? '',
        telephone: profil.telephone ?? '',
      });
    }
  }, [profil]);

  // ── Couleur tenant depuis CSS vars
  const [primary, setPrimary] = useState('#1565C0');
  useEffect(() => {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
    if (v) setPrimary(v);
  }, []);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Mutation modifier profil
  const modifierMutation = useMutation({
    mutationFn: (data: typeof form) => api.patch('/auth/profil', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['auth-me'] });
      setEditMode(false);
      showToast('Profil mis à jour avec succès', true);
    },
    onError: (e: any) => showToast(e?.response?.data?.message ?? 'Erreur lors de la mise à jour', false),
  });

  // ── Mutation changer mot de passe
  const pwMutation = useMutation({
    mutationFn: (data: { motDePasseActuel: string; nouveauMotDePasse: string }) =>
      api.patch('/auth/mot-de-passe', data).then((r) => r.data),
    onSuccess: () => {
      setPwMode(false);
      setPw({ actuel: '', nouveau: '', confirmer: '' });
      setPwErr('');
      showToast('Mot de passe modifié avec succès', true);
    },
    onError: (e: any) => setPwErr(e?.response?.data?.message ?? 'Erreur lors du changement'),
  });

  const soumettreInfos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) return;
    modifierMutation.mutate(form);
  };

  const soumettreMdp = (e: React.FormEvent) => {
    e.preventDefault();
    setPwErr('');
    if (pw.nouveau !== pw.confirmer) {
      setPwErr('Les mots de passe ne correspondent pas');
      return;
    }
    if (pw.nouveau.length < 8) {
      setPwErr('Le nouveau mot de passe doit contenir au moins 8 caractères');
      return;
    }
    pwMutation.mutate({ motDePasseActuel: pw.actuel, nouveauMotDePasse: pw.nouveau });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Chargement…
      </div>
    );
  }

  if (!profil) return null;

  const initiales = [profil.prenom?.charAt(0), profil.nom.charAt(0)]
    .filter(Boolean)
    .join('')
    .toUpperCase() || profil.nom.charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
            toast.ok ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          <CheckCircle size={16} />
          {toast.msg}
        </div>
      )}

      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez vos informations personnelles et votre sécurité</p>
      </div>

      {/* Carte identité */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {/* Bandeau couleur tenant */}
        <div className="h-24" style={{ background: `linear-gradient(135deg, ${primary}22 0%, ${primary}44 100%)` }} />

        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div
              className="w-20 h-20 rounded-2xl text-white flex items-center justify-center text-2xl font-bold shadow-md border-4 border-white"
              style={{ background: primary }}
            >
              {initiales}
            </div>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors text-gray-700"
              >
                <Edit3 size={14} />
                Modifier
              </button>
            )}
          </div>

          {!editMode ? (
            // ── Vue lecture
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900">
                {profil.prenom ? `${profil.prenom} ${profil.nom}` : profil.nom}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full text-white"
                  style={{ background: primary }}
                >
                  <Shield size={11} />
                  {ROLE_LABELS[profil.role] ?? profil.role}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoLine icon={<Mail size={15} />} label="Email" value={profil.email} />
                <InfoLine icon={<Phone size={15} />} label="Téléphone" value={profil.telephone || '—'} />
                <InfoLine icon={<Clock size={15} />} label="Dernière connexion" value={fmt(profil.derniereConnexion)} />
                <InfoLine icon={<Calendar size={15} />} label="Membre depuis" value={fmtDate(profil.createdAt)} />
              </div>
            </div>
          ) : (
            // ── Mode édition
            <form onSubmit={soumettreInfos} className="space-y-4 mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Prénom</label>
                  <input
                    value={form.prenom}
                    onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
                    placeholder="Ibrahima"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nom *</label>
                  <input
                    required
                    value={form.nom}
                    onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                    placeholder="Samoura"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Téléphone</label>
                  <input
                    value={form.telephone}
                    onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
                    placeholder="+221 77 123 45 67"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={modifierMutation.isPending}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60"
                  style={{ background: primary }}
                >
                  <Save size={14} />
                  {modifierMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={() => { setEditMode(false); setForm({ nom: profil.nom, prenom: profil.prenom ?? '', telephone: profil.telephone ?? '' }); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <X size={14} />
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Deux colonnes basses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sécurité — changement mot de passe */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg" style={{ background: `${primary}15` }}>
              <Lock size={16} style={{ color: primary }} />
            </div>
            <h3 className="font-semibold text-gray-800">Sécurité</h3>
          </div>

          {!pwMode ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Pour protéger votre compte, utilisez un mot de passe fort d'au moins 8 caractères.
              </p>
              <button
                onClick={() => setPwMode(true)}
                className="w-full py-2.5 rounded-xl border text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Changer mon mot de passe
              </button>
            </div>
          ) : (
            <form onSubmit={soumettreMdp} className="space-y-3">
              {pwErr && (
                <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {pwErr}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mot de passe actuel</label>
                <input
                  type="password"
                  required
                  value={pw.actuel}
                  onChange={(e) => setPw((p) => ({ ...p, actuel: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nouveau mot de passe</label>
                <input
                  type="password"
                  required
                  value={pw.nouveau}
                  onChange={(e) => setPw((p) => ({ ...p, nouveau: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirmer le nouveau</label>
                <input
                  type="password"
                  required
                  value={pw.confirmer}
                  onChange={(e) => setPw((p) => ({ ...p, confirmer: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={pwMutation.isPending}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: primary }}
                >
                  {pwMutation.isPending ? 'Modification…' : 'Confirmer'}
                </button>
                <button
                  type="button"
                  onClick={() => { setPwMode(false); setPw({ actuel: '', nouveau: '', confirmer: '' }); setPwErr(''); }}
                  className="px-4 py-2 rounded-xl border text-sm text-gray-600 hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Informations tenant */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 rounded-lg" style={{ background: `${primary}15` }}>
              <Building2 size={16} style={{ color: primary }} />
            </div>
            <h3 className="font-semibold text-gray-800">Mon organisation</h3>
          </div>

          <div className="space-y-4">
            {profil.tenant.logo && (
              <img
                src={profil.tenant.logo}
                alt={profil.tenant.nom}
                className="h-10 object-contain rounded"
              />
            )}

            <div className="space-y-3">
              <InfoLine icon={<Building2 size={15} />} label="Entreprise" value={profil.tenant.nom} />
              <InfoLine icon={<Shield size={15} />} label="Plan" value={PLAN_LABELS[profil.tenant.plan] ?? profil.tenant.plan} />
            </div>

            {/* Palette couleurs */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Charte graphique</p>
              <div className="flex gap-2">
                {profil.tenant.couleurPrimaire && (
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded-full border shadow-sm"
                      style={{ background: profil.tenant.couleurPrimaire }}
                    />
                    <span className="text-xs text-gray-500">{profil.tenant.couleurPrimaire}</span>
                  </div>
                )}
                {profil.tenant.couleurSecondaire && (
                  <div className="flex items-center gap-1.5 ml-3">
                    <div
                      className="w-5 h-5 rounded-full border shadow-sm"
                      style={{ background: profil.tenant.couleurSecondaire }}
                    />
                    <span className="text-xs text-gray-500">{profil.tenant.couleurSecondaire}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sous-composant ───────────────────────────────────────────────────────────

function InfoLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-gray-400 mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-gray-800 font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}
