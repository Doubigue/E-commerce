import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// ⚠️ Ce fichier ne doit JAMAIS être importé depuis un composant "use client"
// ni depuis un projet destiné au déploiement public. Il utilise la clé de
// service (accès total, contourne firestore.rules) — elle ne doit exister
// que dans .env.local, jamais commit, jamais buildée sur Vercel/Netlify.

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Les retours à la ligne de la clé privée sont échappés dans .env.local
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

// Export de l'application Firebase Admin
export const adminApp = getAdminApp();

// Export des services Firestore et Auth réutilisables
export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);

/**
 * Attribue le rôle admin à un utilisateur via Custom Claims.
 * À exécuter une seule fois par compte admin (script local, jamais côté client).
 */
export async function grantAdminRole(uid: string) {
  await adminAuth.setCustomUserClaims(uid, { role: "admin" });
  await adminDb.collection("users").doc(uid).set(
    { role: "admin", isAdmin: true },
    { merge: true }
  );
}
