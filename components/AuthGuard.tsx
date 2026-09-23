"use client";

import { type ReactNode, useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebaseClient";
import { useAuthUser } from "../lib/useAuthUser";

// ⚠️ Compromis assumé : pas d'écran de connexion visible, le compte admin se
// connecte tout seul au chargement à partir d'identifiants stockés en Secrets.
// Ça garde les règles Firestore (isAdmin()) actives et fonctionnelles, mais
// puisque ce projet est un export statique (aucun serveur), ces identifiants
// finissent embarqués dans le JS envoyé au navigateur — visibles par quiconque
// inspecte le code source, même si l'URL Netlify n'est pas partagée. La vraie
// protection ici est la discrétion de l'URL, pas un mur de connexion. Si tu
// partages ce lien un jour, régénère le mot de passe du compte admin.
export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isAdmin, isLoading } = useAuthUser();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || user) return;
    const email = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const password = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    if (!email || !password) {
      setAuthError("NEXT_PUBLIC_ADMIN_EMAIL / NEXT_PUBLIC_ADMIN_PASSWORD manquants dans les Secrets.");
      return;
    }
    signInWithEmailAndPassword(auth, email, password).catch(() => {
      setAuthError("Connexion automatique impossible — vérifiez les identifiants et le rôle admin.");
    });
  }, [isLoading, user]);

  if (authError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm text-red-600">{authError}</p>
      </div>
    );
  }

  if (isLoading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-neutral-400">Chargement…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm text-neutral-600">
          Ce compte ({user.email}) n'a pas les droits administrateur nécessaires (npm run seed -- {user.email}).
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
