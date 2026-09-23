"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../lib/firebaseClient";

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
}

export function useAuthUser(): AuthState {
  const [state, setState] = useState<AuthState>({ user: null, isAdmin: false, isLoading: true });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ user: null, isAdmin: false, isLoading: false });
        return;
      }
      // Le rôle est lu depuis le Custom Claim signé par Firebase Auth (pas un
      // champ Firestore), donc impossible à falsifier depuis le client.
      const tokenResult = await user.getIdTokenResult();
      setState({ user, isAdmin: tokenResult.claims.role === "admin", isLoading: false });
    });
    return () => unsubscribe();
  }, []);

  return state;
}
