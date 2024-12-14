"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ProductForm from "./ProductForm"; // Import ProductForm component
import { FieldValues } from "react-hook-form";

interface AddProductFormProps {
  onRefresh: () => void;
  cloudinaryImages: { url: string; id: string }[]; // Images from Cloudinary
}

export default function AddProductForm({
  onRefresh,
  cloudinaryImages,
}: AddProductFormProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Form submission handler
  const handleSubmit = async (data: FieldValues) => {
    try {
      // Create FormData for the API
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("price", data.price);
      formData.append("description", data.description);
      formData.append("material", data.material || "");
      formData.append("category", data.category);
      formData.append("subcategory", data.subcategory);
      formData.append("gender", data.gender);

      const isImageString = typeof data.image === "string";
      formData.append("imageType", isImageString ? "url" : "file");
      formData.append("image", isImageString ? data.image : data.image[0]);

      // Send FormData to the API
      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to add product");

      const result = await response.json();
      console.log("Product added:", result);

      onRefresh(); // Refresh product list
      setIsOpen(false); // Close the dialog
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="primary" onClick={() => setIsOpen(true)}>
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white px-10 rounded-lg shadow-lg">
        <h1 className="text-center text-2xl font-semibold mb-6">Add Product</h1>
        <ProductForm
          onSubmit={handleSubmit} // Pass form submission handler
          cloudinaryImages={cloudinaryImages} // Pass Cloudinary images
        />
      </DialogContent>
    </Dialog>
  );
}
