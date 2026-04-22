'use client';

import { useRef, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { saApi } from '@/lib/super-admin-api';

interface LogoUploadProps {
  value: string;
  onChange: (url: string) => void;
  nomFallback?: string;
}

export function LogoUpload({ value, onChange, nomFallback = '?' }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    setError('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await saApi.post<{ url: string }>('/super-admin/upload/logo', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(data.url);
    } catch {
      setError('Erreur upload. Vérifiez le format (PNG/JPG/WEBP/SVG, max 2 Mo).');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-gray-600">Logo</label>

      {value ? (
        <div className="flex items-center gap-3">
          <img
            src={value}
            alt="logo"
            className="h-14 w-14 rounded-xl object-contain border bg-gray-50 p-1"
          />
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-blue-600 hover:underline"
            >
              Changer
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-xs text-red-500 hover:underline flex items-center gap-1"
            >
              <X size={10} /> Supprimer
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
        >
          {uploading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          ) : (
            <>
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <ImageIcon size={20} className="text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 font-medium">Glisser-déposer ou cliquer</p>
                <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP, SVG — max 2 Mo</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium mt-1">
                <Upload size={12} /> Choisir un fichier
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
