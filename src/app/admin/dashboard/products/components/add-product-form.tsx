"use client";

import { useState } from "react";
import { useForm, FieldValues } from "react-hook-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea from ShadCN
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddProductFormProps {
  onRefresh: () => void;
}

export default function AddProductForm({ onRefresh }: AddProductFormProps) {
  const [uploading, setUploading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);

  // Use React Hook Form
  const { register, handleSubmit, reset, watch, setValue } =
    useForm<FieldValues>();

  // Watch for the file input value
  const file = watch("image");

  // Form submission handler
  const onSubmit = async (data: FieldValues) => {
    try {
      setUploading(true);

      // Validate that an image file is provided
      const imageFile = file?.[0];
      if (!imageFile) throw new Error("Image file is required");

      // Create FormData for the image and product data
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("price", data.price);
      formData.append("description", data.description);
      formData.append("image", imageFile);
      formData.append("material", data.material || "");
      formData.append("category", data.category);
      formData.append("subcategory", data.subcategory);
      formData.append("gender", data.gender);

      // Send FormData to the API
      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to add product");

      reset(); // Reset the form
      onRefresh();
      setIsOpen(false);
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setUploading(false);
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Product Name */}
          <Input
            {...register("name", { required: "Product name is required" })}
            placeholder="Product Name"
            className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 hover:bg-yellow-50 transition duration-200"
          />

          {/* Price */}
          <Input
            {...register("price", {
              required: "Price is required",
              validate: (value) =>
                !isNaN(parseFloat(value)) || "Price must be a number",
            })}
            type="number"
            placeholder="Price"
            className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 hover:bg-yellow-50 transition duration-200"
          />

          {/* Description Textarea */}
          <Textarea
            {...register("description", {
              required: "Description is required",
            })}
            placeholder="Description"
            rows={5} // Set height to 5 rows
            className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 hover:bg-yellow-50 transition duration-200"
          />

          {/* Material */}
          <Input
            {...register("material")}
            placeholder="Material"
            className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 hover:bg-yellow-50 transition duration-200"
          />

          {/* Category Dropdown */}
          <Select onValueChange={(value) => setValue("category", value)}>
            <SelectTrigger className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 hover:bg-yellow-50 transition duration-200">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border border-gray-200 bg-white shadow-lg">
              <SelectItem
                value="Jewelry"
                className="py-2 px-4 hover:bg-yellow-100 text-gray-800"
              >
                Jewelry
              </SelectItem>
              <SelectItem
                value="Accessories"
                className="py-2 px-4 hover:bg-yellow-100 text-gray-800"
              >
                Accessories
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Subcategory Dropdown */}
          <Select onValueChange={(value) => setValue("subcategory", value)}>
            <SelectTrigger className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 hover:bg-yellow-50 transition duration-200">
              <SelectValue placeholder="Select a subcategory" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border border-gray-200 bg-white shadow-lg">
              <SelectItem
                value="Earrings"
                className="py-2 px-4 hover:bg-yellow-100 text-gray-800"
              >
                Earrings
              </SelectItem>
              <SelectItem
                value="Necklaces"
                className="py-2 px-4 hover:bg-yellow-100 text-gray-800"
              >
                Necklaces
              </SelectItem>
              <SelectItem
                value="Bracelets"
                className="py-2 px-4 hover:bg-yellow-100 text-gray-800"
              >
                Bracelets
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Gender Dropdown */}
          <Select onValueChange={(value) => setValue("gender", value)}>
            <SelectTrigger className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 hover:bg-yellow-50 transition duration-200">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent className="rounded-lg border border-gray-200 bg-white shadow-lg">
              <SelectItem
                value="Men"
                className="py-2 px-4 hover:bg-yellow-100 text-gray-800"
              >
                Men
              </SelectItem>
              <SelectItem
                value="Women"
                className="py-2 px-4 hover:bg-yellow-100 text-gray-800"
              >
                Women
              </SelectItem>
              <SelectItem
                value="Unisex"
                className="py-2 px-4 hover:bg-yellow-100 text-gray-800"
              >
                Unisex
              </SelectItem>
            </SelectContent>
          </Select>

          {/* File Input */}
          <Input
            type="file"
            accept="image/*"
            {...register("image", { required: "Product image is required" })}
            className="border border-gray-300 p-3 pt-1.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 hover:bg-yellow-50 transition duration-200"
          />

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            disabled={uploading}
          >
            {uploading ? "Adding Product..." : "Add Product"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
