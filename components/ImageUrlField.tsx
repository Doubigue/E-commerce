"use client";

import { useState } from "react";
import { ImageOff, X, GripVertical } from "lucide-react";

interface ImageUrlFieldProps {
  urls: string[];
  onChange: (urls: string[]) => void;
}

function UrlThumbnail({ url, onRemove }: { url: string; onRemove: () => void }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="group relative h-24 w-24 shrink-0 overflow-hidden border border-neutral-200 bg-neutral-50">
      <div className="absolute left-1 top-1 z-10 cursor-grab text-neutral-400">
        <GripVertical size={14} />
      </div>
      {hasError ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-neutral-400">
          <ImageOff size={18} />
          <span className="text-[10px]">Lien invalide</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- preview d'une URL arbitraire, hors domaines Next Image
        <img src={url} alt="" onError={() => setHasError(true)} className="h-full w-full object-cover" />
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Retirer cette image"
      >
        <X size={12} />
      </button>
    </div>
  );
}

export default function ImageUrlField({ urls, onChange }: ImageUrlFieldProps) {
  const [draft, setDraft] = useState("");

  const addUrl = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed); // validation basique de format
    } catch {
      return;
    }
    onChange([...urls, trimmed]);
    setDraft("");
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-neutral-700">
        Images du produit (URLs externes — Cloudinary, Unsplash, CDN…)
      </label>

      <div className="flex gap-2">
        <input
          type="url"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
          placeholder="https://res.cloudinary.com/.../produit.jpg"
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={addUrl}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700"
        >
          Ajouter
        </button>
      </div>

      {urls.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {urls.map((url, index) => (
            <UrlThumbnail key={`${url}-${index}`} url={url} onRemove={() => onChange(urls.filter((_, i) => i !== index))} />
          ))}
        </div>
      )}

      {urls.length === 0 && (
        <p className="mt-2 text-xs text-neutral-400">
          Aucune image ajoutée. La première URL sera l'image principale affichée sur les cartes produit.
        </p>
      )}
    </div>
  );
}
