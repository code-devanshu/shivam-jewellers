"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
};

interface ProductsClientProps {
  product: Product;
  onRefresh: () => void;
}

export default function ProductsClient({
  product,
  onRefresh,
}: ProductsClientProps) {
  const [isEdit, setIsEdit] = useState(false);
  const [isdisabled, setIsDisabled] = useState(false);
  const { register, handleSubmit } = useForm<Product>({
    defaultValues: product,
  });

  // Update product
  const onSubmit = async (data: Product) => {
    setIsDisabled(true); // Disable form inputs while updating
    try {
      const response = await fetch(`/api/products`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product.id,
          name: data.name,
          price: data.price, // Still sent as string; API will parse it
          description: data.description,
          image: data.image, // Ensure image URL is sent
        }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to update product");
      else {
        setIsDisabled(false);
        setIsEdit(false);
        onRefresh();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error updating product:", error);
      alert(error.message || "Failed to update product");
    }
  };

  // Delete product
  const handleDelete = async () => {
    setIsDisabled(true); // Disable form inputs while updating
    try {
      await fetch(`/api/products`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id }),
      });
      setIsEdit(false);
      setIsDisabled(false);
      onRefresh();
      // window.location.reload(); // Reload to reflect changes
    } catch (error) {
      console.error("Failed to delete product:", error);
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
        <DialogContent className="bg-white px-10 rounded-lg shadow-lg">
          <h1 className="text-center text-2xl font-semibold">Edit Product</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input {...register("name")} placeholder="Product Name" />
            <Input {...register("price")} type="number" placeholder="Price" />
            <Textarea {...register("description")} placeholder="Description" />
            <Button type="submit" disabled={isdisabled}>
              {isdisabled ? "Updating..." : "Update Product"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Button
        onClick={handleDelete}
        disabled={isdisabled}
        className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
      >
        <Trash className="h-4 w-4" />
        {isdisabled ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
}
