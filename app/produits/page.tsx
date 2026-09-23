"use client";

import { useState } from "react";
import ProductForm from "@/components/ProductForm";

export default function ProductsPage() {
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Ajouter un produit</h1>
      {lastSavedId && (
        <p className="rounded-md bg-green-50 px-4 py-2 text-sm text-green-700">
          Produit enregistré (id : {lastSavedId}).
        </p>
      )}
      <div className="rounded-lg border border-neutral-200 bg-white">
        <ProductForm onSaved={setLastSavedId} />
      </div>
    </div>
  );
}
