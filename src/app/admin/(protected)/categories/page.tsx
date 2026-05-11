import { storeGetAllCategories } from "@/lib/admin-store";
import CategoriesClient from "./CategoriesClient";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await storeGetAllCategories();
  return <CategoriesClient categories={categories} />;
}
