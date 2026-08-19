import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the privacy policy of Shivam Jewellers. Learn how we collect, use, and protect your personal information.",
  openGraph: {
    title: "Privacy Policy | Shivam Jewellers",
    description:
      "Learn how Shivam Jewellers collects, uses, and protects your personal information.",
    url: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-rose-gold text-xs font-semibold uppercase tracking-widest mb-2">
          Legal
        </p>
        <h1 className="text-4xl font-serif font-bold text-brown-dark mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-brown/50">Last updated: January 2025</p>
      </div>

      <div className="prose prose-sm max-w-none text-brown/70 space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-brown-dark mb-2">
            Information We Collect
          </h2>
          <p className="leading-relaxed">
            When you place an order or create an account, we collect your name,
            email address, phone number, and delivery address. We also collect
            information about your browsing and purchase history on our site to
            improve your experience.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-brown-dark mb-2">
            How We Use Your Information
          </h2>
          <p className="leading-relaxed">
            We use your information to process and ship your orders, send order
            confirmations and updates, respond to enquiries, and improve our
            products and services. We do not sell your personal data. If you
            consent to advertising cookies, limited browsing activity is shared
            with our advertising partners (such as Meta) to show you relevant
            ads — see the Cookies section below.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-brown-dark mb-2">
            Data Security
          </h2>
          <p className="leading-relaxed">
            We use industry-standard security measures to protect your personal
            information. Payment transactions are processed through secure,
            PCI-compliant payment gateways and your card details are never
            stored on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-brown-dark mb-2">
            Cookies
          </h2>
          <p className="leading-relaxed">
            Our website uses essential cookies to keep you signed in and to
            remember your cart — these are always on and required for the site
            to function. With your consent, we also use advertising cookies
            (Meta Pixel) to understand how visitors use our site and to show
            you relevant ads on Facebook and Instagram. You can accept or
            decline advertising cookies from the cookie banner shown on your
            first visit; declining does not affect your ability to browse or
            shop with us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-brown-dark mb-2">
            Your Rights
          </h2>
          <p className="leading-relaxed">
            You may request access to, correction of, or deletion of your
            personal data at any time by contacting us at the details on our{" "}
            <Link href="/contact" className="text-rose-gold hover:underline">
              Contact page
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-brown-dark mb-2">
            Contact
          </h2>
          <p className="leading-relaxed">
            If you have any questions about this Privacy Policy, please{" "}
            <Link href="/contact" className="text-rose-gold hover:underline">
              contact us
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
