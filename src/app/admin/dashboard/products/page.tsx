import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IndianRupee } from "lucide-react";
import ProductsClient from "./components/products-client";
import Link from "next/link";
import { Product } from "@/model/base.model";

export default async function ProductsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`);
  if (!res.ok) {
    console.error("Failed to fetch products");
    return;
  }
  const products: Product[] = await res.json();

  return (
    <div className="p-6">
      <div className="flex justify-end items-center mb-6">
        <Link
          href="/admin/dashboard/products/add"
          replace={true}
          className="ml-auto px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition"
        >
          Add Product
        </Link>
      </div>

      {/* Render Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gray-100 text-gray-800">
              <TableHead className="py-3 px-4 font-semibold">Image</TableHead>
              <TableHead className="py-3 px-4 font-semibold">Name</TableHead>
              <TableHead className="py-3 px-4 font-semibold">Price</TableHead>
              <TableHead className="py-3 px-4 font-semibold">
                Material
              </TableHead>
              <TableHead className="py-3 px-4 font-semibold">Rating</TableHead>
              <TableHead className="py-3 px-4 font-semibold">
                Category
              </TableHead>
              <TableHead className="py-3 px-4 font-semibold">
                Subcategory
              </TableHead>
              <TableHead className="py-3 px-4 font-semibold">Gender</TableHead>
              <TableHead className="py-3 px-4 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product, index) => (
              <TableRow
                key={product.id + index + "fnkjndkn"}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100 transition duration-200`}
              >
                <TableCell className="py-3 px-4">
                  <div className="flex justify-center items-center">
                    <Image
                      src={product.image[0]}
                      height={50}
                      width={50}
                      className="rounded-full h-10 w-10 object-cover"
                      alt={product.name}
                    />
                  </div>
                </TableCell>
                <TableCell className="py-3 px-4 font-medium text-gray-800">
                  {product.name}
                </TableCell>
                <TableCell className="py-3 px-4 text-gray-700">
                  <IndianRupee className="h-4 inline" />
                  {product.price.toFixed(2)}
                </TableCell>
                <TableCell className="py-3 px-4 text-gray-700">
                  {product.material || "N/A"}
                </TableCell>
                <TableCell className="py-3 px-4 text-gray-700">
                  {product.rating ? `${product.rating} ⭐` : "No Rating"}
                </TableCell>
                <TableCell className="py-3 px-4 text-gray-700">
                  {product.category || "N/A"}
                </TableCell>
                <TableCell className="py-3 px-4 text-gray-700">
                  {product.subcategory || "N/A"}
                </TableCell>
                <TableCell className="py-3 px-4 text-gray-700">
                  {product.gender}
                </TableCell>
                <TableCell className="py-3 px-4">
                  <ProductsClient product={product} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
