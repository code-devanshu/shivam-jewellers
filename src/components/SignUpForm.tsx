"use client";

import React, { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { hashPassword } from "@/lib/cryptoUtils";
import { useToast } from "@/hooks/use-toast";

type SignUpFormInputs = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const TEMP_EMAIL_DOMAINS = [
  "mailinator.com",
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "dispostable.com",
  "fakeinbox.com",
  "trashmail.com",
  "yopmail.com",
  // Add more temporary email domains as needed
];

const SignUpForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasNumberOrSymbol: false,
  });
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormInputs>();

  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");
  const router = useRouter();

  useEffect(() => {
    if (!passwordValue) return;
    setPasswordStrength({
      minLength: passwordValue?.length >= 8,
      hasNumberOrSymbol: /[0-9!@#$%^&*]/.test(passwordValue || ""),
    });

    // Check if passwords match
    setPasswordsMatch(
      !!passwordValue &&
        !!confirmPasswordValue &&
        passwordValue === confirmPasswordValue
    );
  }, [passwordValue, confirmPasswordValue]);

  const validateEmailDomain = (email: string) => {
    const domain = email.split("@")[1]?.toLowerCase();
    return !TEMP_EMAIL_DOMAINS.includes(domain);
  };

  const onSubmit: SubmitHandler<SignUpFormInputs> = (data) => {
    handleOTPEmail(data.fullName, data.email, data.password);
  };

  const handleOTPEmail = async (
    name: string,
    email: string,
    password: string
  ) => {
    setLoading(true);
    try {
      const encryptedPassword = hashPassword(password);
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, encryptedPassword }),
      });

      if (response.ok) {
        router.push("/verification");
        toast({
          title: "Success",
          description: "OTP sent successfully!",
          variant: "success",
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.error || "Failed to send OTP.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Error",
        description: "An error occurred while sending OTP.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    (<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* <Suspense fallback={<div>Loading...</div>}>
        <GoogleSSO />
      </Suspense> */}
      <div className="flex items-center justify-center mt-6">
        <span className="border-b w-1/5 lg:w-1/4"></span>
        <span className="text-sm text-gray-600 mx-4">OR</span>
        <span className="border-b w-1/5 lg:w-1/4"></span>
      </div>
      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-700"
        >
          Full Name
        </label>
        <Input
          id="fullName"
          type="text"
          {...register("fullName", { required: "Full name is required" })}
          placeholder="Enter Full Name"
          className={`mt-1 ${
            errors.fullName ? "border-red-500 focus:ring-red-500" : ""
          }`}
        />
        {errors.fullName && (
          <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <Input
          id="email"
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+$/i,
              message: "Please enter a valid email address",
            },
            validate: (email) =>
              validateEmailDomain(email) ||
              "Temporary email addresses are not allowed",
          })}
          placeholder="Enter Email"
          className={`mt-1 ${
            errors.email ? "border-red-500 focus:ring-red-500" : ""
          }`}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
            placeholder="Enter Password"
            className={`mt-1 ${
              errors.password ? "border-red-500 focus:ring-red-500" : ""
            }`}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff className="text-gray-500" />
            ) : (
              <Eye className="text-gray-500" />
            )}
          </button>
        </div>
        <div className="text-sm mt-3 space-y-1">
          <p>Password Strength:</p>
          <div className="flex items-center">
            <CheckCircle
              className={`${
                passwordStrength.minLength ? "text-green-500" : "text-gray-300"
              } w-5 h-5 mr-2`}
            />
            <p>At least 8 characters</p>
          </div>
          <div className="flex items-center">
            <CheckCircle
              className={`${
                passwordStrength.hasNumberOrSymbol
                  ? "text-green-500"
                  : "text-gray-300"
              } w-5 h-5 mr-2`}
            />
            <p>Contains a number or symbol</p>
          </div>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700"
        >
          Confirm Password
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword", {
              required: "Confirm password is required",
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            })}
            placeholder="Confirm Password"
            className={`mt-1 ${
              errors.confirmPassword ? "border-red-500 focus:ring-red-500" : ""
            }`}
          />
          <div className="absolute top-1/2 right-3 transform -translate-y-1/2">
            {confirmPasswordValue &&
              (passwordsMatch ? (
                <CheckCircle className="text-green-500 w-5 h-5" />
              ) : (
                <XCircle className="text-red-500 w-5 h-5" />
              ))}
          </div>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>
      <div className="text-sm mt-4">
        <p>
          By proceeding, you agree to the Jober.ai{" "}
          <Link href="/terms" className="text-blue-600">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-blue-600">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
      <Button
        type="submit"
        variant="primary"
        disabled={loading}
        className="w-full mt-6"
      >
        {loading ? "Sending OTP..." : "Create Account"}
      </Button>
    </form>)
  );
};

export default SignUpForm;
