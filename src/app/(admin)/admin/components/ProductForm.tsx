"use client";

import { useEffect, useState } from "react";
import { addProduct, editProduct } from "../actions/product-actions";
import { Product } from "@/types/product";
import PendingButton from "./PendingButton";
import ImagesBridge from "./ImagesBridge";

export const METAL_TYPES = ["Gold - 24K", "Gold - 22K", "Gold - 18K", "Silver"];

interface Props {
  initial?: Partial<Product>;
  isEdit?: boolean;
  error?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metalRates?: any; // Passed from server
}

function getRateForMaterial(
  material: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metalRates: any
): number | undefined {
  switch (material) {
    case "Gold - 24K":
      return metalRates.karat24;
    case "Gold - 22K":
      return metalRates.karat22;
    case "Gold - 18K":
      return metalRates.karat18;
    case "Silver":
      return metalRates.silverRate;
    default:
      return undefined;
  }
}

export default function ProductForm({
  initial = {},
  isEdit = false,
  error,
  metalRates = {},
}: Props) {
  const [material, setMaterial] = useState(initial.material || "");
  const [weight, setWeight] = useState(initial.weight || 0);
  const [price, setPrice] = useState(initial.price || 0);

  useEffect(() => {
    const rate = getRateForMaterial(material, metalRates);

    console.log("🟡 material:", material);
    console.log("⚖️ weight:", weight);
    console.log("🪙 resolved rate:", rate);

    if (rate && weight) {
      const ratePerGram = rate / 10;
      const calculatedPrice = parseFloat((ratePerGram * weight).toFixed(2));
      console.log("✅ Calculated Price:", calculatedPrice);
      setPrice(calculatedPrice);
    } else {
      setPrice(0);
      console.log("⚠️ Rate or weight missing. Skipping price calculation.");
    }
  }, [material, weight, metalRates]);

  return (
    <form
      action={isEdit ? editProduct : addProduct}
      className="space-y-8 bg-white rounded-xl"
    >
      {isEdit && <input type="hidden" name="id" value={initial.id} />}

      {/* Section: Basic Details */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">
          📦 Basic Info
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              name="name"
              placeholder="Product Name"
              defaultValue={initial.name}
              required
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material
            </label>
            <select
              name="material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              required
              className="input"
            >
              <option value="" disabled>
                Select Material
              </option>
              {METAL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section: Pricing & Inventory */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">
          💰 Pricing & Inventory
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹)
            </label>
            <input
              name="price"
              type="number"
              value={price}
              readOnly
              className="input bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (grams)
            </label>
            <input
              name="weight"
              type="number"
              step="0.01"
              value={isNaN(weight) ? "" : weight}
              onChange={(e) => {
                const val = e.target.value;
                setWeight(val === "" ? NaN : parseFloat(val));
              }}
              required
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              name="quantity"
              type="number"
              placeholder="Quantity in stock"
              defaultValue={initial.quantity ?? ""}
              required
              className="input"
            />
          </div>
        </div>
      </div>

      {/* Section: Categorization */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">
          📂 Categorization
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              defaultValue={initial.category || ""}
              required
              className="input"
            >
              <option value="" disabled>
                Select Category
              </option>
              <option value="jewellery">Jewellery</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub Category
            </label>
            <select
              name="subCategory"
              defaultValue={initial.subCategory || ""}
              required
              className="input"
            >
              <option value="" disabled>
                Select Sub Category
              </option>
              <option value="Earrings">Earrings</option>
              <option value="Necklaces">Necklaces</option>
              <option value="Bracelets">Bracelets</option>
              <option value="Chain">Chain</option>
              <option value="Bangls">Bangels</option>
              <option value="Mangal Sutra">Mangal Sutra</option>
              <option value="Payal (Anklet)">Payal (Anklet)</option>
              <option value="Pendant">Pendant</option>
              <option value="Berwa">Berwa</option>
              <option value="Tika">Tika</option>
              <option value="Nathiya">Nathiya</option>
              <option value="Jhumka">Jhumka</option>
              <option value="Bichiya(Toe Ring)">Bichiya(Toe Ring)</option>
              <option value="Ring">Ring</option>
              <option value="Kanthi">Kanthi</option>
              <option value="Silveware">Silverware</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              name="gender"
              defaultValue={initial.gender || ""}
              required
              className="input"
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section: Description */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">
          📝 Description
        </h2>
        <textarea
          name="description"
          placeholder="Detailed product description"
          defaultValue={initial.description ?? ""}
          required
          className="input min-h-[100px]"
        />
      </div>

      {/* Section: Images */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">
          🖼️ Images (optional)
        </h2>
        <ImagesBridge initialImages={initial.images || []} name="images" />
      </div>

      {error && (
        <p className="text-red-500 text-sm">{decodeURIComponent(error)}</p>
      )}

      <PendingButton pendingText={isEdit ? "Updating..." : "Adding..."}>
        {isEdit ? "Update Product" : "Add Product"}
      </PendingButton>
    </form>
  );
}
