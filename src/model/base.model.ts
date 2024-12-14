export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  material?: string;
  rating?: number;
  category?: string;
  subcategory?: string;
  gender: "Men" | "Women" | "Unisex";
}
