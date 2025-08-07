"use client";

import { useEffect } from "react";
import { useForm, UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const addressSchema = z.object({
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

type Props = {
  defaultValues: AddressFormValues;
  onFormInstanceReady: (methods: UseFormReturn<AddressFormValues>) => void;
  onValidChange: (valid: boolean) => void;
  onSubmit: (data: AddressFormValues) => void;
};

export default function AddressDetails({
  defaultValues,
  onFormInstanceReady,
  onValidChange,
  onSubmit,
}: Props) {
  const methods = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    mode: "onChange",
    defaultValues,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = methods;

  useEffect(() => {
    onFormInstanceReady(methods);
  }, [methods, onFormInstanceReady]);

  const watched = useWatch({ control });
  useEffect(() => {
    onValidChange(isValid);
  }, [watched, isValid, onValidChange]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Street Address
        </label>
        <input
          type="text"
          {...register("street")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
        />
        {errors.street && (
          <p className="mt-1 text-sm text-pink-600">{errors.street.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input
            type="text"
            {...register("city")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-pink-600">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            State
          </label>
          <input
            type="text"
            {...register("state")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
          />
          {errors.state && (
            <p className="mt-1 text-sm text-pink-600">{errors.state.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Pincode
        </label>
        <input
          type="text"
          {...register("pincode")}
          inputMode="numeric"
          onInput={(e) => {
            e.currentTarget.value = e.currentTarget.value
              .replace(/\D/g, "")
              .slice(0, 6);
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
        />
        {errors.pincode && (
          <p className="mt-1 text-sm text-pink-600">{errors.pincode.message}</p>
        )}
      </div>
    </form>
  );
}
