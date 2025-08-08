"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import { updateMetalRates } from "../actions/metal-actions";
import { PencilIcon } from "lucide-react";

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

  useEffect(() => {
    if (isPending) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [isPending]);

  const onSubmit = (data: MetalRateFormData) => {
    startTransition(async () => {
      await updateMetalRates(data);
      setSaved(data);
      setIsEditing(false);
    });
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow hover:shadow-md transition-all space-y-4">
      {/* Show Summary */}
      {!isEditing && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Current Metal Rates
            </h3>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center text-sm text-pink-600 hover:text-pink-700 font-medium"
            >
              <PencilIcon className="w-4 h-4 mr-1" />
              Edit
            </button>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
            {/* 24K */}
            <li className="flex items-center justify-between bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg shadow-sm border border-yellow-200">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-yellow-700">
                  Gold 24K
                </span>
                <span className="text-[11px] text-gray-500">(₹ / 10g)</span>
              </div>
              <span className="text-lg font-bold text-yellow-800">
                ₹{saved.karat24}
              </span>
            </li>

            {/* 22K */}
            <li className="flex items-center justify-between bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg shadow-sm border border-amber-200">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-amber-700">
                  Gold 22K
                </span>
                <span className="text-[11px] text-gray-500">(₹ / 10g)</span>
              </div>
              <span className="text-lg font-bold text-amber-800">
                ₹{saved.karat22}
              </span>
            </li>

            {/* 18K */}
            <li className="flex items-center justify-between bg-gradient-to-br from-rose-50 to-rose-100 p-4 rounded-lg shadow-sm border border-rose-200">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-rose-700">
                  Gold 18K
                </span>
                <span className="text-[11px] text-gray-500">(₹ / 10g)</span>
              </div>
              <span className="text-lg font-bold text-rose-800">
                ₹{saved.karat18}
              </span>
            </li>

            {/* Silver */}
            <li className="flex items-center justify-between bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-700">
                  Silver
                </span>
                <span className="text-[11px] text-gray-500">(₹ / kg)</span>
              </div>
              <span className="text-lg font-bold text-gray-800">
                ₹{saved.silverRate}
              </span>
            </li>
          </ul>
        </>
      )}

      {/* Show Form */}
      {isEditing && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { label: "Gold Rate - 24K (₹ / 10g)", name: "karat24" },
            { label: "Gold Rate - 22K (₹ / 10g)", name: "karat22" },
            { label: "Gold Rate - 18K (₹ / 10g)", name: "karat18" },
            { label: "Silver Rate (₹ / kg)", name: "silverRate" },
          ].map(({ label, name }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                type="number"
                step="0.01"
                {...register(name as keyof MetalRateFormData, {
                  valueAsNumber: true,
                })}
                className="input"
              />
              {errors[name as keyof MetalRateFormData] && (
                <p className="text-red-600 text-sm">
                  {errors[name as keyof MetalRateFormData]?.message}
                </p>
              )}
            </div>
          ))}

          <div className="flex items-center gap-4 pt-2">
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
      )}

      {isPending && (
        <div className="absolute inset-0 bg-white/70 bg-white h-full w-screen backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
          <div className="flex flex-col items-center justify-center space-y-2 text-gray-700">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-pink-200 border-t-pink-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[50px] font-bold text-pink-600">⏳</span>
              </div>
            </div>
            <p className="text-2xl font-medium text-center animate-pulse">
              Updating rates and recalculating prices...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
