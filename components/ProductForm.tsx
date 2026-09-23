"use client";

import { useState, type FormEvent } from "react";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebaseClient"; // instance Firestore côté client (Custom Claims admin requis par les règles)
import ImageUrlField from "./ImageUrlField";
import VariantEditor from "./VariantEditor";
import type { Product } from "../lib/types";

interface ProductFormProps {
  initialProduct?: Product; // fourni en mode édition
  onSaved?: (productId: string) => void;
}

const emptyProduct: Omit<Product, "id"> = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  compareAtPrice: null,
  currency: "EUR",
  imageUrls: [],
  categoryId: "",
  variants: [],
  tags: [],
  rating: { average: 0, count: 0 },
  isActive: true,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ProductForm({ initialProduct, onSaved }: ProductFormProps) {
  const [product, setProduct] = useState<Omit<Product, "id">>(initialProduct ?? emptyProduct);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (product.imageUrls.length === 0) {
      setError("Ajoutez au moins une image via son URL.");
      return;
    }
    if (product.variants.length === 0) {
      setError("Ajoutez au moins une variante (taille/couleur/stock).");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        ...product,
        slug: product.slug || slugify(product.name),
        updatedAt: serverTimestamp(),
      };

      if (initialProduct) {
        await updateDoc(doc(db, "products", initialProduct.id), payload);
        onSaved?.(initialProduct.id);
      } else {
        const ref = await addDoc(collection(db, "products"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        onSaved?.(ref.id);
      }
    } catch (err) {
      // Les règles Firestore rejettent l'écriture si le compte n'a pas le rôle admin
      setError("Échec de l'enregistrement. Vérifiez vos droits d'accès admin.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Nom du produit</label>
        <input
          required
          value={product.name}
          onChange={(e) => setProduct({ ...product, name: e.target.value })}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">Description</label>
        <textarea
          rows={4}
          value={product.description}
          onChange={(e) => setProduct({ ...product, description: e.target.value })}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Prix (en centimes)</label>
          <input
            required
            type="number"
            min={0}
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Prix barré (optionnel)</label>
          <input
            type="number"
            min={0}
            value={product.compareAtPrice ?? ""}
            onChange={(e) =>
              setProduct({ ...product, compareAtPrice: e.target.value ? Number(e.target.value) : null })
            }
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>
      </div>

      <ImageUrlField urls={product.imageUrls} onChange={(imageUrls) => setProduct({ ...product, imageUrls })} />

      <VariantEditor variants={product.variants} onChange={(variants) => setProduct({ ...product, variants })} />

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={product.isActive}
          onChange={(e) => setProduct({ ...product, isActive: e.target.checked })}
        />
        Produit visible sur le site
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-md bg-neutral-900 py-2.5 text-sm text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {isSaving ? "Enregistrement…" : initialProduct ? "Mettre à jour le produit" : "Créer le produit"}
      </button>
    </form>
  );
}
