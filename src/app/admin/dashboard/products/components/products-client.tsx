"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/model/base.model";

export default function ProductsClient({ product }: { product: Product }) {
  const [isDisabled, setIsDisabled] = useState(false);

  const router = useRouter();

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
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      const revalidateResponse = await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paths: ["/admin/dashboard/products", "/"],
        }),
      });
      await revalidateResponse.json();
      router.refresh();
      setIsDisabled(false);
    }
  };

  return (
    <div className="flex gap-2">
      {/* Edit Button */}
      <Link
        href={`/admin/dashboard/products/edit/${product.id}`}
        className="flex items-center gap-1 px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition"
      >
        <Pencil className="h-4 w-4" />
        Edit
      </Link>

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
