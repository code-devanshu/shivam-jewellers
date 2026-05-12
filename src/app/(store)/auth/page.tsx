"use client";

import { useState, useTransition, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { sendOtp, verifyOtp, bypassLogin } from "./actions";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const inputCls =
  "w-full px-4 py-3 rounded-xl border border-blush bg-white text-brown-dark text-sm focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors placeholder-gray-300";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";

  const [step, setStep] = useState<"email" | "otp" | "bypass">("email");
  const [email, setEmail] = useState("");
  const [bypassEmail, setBypassEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
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
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    startTransition(async () => {
      const result = await sendOtp(email);
      if ("error" in result) {
        setError(result.error);
      } else {
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
      setError("Enter the 6-digit code sent to your email.");
      return;
    }
    startTransition(async () => {
      try {
        const result = await verifyOtp(email, token, next);
        if (result && "error" in result) setError(result.error);
      } catch (e) {
        if (isRedirectError(e)) throw e;
        setError("Something went wrong. Please try again.");
      }
    });
  };

  const handleBypassLogin = () => {
    setError("");
    startTransition(async () => {
      try {
        const result = await bypassLogin(bypassEmail.toLowerCase().trim(), next);
        if (result && "error" in result) setError(result.error);
      } catch (e) {
        if (isRedirectError(e)) throw e;
        setError("Something went wrong. Please try again.");
      }
    });
  };

  if (step === "bypass") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-3xl text-rose-gold">✦</span>
            <h1 className="mt-3 text-2xl font-serif font-bold text-brown-dark">Admin Access</h1>
          </div>
          <div className="bg-white border border-blush rounded-2xl shadow-sm p-7 space-y-4">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={bypassEmail}
                onChange={(e) => setBypassEmail(e.target.value)}
                placeholder="admin@shivamjewellers.com"
                className={inputCls}
                onKeyDown={(e) => e.key === "Enter" && handleBypassLogin()}
                autoFocus
              />
            </div>
            <button
              onClick={handleBypassLogin}
              disabled={isPending}
              className="w-full py-3 bg-rose-gold hover:bg-rose-gold-dark text-white rounded-full text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {isPending ? "Signing in…" : "Sign In"}
            </button>
            <button
              onClick={() => { setStep("email"); setError(""); }}
              className="w-full text-sm text-brown/50 hover:text-brown transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-3xl text-rose-gold">✦</span>
          <h1 className="mt-3 text-2xl font-serif font-bold text-brown-dark">
            {step === "email" ? "Sign In" : "Verify your email"}
          </h1>
          <p className="mt-1 text-sm text-brown/60">
            {step === "email"
              ? "Enter your email address to receive a one-time code."
              : `We sent a 6-digit code to ${email}.`}
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
                {isPending ? "Sending…" : "Send OTP to Email"}
              </button>
            </>
          ) : (
            <>
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
                  onClick={() => { setStep("email"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                  className="text-brown/50 hover:text-brown transition-colors"
                >
                  ← Change email
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
        </div>

        <p className="text-center text-xs text-brown/40 mt-6">
          By signing in you agree to our Terms of Service.
        </p>
        <p className="text-center mt-3">
          <button
            onClick={() => { setStep("bypass"); setError(""); }}
            className="text-xs text-brown/20 hover:text-brown/40 transition-colors"
          >
            Admin access
          </button>
        </p>
      </div>
    </div>
  );
}
