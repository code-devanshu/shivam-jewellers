"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
import { sendOtp, verifyOtp } from "@/app/(store)/auth/actions";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { isValidIndianPhone } from "@/lib/phone";
import { useAuthModal } from "@/components/store/AuthModalProvider";

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-blush bg-white text-brown-dark text-sm focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors placeholder-gray-300";

export default function AuthForm({ next }: { next: string }) {
  const { closeAuthModal } = useAuthModal();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = () => {
    setCooldown(60);
    cooldownRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const handleSendOtp = () => {
    setError("");
    if (!isValidIndianPhone(phone.trim())) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }
    startTransition(async () => {
      const result = await sendOtp(phone.trim());
      if ("error" in result) {
        setError(result.error);
      } else {
        setDevCode("devCode" in result && result.devCode ? result.devCode : null);
        startCooldown();
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
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
    if (e.key === "Enter") handleVerify();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerify = () => {
    setError("");
    const token = otp.join("");
    if (token.length < 6) {
      setError("Enter the 6-digit code sent to your phone.");
      return;
    }
    startTransition(async () => {
      try {
        const result = await verifyOtp(phone.trim(), token, next);
        if (result && "error" in result) setError(result.error);
      } catch (e) {
        if (isRedirectError(e)) throw e;
        setError("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white border border-blush rounded-3xl shadow-xl p-7 space-y-5">
        <div className="text-center">
          <span className="text-3xl text-rose-gold">✦</span>
          <h1 className="mt-3 text-2xl font-serif font-bold text-brown-dark">
            {step === "phone" ? "Welcome to Shivam Jewellers" : "Verify your phone"}
          </h1>
          <p className="mt-1 text-sm text-brown/60">
            {step === "phone"
              ? "Sign in to get exclusive Shivam Jewellers privileges."
              : `We sent a 6-digit code to +91 ${phone.trim()}.`}
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {step === "phone" ? (
          <>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Phone Number
              </label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-3 rounded-xl border border-blush bg-blush/20 text-brown-dark text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="98765 43210"
                  className={inputCls}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  autoFocus
                />
              </div>
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
            {devCode && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Dev bypass — OTP delivery is disabled, code is <strong>{devCode}</strong>
              </p>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                6-Digit OTP
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
                    className="w-12 h-13 text-center text-lg font-bold rounded-xl border border-blush bg-white text-brown-dark focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors"
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
            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); setError(""); setDevCode(null); }}
                className="text-brown/50 hover:text-brown transition-colors"
              >
                ← Change number
              </button>
              <button
                onClick={handleSendOtp}
                disabled={isPending || cooldown > 0}
                className="text-rose-gold hover:text-rose-gold-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
              </button>
            </div>
          </>
        )}

        <p className="text-center text-xs text-brown/40 border-t border-blush pt-4">
          By signing in you agree to our{" "}
          <Link href="/terms" onClick={closeAuthModal} className="text-rose-gold hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" onClick={closeAuthModal} className="text-rose-gold hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
