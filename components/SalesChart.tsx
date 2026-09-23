"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebaseClient";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

interface DailySales {
  date: string; // "jj/mm"
  total: number; // en euros
}

export default function SalesChart() {
  const [rawOrders, setRawOrders] = useState<{ createdAt: Timestamp; totalAmount: number }[]>([]);

  useEffect(() => {
    const thirtyDaysAgo = Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const q = query(
      collection(db, "orders"),
      where("createdAt", ">=", thirtyDaysAgo),
      where("status", "in", ["paid", "shipped", "delivered"])
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRawOrders(snapshot.docs.map((d) => d.data() as { createdAt: Timestamp; totalAmount: number }));
    });
    return () => unsubscribe();
  }, []);

  const chartData: DailySales[] = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const order of rawOrders) {
      const day = order.createdAt.toDate().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
      byDay.set(day, (byDay.get(day) ?? 0) + order.totalAmount / 100);
    }
    return Array.from(byDay.entries())
      .map(([date, total]) => ({ date, total: Math.round(total) }))
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [rawOrders]);

  const totalRevenue = chartData.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="rounded-lg border border-neutral-200 p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-neutral-700">Chiffre d'affaires — 30 derniers jours</h3>
        <span className="font-mono text-lg text-neutral-900">
          {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(totalRevenue)}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1F3A2E" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#1F3A2E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#A3A3A3" />
          <YAxis tick={{ fontSize: 12 }} stroke="#A3A3A3" width={48} />
          <Tooltip
            formatter={(value: number) => [
              new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value),
              "Ventes",
            ]}
          />
          <Area type="monotone" dataKey="total" stroke="#1F3A2E" strokeWidth={2} fill="url(#salesGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
