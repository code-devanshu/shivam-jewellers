import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center bg-cream">
      <span className="text-6xl text-rose-gold mb-6">✦</span>
      <h1 className="text-3xl font-serif font-bold text-brown-dark mb-3">
        Page Not Found
      </h1>
      <p className="text-brown/60 mb-8 max-w-sm text-sm leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-rose-gold hover:bg-rose-gold-dark text-white rounded-full px-6 py-2.5 text-sm font-semibold transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
