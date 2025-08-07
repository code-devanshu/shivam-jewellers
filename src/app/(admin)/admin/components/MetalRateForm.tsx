"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { updateMetalRates } from "../actions/metal-actions";
import { PencilIcon } from "lucide-react";

// 🧪 Schema
const metalRateSchema = z.object({
  karat24: z.number().positive("24K rate must be positive"),
  karat22: z.number().positive("22K rate must be positive"),
  karat18: z.number().positive("18K rate must be positive"),
  silverRate: z.number().positive("Silver rate must be positive"),
});

type MetalRateFormData = z.infer<typeof metalRateSchema>;

export default function MetalRateForm({
  initialKarat24,
  initialKarat22,
  initialKarat18,
  initialSilverRate,
}: {
  initialKarat24: number;
  initialKarat22: number;
  initialKarat18: number;
  initialSilverRate: number;
}) {
  const [saved, setSaved] = useState<MetalRateFormData>({
    karat24: initialKarat24,
    karat22: initialKarat22,
    karat18: initialKarat18,
    silverRate: initialSilverRate,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MetalRateFormData>({
    resolver: zodResolver(metalRateSchema),
    defaultValues: saved,
  });

  const onSubmit = (data: MetalRateFormData) => {
    startTransition(async () => {
      await updateMetalRates(data);
      setSaved(data);
      setIsEditing(false);
    });
  };

  return (
    <div className="bg-gradient-to-br from-pink-50 to-white py-10 px-4 sm:px-6 lg:px-12 rounded-xl shadow-inner max-w-6xl mx-auto space-y-6">
      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* Summary */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow hover:shadow-md transition-all space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Current Metal Rates
            </h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center text-sm text-pink-600 hover:text-pink-700 font-medium"
              >
                <PencilIcon className="w-4 h-4 mr-1" />
                Edit
              </button>
            )}
          </div>
          <ul className="text-sm text-gray-700 grid grid-cols-2 gap-3">
            <li className="flex justify-between">
              <span>Gold 24K (₹ / 10g)</span>
              <span className="font-medium">₹{saved.karat24}</span>
            </li>
            <li className="flex justify-between">
              <span>Gold 22K (₹ / 10g)</span>
              <span className="font-medium">₹{saved.karat22}</span>
            </li>
            <li className="flex justify-between">
              <span>Gold 18K (₹ / 10g)</span>
              <span className="font-medium">₹{saved.karat18}</span>
            </li>
            <li className="flex justify-between">
              <span>Silver (₹ / kg)</span>
              <span className="font-medium">₹{saved.silverRate}</span>
            </li>
          </ul>
        </div>

        {/* Editable Form */}
        {isEditing && (
          <div className="relative">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white shadow p-6 rounded-lg border border-neutral-200 space-y-4"
            >
              {/* 24K */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gold Rate - 24K (₹ / 10g)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("karat24", { valueAsNumber: true })}
                  className="input"
                />
                {errors.karat24 && (
                  <p className="text-red-600 text-sm">
                    {errors.karat24.message}
                  </p>
                )}
              </div>

              {/* 22K */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gold Rate - 22K (₹ / 10g)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("karat22", { valueAsNumber: true })}
                  className="input"
                />
                {errors.karat22 && (
                  <p className="text-red-600 text-sm">
                    {errors.karat22.message}
                  </p>
                )}
              </div>

              {/* 18K */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gold Rate - 18K (₹ / 10g)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("karat18", { valueAsNumber: true })}
                  className="input"
                />
                {errors.karat18 && (
                  <p className="text-red-600 text-sm">
                    {errors.karat18.message}
                  </p>
                )}
              </div>

              {/* Silver */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Silver Rate (₹ / kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("silverRate", { valueAsNumber: true })}
                  className="input"
                />
                {errors.silverRate && (
                  <p className="text-red-600 text-sm">
                    {errors.silverRate.message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={isPending}
                  className={`bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-pink-700 ${
                    isPending ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {isPending ? "Saving..." : "Save Rates"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </form>

            {isPending && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                <p className="text-sm text-gray-700 animate-pulse">
                  ⏳ Updating rates and recalculating prices...
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
