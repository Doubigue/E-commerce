export interface ProductVariant {
  size: string;
  color: string;
  stock: number;
  sku: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  currency: string;
  imageUrls: string[];
  categoryId: string;
  variants: ProductVariant[];
  tags: string[];
  rating: { average: number; count: number };
  isActive: boolean;
}
