"use client";

import { useActionState } from "react";
import { CheckCircle, Loader2, Send } from "lucide-react";
import { submitInquiry, type InquiryFormState } from "@/app/(store)/contact/actions";

const INITIAL: InquiryFormState = { status: "idle" };

export default function ContactForm() {
  const [state, action, isPending] = useActionState(submitInquiry, INITIAL);

  if (state.status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500">
          <CheckCircle size={32} />
        </div>
        <h3 className="text-xl font-serif font-bold text-brown-dark">
          Message received!
        </h3>
        <p className="text-brown/60 max-w-sm text-sm">
          We&apos;ll get back to you within 24 hours. You can also reach us directly on WhatsApp for faster replies.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state.status === "error" && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {state.message}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-brown-dark mb-1.5">
            Your Name <span className="text-rose-gold">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Priya Sharma"
            className="w-full px-4 py-3 rounded-xl border border-blush bg-cream text-brown-dark placeholder-brown/30 focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors text-sm"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-brown-dark mb-1.5">
            Mobile Number <span className="text-rose-gold">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="98765 43210"
            maxLength={10}
            className="w-full px-4 py-3 rounded-xl border border-blush bg-cream text-brown-dark placeholder-brown/30 focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-semibold text-brown-dark mb-1.5">
          What can we help with?
        </label>
        <select
          id="type"
          name="type"
          defaultValue="GENERAL"
          className="w-full px-4 py-3 rounded-xl border border-blush bg-cream text-brown-dark focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors text-sm"
        >
          <option value="GENERAL">General Inquiry</option>
          <option value="CUSTOM_ORDER">Custom / Bespoke Order</option>
          <option value="AVAILABILITY">Product Availability</option>
        </select>
      </div>

      <div>
        <label htmlFor="productInterest" className="block text-sm font-semibold text-brown-dark mb-1.5">
          Product you&apos;re interested in{" "}
          <span className="font-normal text-brown/40">(optional)</span>
        </label>
        <input
          id="productInterest"
          name="productInterest"
          type="text"
          placeholder="e.g. Gold Jhumka Earrings, Bridal Necklace Set…"
          className="w-full px-4 py-3 rounded-xl border border-blush bg-cream text-brown-dark placeholder-brown/30 focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors text-sm"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-brown-dark mb-1.5">
          Message <span className="text-rose-gold">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="Tell us what you're looking for — customizations, budget, occasion, or anything else."
          className="w-full px-4 py-3 rounded-xl border border-blush bg-cream text-brown-dark placeholder-brown/30 focus:outline-none focus:border-rose-gold focus:ring-1 focus:ring-rose-gold transition-colors text-sm resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-rose-gold hover:bg-rose-gold-dark disabled:opacity-60 text-white py-3.5 rounded-full font-semibold text-sm transition-colors"
      >
        {isPending ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Sending…
          </>
        ) : (
          <>
            <Send size={16} /> Send Message
          </>
        )}
      </button>
    </form>
  );
}
