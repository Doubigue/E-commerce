import type { ReactNode } from "react";
import AuthGuard from "@/components/AuthGuard";
import "./globals.css";

export const metadata = {
  title: "Dashboard Admin — Maison",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-neutral-50 text-neutral-900">
        <AuthGuard>
          <div className="mx-auto flex min-h-screen max-w-6xl gap-8 px-6 py-8">
            <aside className="w-48 shrink-0">
              <p className="mb-6 text-lg font-semibold">Maison — Admin</p>
              <nav className="flex flex-col gap-3 text-sm text-neutral-600">
                <a href="/" className="hover:text-neutral-900">Tableau de bord</a>
                <a href="/produits" className="hover:text-neutral-900">Produits</a>
                <a href="/commandes" className="hover:text-neutral-900">Commandes</a>
              </nav>
            </aside>
            <main className="flex-1">{children}</main>
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}
