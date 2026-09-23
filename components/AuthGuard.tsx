"use client";

import { type ReactNode } from "react";

/**
 * AuthGuard simplifié :
 * Aucun contrôle d'accès ni connexion automatique requis.
 * L'application est directement accessible à tout le monde.
 */
export default function AuthGuard({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
