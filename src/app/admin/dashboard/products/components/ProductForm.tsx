"use client";

import { useState } from "react";
import { useForm, FieldValues } from "react-hook-form";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
import Image from "next/image";

interface ProductFormProps {
  onSubmit: (data: FieldValues) => Promise<void>;
  defaultValues?: FieldValues;
  cloudinaryImages: { url: string; id: string }[]; // Images from Cloudinary
}

export default function ProductForm({
  onSubmit,
  defaultValues = {},
  cloudinaryImages,
}: ProductFormProps) {
  const { register, handleSubmit, setValue, watch } = useForm<FieldValues>({
    defaultValues,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [useCloudinary, setUseCloudinary] = useState(true); // Toggle between Cloudinary or upload

  // Watch fields for controlled inputs
  const gender = watch("gender", defaultValues.gender || "");
  const category = watch("category", defaultValues.category || "");
  const subcategory = watch("subcategory", defaultValues.subcategory || "");

  const handleFormSubmit = async (data: FieldValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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

      {/* Toggle Between Upload or Select from Cloudinary */}
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-gray-700 ms-0.5">
          Upload from Existing
        </label>
        <input
          type="checkbox"
          checked={useCloudinary}
          onChange={() => setUseCloudinary((prev) => !prev)}
          className="h-4 w-4 text-yellow-600 focus:ring-yellow-400 border-gray-300 rounded"
        />
      </div>

      {/* Conditionally Render Image Input or Cloudinary Selector */}
      {useCloudinary ? (
        <div>
          <Input
            type="text"
            readOnly
            {...register("image")}
            placeholder="Select image link"
            className="border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 hover:bg-yellow-50 transition duration-200"
          />
          <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-2">Select from Cloud</Button>
            </DialogTrigger>
            <DialogContent className="bg-white px-6 py-4 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Select an Image</h3>
              <div className="grid grid-cols-3 gap-4">
                {cloudinaryImages.map((img) => (
                  <div
                    key={img.id}
                    className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition"
                    onClick={() => {
                      setValue("image", img.url);
                      setIsImageDialogOpen(false);
                    }}
                  >
                    <Image
                      src={img.url}
                      alt={img.id}
                      width={100}
                      height={100}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <Input
          type="file"
          accept="image/*"
          {...register("image", { required: "Product image is required" })}
          className="border border-gray-300 p-3 pt-1.5 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 hover:bg-yellow-50 transition duration-200"
        />
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
