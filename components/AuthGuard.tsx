"use client";

import { type ReactNode, useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebaseClient";
import { useAuthUser } from "../lib/useAuthUser";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuthUser(); // isAdmin retiré ici
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
      setAuthError("Connexion automatique impossible — vérifiez les identifiants.");
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

  // Le blocage "if (!isAdmin)" a été retiré. Tout utilisateur connecté a désormais accès.

  return <>{children}</>;
}
