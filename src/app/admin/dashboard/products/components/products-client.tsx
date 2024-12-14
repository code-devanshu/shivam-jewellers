"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import ProductForm from "./ProductForm"; // Import the generic ProductForm
import { FieldValues } from "react-hook-form";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  material?: string;
  category?: string;
  subcategory?: string;
  gender?: "Men" | "Women" | "Unisex";
};

interface ProductsClientProps {
  product: Product;
  onRefresh: () => void;
  cloudinaryImages: { url: string; id: string }[]; // Images from Cloudinary
}

export default function ProductsClient({
  product,
  onRefresh,
  cloudinaryImages,
}: ProductsClientProps) {
  const [isEdit, setIsEdit] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  // Update product
  const handleEditSubmit = async (data: FieldValues) => {
    setIsDisabled(true);
    try {
      const formData = new FormData();
      formData.append("id", product.id);
      formData.append("name", data.name);
      formData.append("price", data.price);
      formData.append("description", data.description);
      formData.append("material", data.material || "");
      formData.append("category", data.category || "");
      formData.append("subcategory", data.subcategory || "");
      formData.append("gender", data.gender || "");

      const isImageString = typeof data.image === "string";
      formData.append("imageType", isImageString ? "url" : "file");
      formData.append("image", isImageString ? data.image : data.image[0]);

      const response = await fetch(`/api/products`, {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update product");
      }

      setIsEdit(false);
      onRefresh();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error updating product:", error);
      alert(error.message || "Failed to update product");
    } finally {
      setIsDisabled(false);
    }
  };

  // Delete product
  const handleDelete = async () => {
    setIsDisabled(true);
    try {
      const response = await fetch(`/api/products`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      onRefresh();
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setIsDisabled(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Edit Button */}
      <Dialog open={isEdit} onOpenChange={setIsEdit}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white px-10 py-6 rounded-lg shadow-lg">
          <h1 className="text-center text-2xl font-semibold mb-6">
            Edit Product
          </h1>
          <ProductForm
            onSubmit={handleEditSubmit}
            cloudinaryImages={cloudinaryImages}
            defaultValues={product} // Pre-fill the form with product data
          />
        </DialogContent>
      </Dialog>

      {/* Delete Button */}
      <Button
        onClick={handleDelete}
        disabled={isDisabled}
        className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
      >
        <Trash className="h-4 w-4" />
        {isDisabled ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
}
