import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the terms and conditions of Shivam Jewellers. Understand our policies on orders, returns, shipping, and use of our website.",
  openGraph: {
    title: "Terms of Service | Shivam Jewellers",
    description:
      "Terms and conditions for shopping at Shivam Jewellers — orders, returns, shipping, and more.",
    url: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-rose-gold text-xs font-semibold uppercase tracking-widest mb-2">
          Legal
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brown-dark mb-3">
          Terms of Service
        </h1>
        <p className="text-sm text-brown/50">Last updated: January 2025</p>
      </div>

      <div className="prose prose-sm max-w-none text-brown/70 space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-brown-dark mb-2">
            Acceptance of Terms
          </h2>
          <p className="leading-relaxed">
            By accessing or using the Shivam Jewellers website, you agree to be
            bound by these Terms of Service. If you do not agree, please do not
            use our site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-brown-dark mb-2">
            Orders and Pricing
          </h2>
          <p className="leading-relaxed">
            All prices are displayed in Indian Rupees (₹) and are inclusive of
            applicable GST. Jewellery prices are calculated based on the live
            metal rate at the time of purchase and may vary. Orders are
            confirmed only after payment is successfully processed.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-brown-dark mb-2">
            Returns and Exchanges
          </h2>
          <p className="leading-relaxed">
            We accept returns within 7 days of delivery for unused, unaltered
            items in their original packaging. Custom and bespoke orders are
            non-refundable. To initiate a return, please contact us with your
            order details.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-brown-dark mb-2">
            Shipping
          </h2>
          <p className="leading-relaxed">
            We ship across India via insured courier services. Delivery
            timelines are estimates and may vary due to carrier delays or
            unforeseen circumstances. Risk of loss transfers to you upon
            delivery.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-brown-dark mb-2">
            Intellectual Property
          </h2>
          <p className="leading-relaxed">
            All content on this website — including images, text, and designs —
            is the property of Shivam Jewellers and may not be reproduced
            without written permission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-brown-dark mb-2">
            Contact
          </h2>
          <p className="leading-relaxed">
            For any questions about these Terms, please{" "}
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
