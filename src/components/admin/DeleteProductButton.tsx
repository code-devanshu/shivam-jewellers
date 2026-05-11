"use client";

import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/app/admin/(protected)/products/actions";

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  return (
    <form action={deleteProduct}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Delete"
        onClick={(e) => {
          if (!confirm(`Delete "${name}"?`)) e.preventDefault();
        }}
      >
        <Trash2 size={15} />
      </button>
    </form>
  );
}
