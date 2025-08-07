export interface Product {
  id: string;
  name: string;
  price: number;
  weight?: number | null;
  quantity?: number | null; // ✅ NEW
  description?: string | null;
  material?: string | null;
  category?: string | null;
  subCategory?: string | null;
  gender?: string | null;
  images: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
