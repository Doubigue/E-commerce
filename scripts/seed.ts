/**
 * Script exécuté en local ou via CI (npm run seed depuis /admin), via Admin SDK.
 * Peuple Firestore avec des données de démonstration cohérentes avec le schéma
 * documenté dans docs/ARCHITECTURE.md. Toutes les images utilisent des URLs
 * externes (Unsplash), conformément à la contrainte "pas de Firebase Storage".
 */
import { getAuth } from "firebase-admin/auth";
import { adminApp, adminDb, grantAdminRole } from "../lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

async function seedCategories() {
  const categories = [
    { id: "femme", name: "Femme", slug: "femme", bannerImageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d", order: 1 },
    { id: "homme", name: "Homme", slug: "homme", bannerImageUrl: "https://images.unsplash.com/photo-1516257984-b1b4d707412e", order: 2 },
    { id: "accessoires", name: "Accessoires", slug: "accessoires", bannerImageUrl: "https://images.unsplash.com/photo-1524532787116-e70228437bbe", order: 3 },
  ];

  for (const { id, ...data } of categories) {
    await adminDb.collection("categories").doc(id).set(data);
  }
  console.log(`✔ ${categories.length} catégories créées`);
}

async function seedProducts() {
  const products = [
    {
      name: "Manteau en laine mérinos",
      slug: "manteau-laine-merinos",
      description: "Coupe droite, doublure soyeuse, façonné à partir d'une laine mérinos extra-fine.",
      price: 34900,
      compareAtPrice: null,
      currency: "EUR",
      imageUrls: [
        "https://images.unsplash.com/photo-1544022613-e87ca75a784a",
        "https://images.unsplash.com/photo-1551028719-00167b16eac5",
      ],
      categoryId: "femme",
      variants: [
        { size: "S", color: "Camel", stock: 6, sku: "MAN-CAM-S" },
        { size: "M", color: "Camel", stock: 4, sku: "MAN-CAM-M" },
        { size: "M", color: "Noir", stock: 8, sku: "MAN-NOI-M" },
      ],
      tags: ["hiver", "laine"],
      rating: { average: 4.7, count: 32 },
      isActive: true,
    },
    {
      name: "Chemise en lin lavé",
      slug: "chemise-lin-lave",
      description: "Lin européen lavé pierre, coupe ample, boutons en nacre.",
      price: 8900,
      compareAtPrice: 11900,
      currency: "EUR",
      imageUrls: [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c",
        "https://images.unsplash.com/photo-1603252109303-2751441dd157",
      ],
      categoryId: "homme",
      variants: [
        { size: "M", color: "Blanc", stock: 12, sku: "CHE-BLA-M" },
        { size: "L", color: "Blanc", stock: 9, sku: "CHE-BLA-L" },
        { size: "L", color: "Bleu ciel", stock: 5, sku: "CHE-BLE-L" },
      ],
      tags: ["été", "lin"],
      rating: { average: 4.5, count: 18 },
      isActive: true,
    },
    {
      name: "Ceinture cuir pleine fleur",
      slug: "ceinture-cuir-pleine-fleur",
      description: "Cuir de vachette pleine fleur, boucle laiton brossé.",
      price: 6500,
      compareAtPrice: null,
      currency: "EUR",
      imageUrls: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62"],
      categoryId: "accessoires",
      variants: [
        { size: "85cm", color: "Cognac", stock: 15, sku: "CEI-COG-85" },
        { size: "95cm", color: "Cognac", stock: 10, sku: "CEI-COG-95" },
      ],
      tags: ["cuir"],
      rating: { average: 4.9, count: 41 },
      isActive: true,
    },
  ];

  for (const product of products) {
    await adminDb.collection("products").add({
      ...product,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  console.log(`✔ ${products.length} produits créés`);
}

async function seedHeroSlides() {
  const slides = [
    {
      title: "La collection Automne",
      subtitle: "Nouveauté",
      ctaLabel: "Découvrir",
      ctaHref: "/collections/automne",
      imageUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04",
    },
    {
      title: "Essentiels intemporels",
      subtitle: "Sélection",
      ctaLabel: "Voir la sélection",
      ctaHref: "/collections/essentiels",
      imageUrl: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891",
    },
  ];

  for (const slide of slides) {
    await adminDb.collection("heroSlides").add(slide);
  }
  console.log(`✔ ${slides.length} slides hero créés`);
}

async function seedAdminAccount() {
  const email = process.argv[2];
  if (!email) {
    console.log("ℹ Aucun email fourni — étape 'npm run seed -- admin@exemple.fr' ignorée pour le rôle admin.");
    return;
  }

  try {
    const auth = getAuth(adminApp);
    const user = await auth.getUserByEmail(email);

    if (!user) {
      console.log(`✘ Aucun utilisateur Firebase Auth trouvé pour ${email}. Créez-le d'abord dans la console Firebase.`);
      return;
    }

    await grantAdminRole(user.uid);
    console.log(`✔ Rôle admin attribué à ${email}`);
  } catch (error) {
    console.error(`✘ Erreur lors de la récupération de l'utilisateur ${email} :`, error);
  }
}

async function main() {
  await seedCategories();
  await seedProducts();
  await seedHeroSlides();
  await seedAdminAccount();
  console.log("Seed terminé.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Erreur pendant le seed :", err);
  process.exit(1);
});
    
