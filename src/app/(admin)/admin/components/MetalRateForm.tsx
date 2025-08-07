"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { updateMetalRates } from "../actions/metal-actions";

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
  const [saved, setSaved] = useState<MetalRateFormData | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MetalRateFormData>({
    resolver: zodResolver(metalRateSchema),
    defaultValues: {
      karat24: initialKarat24,
      karat22: initialKarat22,
      karat18: initialKarat18,
      silverRate: initialSilverRate,
    },
  });

  const onSubmit = (data: MetalRateFormData) => {
    startTransition(async () => {
      await updateMetalRates(data);
      setSaved(data);
    });
  };

  return (
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
            <p className="text-red-600 text-sm">{errors.karat24.message}</p>
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
            <p className="text-red-600 text-sm">{errors.karat22.message}</p>
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
            <p className="text-red-600 text-sm">{errors.karat18.message}</p>
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
            <p className="text-red-600 text-sm">{errors.silverRate.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className={`bg-pink-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-pink-700 ${
            isPending ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {isPending ? "Saving..." : "Save Rates"}
        </button>
      </form>

      {isPending && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
          <p className="text-sm text-gray-700 animate-pulse">
            ⏳ Updating rates and recalculating prices...
          </p>
        </div>
      )}

      {saved && (
        <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded text-green-700">
          ✅ Saved: 24K ₹{saved.karat24}, 22K ₹{saved.karat22}, 18K ₹
          {saved.karat18}, Silver ₹{saved.silverRate}
        </div>
      )}
    </div>
  );
}
