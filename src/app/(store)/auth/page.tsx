"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import { createCustomerSession } from "./actions";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-blush bg-white text-brown-dark text-sm focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors placeholder-gray-300";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSendOtp = () => {
    setError("");
    const trimmed = email.trim();
    if (!trimmed.includes("@") || !trimmed.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    startTransition(async () => {
      const { error } = await supabase.auth.signInWithOtp({ email: trimmed });
      if (error) {
        setError(error.message);
      } else {
        setStep("otp");
      }
    });
  };

  const handleVerify = () => {
    setError("");
    if (otp.length < 6) {
      setError("Please enter the sign-in code from your email.");
      return;
    }
    startTransition(async () => {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp,
        type: "email",
      });
      if (error) {
        setError(error.message);
        return;
      }
      if (!data.session?.access_token) {
        setError("Verification failed. Please try again.");
        return;
      }
      try {
        const result = await createCustomerSession(data.session.access_token, next);
        if (result && "error" in result) setError(result.error);
      } catch (e) {
        if (isRedirectError(e)) throw e;
        setError("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-3xl text-rose-gold">✦</span>
          <h1 className="mt-3 text-2xl font-serif font-bold text-brown-dark">
            {step === "email" ? "Sign In" : "Check your email"}
          </h1>
          <p className="mt-1 text-sm text-brown/60">
            {step === "email"
              ? "Enter your email to receive a one-time sign-in code."
              : `We sent a sign-in code to ${email.trim()}. Check your inbox.`}
          </p>
        </div>

        <div className="bg-white border border-blush rounded-2xl shadow-sm p-7 space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {step === "email" ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputCls}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  autoFocus
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={isPending}
                className="w-full py-3 bg-rose-gold hover:bg-rose-gold-dark text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {isPending ? "Sending…" : "Send Code"}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Sign-In Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={8}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="12345678"
                  className={`${inputCls} tracking-[0.4em] text-center text-lg font-semibold`}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                  autoFocus
                />
              </div>
              <button
                onClick={handleVerify}
                disabled={isPending}
                className="w-full py-3 bg-rose-gold hover:bg-rose-gold-dark text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {isPending ? "Verifying…" : "Verify & Sign In"}
              </button>
              <button
                onClick={() => { setStep("email"); setOtp(""); setError(""); }}
                className="w-full text-sm text-brown/50 hover:text-brown transition-colors"
              >
                ← Change email
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-brown/40 mt-6">
          By signing in you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}
