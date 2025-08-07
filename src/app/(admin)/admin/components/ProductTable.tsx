"use client";

import Link from "next/link";
import Image from "next/image";
import DeleteButtonWithConfirm from "./DeleteButtonWithConfirm";
import { Product } from "@/types/product";
import { deleteProduct } from "../actions/product-actions";

interface Props {
  products: Product[];
}

export default function ProductTable({ products }: Props) {
  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-xl shadow border border-neutral-200 bg-white">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="bg-neutral-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600">
                Image
              </th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600">
                Name
              </th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600">
                Price
              </th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600">
                Weight (g)
              </th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600">
                Quantity
              </th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600">
                Material
              </th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600">
                Category
              </th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600">
                Sub Category
              </th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-600">
                Gender
              </th>
              {/* <th className="px-4 py-3 text-left font-semibold text-neutral-600">
                Description
              </th> */}
              <th className="px-4 py-3 text-center font-semibold text-neutral-600">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-100">
            {products.map((prod) => (
              <tr key={prod.id} className="hover:bg-neutral-50 transition">
                <td className="px-4 py-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 flex items-center justify-center">
                    <Image
                      src={prod.images?.[0] || "/images/placeholder.webp"}
                      alt={prod.name}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                </td>

                <td className="px-4 py-3 font-medium text-neutral-900">
                  {prod.name}
                </td>
                <td className="px-4 py-3 font-semibold text-pink-600">
                  ₹{prod.price.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {prod.weight ? `${prod.weight}g` : "-"}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {prod.quantity ?? "-"}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {prod.material || "-"}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {prod.category || "-"}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {prod.subCategory || "-"}
                </td>
                <td className="px-4 py-3 text-neutral-700 capitalize">
                  {prod.gender || "-"}
                </td>
                {/* <td className="px-4 py-3 text-neutral-700 truncate max-w-xs">
                  {prod.description}
                </td> */}
                <td className="px-4 py-3 text-center space-x-2">
                  <Link href={`/admin/inventory/edit-product?id=${prod.id}`}>
                    <button className="inline-block px-3 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition font-semibold">
                      Edit
                    </button>
                  </Link>

                  <form
                    id={`delete-form-${prod.id}`}
                    action={deleteProduct}
                    className="hidden"
                  >
                    <input type="hidden" name="id" value={prod.id} />
                  </form>

                  <DeleteButtonWithConfirm
                    productId={prod.id}
                    productName={prod.name}
                  />
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="text-center py-8 text-neutral-400 italic"
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
