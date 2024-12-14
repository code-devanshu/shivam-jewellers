"use client";
import { useState, useEffect } from "react";
import AddProductForm from "./components/add-product-form";
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
import { Product } from "@/model/base.model";
import ProductsClient from "./components/products-client";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cloudinaryImages, setCloudinaryImages] = useState([]);

  // Function to fetch products
  const fetchProducts = async (): Promise<void> => {
    const res = await fetch("/api/products");
    if (!res.ok) {
      console.error("Failed to fetch products");
      return;
    }
    const data: Product[] = await res.json();
    setProducts(data);
  };

  // Fetch products initially
  useEffect(() => {
    fetchProducts();
    fetchCloudinaryImages();
  }, []);

  const fetchCloudinaryImages = async () => {
    try {
      const response = await fetch("/api/cloudinary-images");
      const data = await response.json();

      setCloudinaryImages(data); // Set the images fetched from Cloudinary
    } catch (error) {
      console.error("Error fetching Cloudinary images:", error);
    }
  };

  // Callback function to refresh products from child components
  const handleRefresh = (): void => {
    fetchProducts();
  };

  return (
    <div className="p-6">
      <div className="flex justify-end items-center mb-6">
        <AddProductForm
          onRefresh={handleRefresh}
          cloudinaryImages={cloudinaryImages}
        />
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
              <TableHead className="py-3 px-4 font-semibold">
                Description
              </TableHead>
              <TableHead className="py-3 px-4 font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product, index) => (
              <TableRow
                key={product.id}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100 transition duration-200`}
              >
                <TableCell className="py-3 px-4">
                  <div className="flex justify-center items-center">
                    <Image
                      src={product.image}
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
                <TableCell className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
                  {product.description}
                </TableCell>
                <TableCell className="py-3 px-4">
                  <ProductsClient
                    product={product}
                    onRefresh={handleRefresh}
                    cloudinaryImages={cloudinaryImages}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
