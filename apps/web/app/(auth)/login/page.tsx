'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login } from '@/lib/auth';

const schema = z.object({
  tenantSlug: z.string().min(1, 'Requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setChargement(true);
    setErreur('');
    try {
      const result = await login(data.email, data.password, data.tenantSlug);
      router.push(`/${data.tenantSlug}/dashboard`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setErreur(err?.response?.data?.message || 'Identifiants incorrects');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-800">ERP Industriel</h1>
          <p className="text-gray-500 text-sm mt-1">Plateforme SaaS Multi-tenant</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tenant slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Identifiant entreprise
            </label>
            <input
              {...register('tenantSlug')}
              placeholder="ex: gisac"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.tenantSlug && (
              <p className="text-red-500 text-xs mt-1">{errors.tenantSlug.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="admin@gisac.sn"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              {...register('password')}
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Erreur serveur */}
          {erreur && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {erreur}
            </div>
          )}

          <button
            type="submit"
            disabled={chargement}
            className="w-full bg-blue-700 text-white py-2 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors"
          >
            {chargement ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
