"use client";

import { useEffect } from "react";
import { useForm, UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const contactSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

type Props = {
  defaultValues: ContactFormValues;
  onFormInstanceReady: (methods: UseFormReturn<ContactFormValues>) => void;
  onValidChange: (valid: boolean) => void;
  onSubmit: (data: ContactFormValues) => void;
};

export default function ContactDetails({
  defaultValues,
  onFormInstanceReady,
  onValidChange,
  onSubmit,
}: Props) {
  const methods = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
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
          Full Name
        </label>
        <input
          type="text"
          {...register("fullName")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
        />
        {errors.fullName && (
          <p className="mt-1 text-sm text-pink-600">
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          type="email"
          {...register("email")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-pink-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          {...register("phone")}
          onInput={(e) => {
            e.currentTarget.value = e.currentTarget.value
              .replace(/\D/g, "")
              .slice(0, 10);
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-pink-600">{errors.phone.message}</p>
        )}
      </div>
    </form>
  );
}
