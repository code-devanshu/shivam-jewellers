"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { adminLogin, type LoginFormState } from "./actions";

const INITIAL: LoginFormState = { status: "idle" };

const inputCls =
  "w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-brown-dark text-sm focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors placeholder-gray-300";

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(adminLogin, INITIAL);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-serif font-bold text-2xl text-brown-dark">Shivam Jewellers</div>
          <div className="text-[11px] text-rose-gold tracking-[0.2em] uppercase mt-1">Admin Panel</div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-lg font-semibold text-brown-dark mb-6">Sign in</h1>

          <form action={formAction} className="space-y-4">
            {state.status === "error" && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {state.message}
              </p>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                autoFocus
                className={inputCls}
                placeholder="Enter admin password"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 bg-rose-gold hover:bg-rose-gold-dark disabled:opacity-60 text-white py-2.5 rounded-full font-semibold text-sm transition-colors"
            >
              {isPending && <Loader2 size={15} className="animate-spin" />}
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
