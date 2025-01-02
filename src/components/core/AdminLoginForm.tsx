"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [isDisable, setIsDisabled] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsDisabled(true); // Disable form inputs while submitting
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false, // Prevent automatic redirection
    });

    if (result?.error) {
      setError("email", { message: "Invalid credentials" });
      setIsDisabled(false);
    } else {
      router.push("/admin/dashboard"); // Redirect explicitly
      router.refresh();
    }
  };

  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-md text-gray-200 shadow-lg border border-gray-700">
        <CardHeader>
          <CardTitle className="text-center text-gray-100">
            Admin Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                {...register("email")}
                className={`w-full bg-gray-700 text-gray-200 border ${
                  errors.email ? "border-red-500" : "border-gray-600"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                {...register("password")}
                className={`w-full bg-gray-700 text-gray-200 border ${
                  errors.password ? "border-red-500" : "border-gray-600"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600"
              disabled={isDisable}
            >
              {isDisable ? "Logging you in..." : "Login"}
            </Button>
          </form>
          {errors.email?.message === "Invalid credentials" && (
            <Alert
              variant="destructive"
              className="mt-4 bg-red-700 text-gray-200 border border-red-800"
            >
              <AlertTitle className="text-gray-100">Error</AlertTitle>
              <AlertDescription>Invalid email or password.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
