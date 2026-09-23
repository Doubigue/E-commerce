"use client";

import { Trash2, Plus } from "lucide-react";
import type { ProductVariant } from "../lib/types";

interface VariantEditorProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

function generateSku() {
  return `SKU-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export default function VariantEditor({ variants, onChange }: VariantEditorProps) {
  const updateVariant = (index: number, patch: Partial<ProductVariant>) => {
    onChange(variants.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const addVariant = () => {
    onChange([...variants, { size: "", color: "", stock: 0, sku: generateSku() }]);
  };

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  const totalStock = variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-neutral-700">Variantes (taille / couleur / stock)</label>
        <span className="text-xs text-neutral-400">Stock total : {totalStock}</span>
      </div>

      <div className="overflow-hidden rounded-md border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-3 py-2">Taille</th>
              <th className="px-3 py-2">Couleur</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {variants.map((variant, index) => (
              <tr key={variant.sku} className="border-t border-neutral-100">
                <td className="px-3 py-2">
                  <input
                    value={variant.size}
                    onChange={(e) => updateVariant(index, { size: e.target.value })}
                    placeholder="M"
                    className="w-full rounded border border-neutral-200 px-2 py-1 focus:border-neutral-500 focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={variant.color}
                    onChange={(e) => updateVariant(index, { color: e.target.value })}
                    placeholder="Noir"
                    className="w-full rounded border border-neutral-200 px-2 py-1 focus:border-neutral-500 focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, { stock: Number(e.target.value) })}
                    className="w-20 rounded border border-neutral-200 px-2 py-1 focus:border-neutral-500 focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2 font-mono text-xs text-neutral-500">{variant.sku}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    aria-label="Supprimer la variante"
                    className="text-neutral-400 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {variants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-xs text-neutral-400">
                  Aucune variante — ajoutez au moins une combinaison taille/couleur.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addVariant}
        className="mt-3 flex items-center gap-1.5 text-sm text-neutral-700 hover:text-neutral-900"
      >
        <Plus size={15} /> Ajouter une variante
      </button>
    </div>
  );
}
