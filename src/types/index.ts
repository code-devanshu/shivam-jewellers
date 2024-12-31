import { Product } from "@/model/base.model";

export interface CartItem {
  product: Product;
  quantity: number;
}
