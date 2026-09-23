"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebaseClient";

type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

interface Order {
  id: string;
  userId: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: { seconds: number } | null;
}

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-neutral-200 text-neutral-600",
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "En attente",
  paid: "Payée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Écoute temps réel : toute nouvelle commande ou changement de statut
    // se reflète instantanément dans le dashboard, sans rechargement.
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setOrders(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order)));
        setIsLoading(false);
      },
      (err) => {
        console.error("Erreur de lecture des commandes :", err);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const changeStatus = async (orderId: string, status: OrderStatus) => {
    await updateDoc(doc(db, "orders", orderId), { status });
  };

  if (isLoading) {
    return <p className="p-6 text-sm text-neutral-400">Chargement des commandes…</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200">
      <table className="w-full text-sm">
        <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
          <tr>
            <th className="px-4 py-3">Commande</th>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Montant</th>
            <th className="px-4 py-3">Statut</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-neutral-100">
              <td className="px-4 py-3 font-mono text-xs text-neutral-500">{order.id.slice(0, 8)}</td>
              <td className="px-4 py-3 text-neutral-700">{order.userId.slice(0, 8)}</td>
              <td className="px-4 py-3 text-neutral-900">
                {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
                  order.totalAmount / 100
                )}
              </td>
              <td className="px-4 py-3">
                <select
                  value={order.status}
                  onChange={(e) => changeStatus(order.id, e.target.value as OrderStatus)}
                  className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${statusStyles[order.status]}`}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-neutral-400">
                Aucune commande pour le moment.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
