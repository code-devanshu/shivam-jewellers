"use client";

import { useState } from "react";
import { useForm, FieldValues } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CldUploadButton } from "next-cloudinary"; // Import Cloudinary button
import { DialogHeader } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ProductFormProps {
  defaultValues?: FieldValues;
  cloudinaryImages?: string[];
  productId?: string;
}

export default function ProductForm({
  defaultValues = {},
  cloudinaryImages = [],
  productId = "",
}: ProductFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm<FieldValues>({
    defaultValues,
  });
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // console.log("cloudinaryImages", cloudinaryImages);

  // Watch fields for controlled inputs
  const gender = watch("gender", defaultValues.gender || "");
  const category = watch("category", defaultValues.category || "");
  const subcategory = watch("subcategory", defaultValues.subcategory || "");
  const [imageUrls, setImageUrls] = useState<string[]>(
    defaultValues.image || []
  ); // To store image URLs
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSelectImage = (imageUrl: string) => {
    setImageUrls((prev) => {
      // If the image is already selected, remove it from the array
      if (prev.includes(imageUrl)) {
        return prev.filter((url) => url !== imageUrl);
      }
      // Otherwise, add the image to the array
      return [...prev, imageUrl];
    });
  };

  const handleFormSubmit = async (data: FieldValues) => {
    setIsSubmitting(true);
    try {
      if (productId) {
        await handleEditProduct(data);
      } else {
        await handleAddProduct(data);
      }

      const revalidateResponse = await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paths: ["/admin/dashboard/products", "/"], // Revalidate the parent route (e.g., the homepage or a parent page)
        }),
      });
      await revalidateResponse.json();

      router.push("/admin/dashboard/products");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProduct = async (data: FieldValues) => {
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
      formData.append("images", JSON.stringify(imageUrls)); // Add image URLs array

      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to add product");

      await response.json();
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  };

  const handleEditProduct = async (data: FieldValues) => {
    try {
      const formData = new FormData();
      formData.append("id", productId);
      formData.append("name", data.name);
      formData.append("price", data.price);
      formData.append("description", data.description);
      formData.append("material", data.material || "");
      formData.append("category", data.category || "");
      formData.append("subcategory", data.subcategory || "");
      formData.append("gender", data.gender || "");
      formData.append("images", JSON.stringify(imageUrls)); // Add image URLs array

      const response = await fetch(`/api/products`, {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update product");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error updating product:", error);
      alert(error.message || "Failed to update product");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUploadSuccess = (result: any) => {
    // Capture the uploaded image URL from Cloudinary
    const imageUrl = result?.info?.secure_url;

    if (imageUrl) {
      // Update the images array with the new image URL
      setImageUrls((prev) => {
        const updatedImageUrls = [...prev, imageUrl];

        setValue("images", updatedImageUrls); // Update react-hook-form field
        return updatedImageUrls;
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4 max-w-5xl mx-auto"
    >
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

      {/* Description */}
      <Textarea
        {...register("description", {
          required: "Description is required",
        })}
        placeholder="Description"
        rows={5}
        className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 hover:bg-yellow-50 transition duration-200"
      />

      {/* Material */}
      <Input
        {...register("material")}
        placeholder="Material"
        className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 hover:bg-yellow-50 transition duration-200"
      />

      {/* Category */}
      <Select
        value={category}
        onValueChange={(value) => setValue("category", value)}
      >
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

      {/* Subcategory */}
      <Select
        value={subcategory}
        onValueChange={(value) => setValue("subcategory", value)}
      >
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
          <SelectItem
            value="Chain"
            className="py-2 px-4 hover:bg-yellow-100 text-gray-800"
          >
            Chain
          </SelectItem>
          <SelectItem
            value="Bangls"
            className="py-2 px-4 hover:bg-yellow-100 text-gray-800"
          >
            Bangels
          </SelectItem>
          <SelectItem
            value="Mangal Sutra"
            className="py-2 px-4 hover:bg-yellow-100 text-gray-800"
          >
            Mangal Sutra
          </SelectItem>
          <SelectItem
            value="Payal (Anklet)"
            className="py-2 px-4 hover:bg-yellow-100 text-gray-800"
          >
            Payal (Anklet)
          </SelectItem>
          <SelectItem
            value="Pendant"
            className="py-2 px-4 hover:bg-yellow-100 text-gray-800"
          >
            Pendant
          </SelectItem>
          <SelectItem
            value="Berwa"
            className="py-2 px-4 hover:bg-yellow-100 text-gray-800"
          >
            Berwa
          </SelectItem>
          <SelectItem
            value="Tika"
            className="py-2 px-4 hover:bg-yellow-100 text-gray-800"
          >
            Tika
          </SelectItem>
          <SelectItem
            value="Nathiya"
            className="py-2 px-4 hover:bg-yellow-100 text-gray-800"
          >
            Nathiya
          </SelectItem>
          <SelectItem
            value="Jhumka"
            className="py-2 px-4 hover:bg-yellow-100 text-gray-800"
          >
            Jhumka
          </SelectItem>
          <SelectItem
            value="Bichiya(Toe Ring)"
            className="py-2 px-4 hover:bg-yellow-100 text-gray-800"
          >
            Bichiya(Toe Ring)
          </SelectItem>
          <SelectItem
            value="Ring"
            className="py-2 px-4 hover:bg-yellow-100 text-gray-800"
          >
            Ring
          </SelectItem>
          <SelectItem
            value="Kanthi"
            className="py-2 px-4 hover:bg-yellow-100 text-gray-800"
          >
            Kanthi
          </SelectItem>
          <SelectItem
            value="Silveware"
            className="py-2 px-4 hover:bg-yellow-100 text-gray-800"
          >
            Silverware
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Gender */}
      <Select
        value={gender}
        onValueChange={(value) => setValue("gender", value)}
      >
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

      <div className="flex items-center">
        <p className="me-3 tex-sm">Product Images: </p>
        {/* Cloudinary Image Upload Button */}
        <CldUploadButton
          uploadPreset="Shivam-jewellers-preset" // Use your Cloudinary preset
          onSuccess={handleUploadSuccess} // Handle the success and update the form
          className="w-32 p-1.5 bg-yellow-600 text-white rounded-lg"
        >
          Upload Images
        </CldUploadButton>
        <p className="mx-4">OR</p>
        {/* Button to Open Dialog */}
        <Button
          type="button"
          variant="primary"
          onClick={() => setIsDialogOpen(true)} // Open the dialog
          className="w-52 bg-blue-600 text-white"
        >
          Select Existing Images
        </Button>
      </div>
      {imageUrls.length > 0 && (
        <div className="flex items-center space-x-2">
          <p className="me-3">Selected Images:</p>
          {imageUrls.map((imageUrl, index) => (
            <Image
              src={imageUrl}
              key={index}
              width="200"
              height="200"
              alt={`Image ${index + 1}`}
              className=" h-24 w-24 rounded-full object-cover"
            />
          ))}
        </div>
      )}
      {/* Dialog for Selecting Images */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white px-10 py-6 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle>
              <p className="text-center text-2xl font-semibold mb-6">
                Select Images
              </p>
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4">
            {cloudinaryImages.map((imageUrl, index) => (
              <div
                key={index}
                className="relative cursor-pointer"
                onClick={() => handleSelectImage(imageUrl)} // Select image
              >
                <Image
                  src={imageUrl}
                  width="200"
                  height="200"
                  alt={`Image ${index + 1}`}
                  className="w-full h-24 object-cover"
                />
                <input
                  type="checkbox"
                  checked={imageUrls.includes(imageUrl)}
                  onChange={() => handleSelectImage(imageUrl)}
                  className="absolute top-2 right-2"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        className="w-32 block bg-green-600 hover:bg-green-700 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
