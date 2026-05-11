"use client";

import { useState, useTransition, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import { createCustomerSession, bypassLogin } from "./actions";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const BYPASS_EMAILS = [
  "admin.devanshu@shivamjewellers.com",
  "admin.vaibhav@shivamjewellers.com",
];

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-blush bg-white text-brown-dark text-sm focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors placeholder-gray-300";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function AuthPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleSendOtp = () => {
    setError("");
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    startTransition(async () => {
      if (BYPASS_EMAILS.includes(email.toLowerCase().trim())) {
        try {
          const result = await bypassLogin(email.toLowerCase().trim(), next);
          if (result && "error" in result) setError(result.error);
        } catch (e) {
          if (isRedirectError(e)) throw e;
          setError("Something went wrong. Please try again.");
        }
        return;
      }
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        setError(error.message);
      } else {
        setStep("otp");
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
      }
    });
  };

  const handleOtpChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < 7) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
    if (e.key === "Enter") handleVerify();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 8);
    if (pasted.length === 8) {
      setOtp(pasted.split(""));
      otpRefs.current[7]?.focus();
    }
  };

  const handleVerify = () => {
    setError("");
    const token = otp.join("");
    if (token.length < 8) {
      setError("Enter the 8-digit code we sent to your email.");
      return;
    }
    startTransition(async () => {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
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
        if (result && "error" in result) {
          setError(result.error);
        }
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
            {step === "email" ? "Sign In" : "Verify your email"}
          </h1>
          <p className="mt-1 text-sm text-brown/60">
            {step === "email"
              ? "Enter your email to receive a one-time code."
              : `We sent an 8-digit code to ${email}.`}
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
                {isPending ? "Sending…" : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  8-Digit OTP
                </label>
                <div className="flex gap-2 justify-between" onPaste={handleOtpPaste}>
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-blush bg-white text-brown-dark focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors"
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={handleVerify}
                disabled={isPending}
                className="w-full py-3 bg-rose-gold hover:bg-rose-gold-dark text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {isPending ? "Verifying…" : "Verify & Sign In"}
              </button>
              <button
                onClick={() => { setStep("email"); setOtp(["", "", "", "", "", "", "", ""]); setError(""); }}
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
