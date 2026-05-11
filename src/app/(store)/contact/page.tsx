import { MapPin, MessageCircle, Phone } from "lucide-react";
import ContactForm from "@/components/store/ContactForm";

export const metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Shivam Jewellers in Deoria, UP. Visit our store, call us, or chat on WhatsApp for custom jewellery orders and enquiries.",
  openGraph: {
    title: "Contact Shivam Jewellers",
    description:
      "Reach us at our store in Deoria, UP — call, WhatsApp, or fill out the enquiry form.",
    url: "/contact",
  },
};

const WHATSAPP_NUMBER = "+918808011114"; // TODO: replace with real number
const STORE_PHONE = "+91 88080 11114"; // TODO: replace with real number
const STORE_ADDRESS = `Jamuna Gali, Malviya Rd, Pathar Deva, Raghav Nagar, Deoria, Uttar Pradesh 274806`;

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function ContactPage() {
  const waUrl = buildWhatsAppUrl(
    "Hi! I visited Shivam Jewellers online and would like to know more about your collection.",
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page header */}
      <div className="text-center mb-12">
        <p className="text-rose-gold text-xs font-semibold uppercase tracking-widest mb-2">
          ✦ We&apos;d love to hear from you
        </p>
        <h1 className="text-4xl font-serif font-bold text-brown-dark mb-3">
          Get in Touch
        </h1>
        <p className="text-brown/60 max-w-md mx-auto text-sm leading-relaxed">
          Whether you have a question about a piece, want a custom design, or
          just want to say hello — we&apos;re here for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* ── Left: info + WhatsApp ────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* WhatsApp CTA */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-[#25D366] hover:bg-[#1ebe5d] text-white rounded-2xl px-6 py-5 transition-colors group"
          >
            <div className="shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle size={24} />
            </div>
            <div>
              <p className="font-semibold text-sm">Chat on WhatsApp</p>
              <p className="text-white/80 text-xs mt-0.5">
                Fastest way to reach us · Usually replies in minutes
              </p>
            </div>
          </a>

          {/* Store details */}
          <div className="bg-cream border border-blush rounded-2xl p-6 space-y-5">
            <h2 className="font-serif font-bold text-brown-dark text-lg">
              Visit Our Store
            </h2>

            <div className="flex items-start gap-3 text-sm">
              <MapPin size={16} className="text-rose-gold mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-brown-dark mb-0.5">Address</p>
                <p className="text-brown/60 leading-relaxed">{STORE_ADDRESS}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm">
              <Phone size={16} className="text-rose-gold mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-brown-dark mb-0.5">Phone</p>
                <a
                  href={`tel:${STORE_PHONE.replace(/\s/g, "")}`}
                  className="text-brown/60 hover:text-rose-gold transition-colors"
                >
                  {STORE_PHONE}
                </a>
              </div>
            </div>

            <div className="border-t border-blush pt-4 text-sm text-brown/60 space-y-1">
              <p className="font-semibold text-brown-dark">Store Hours</p>
              <p>Mon – Sat: 10:00 AM – 8:00 PM</p>
              <p>Sunday: 11:00 AM – 6:00 PM</p>
            </div>
          </div>

          {/* Custom order note */}
          <div className="bg-blush/40 border border-blush rounded-2xl px-6 py-5 text-sm text-brown/70 leading-relaxed">
            <p className="font-semibold text-brown-dark mb-1">
              Custom &amp; Bespoke Orders
            </p>
            Looking for something unique? We craft personalised pieces from
            scratch — just share your idea, budget, and occasion and our
            artisans will bring it to life.
          </div>
        </div>

        {/* ── Right: form ─────────────────────────────────────────── */}
        <div className="lg:col-span-3 bg-cream border border-blush rounded-2xl p-8">
          <h2 className="font-serif font-bold text-brown-dark text-xl mb-6">
            Send us a message
          </h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
