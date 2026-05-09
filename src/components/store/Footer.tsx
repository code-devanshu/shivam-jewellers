import Link from "next/link";

const SHOP_LINKS = [
  { href: "/products?category=rings", label: "Rings" },
  { href: "/products?category=necklaces", label: "Necklaces" },
  { href: "/products?category=earrings", label: "Earrings" },
  { href: "/products?category=bangles", label: "Bangles" },
  { href: "/products?category=pendants", label: "Pendants" },
];

export default function Footer() {
  return (
    <footer className="bg-brown-dark text-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl text-rose-gold-light">✦</span>
              <span className="text-lg font-serif font-bold text-rose-gold-light">
                Shivam Jewellers
              </span>
            </div>
            <p className="text-sm text-blush/70 mb-4 leading-relaxed max-w-xs">
              Crafting timeless jewellery since 1995. Every piece carries the BIS hallmark — a promise of purity and craftsmanship.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-blush/50">
              <span className="border border-blush/20 rounded-full px-3 py-1">BIS Hallmark Certified</span>
              <span className="border border-blush/20 rounded-full px-3 py-1">30+ Years</span>
              <span className="border border-blush/20 rounded-full px-3 py-1">Insured Shipping</span>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-semibold text-rose-gold-light mb-4 uppercase tracking-widest">
              Shop
            </h3>
            <ul className="space-y-2">
              {SHOP_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-blush/70 hover:text-rose-gold-light transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold text-rose-gold-light mb-4 uppercase tracking-widest">
              Contact
            </h3>
            <ul className="space-y-2 text-sm text-blush/70">
              <li>
                <a href="tel:+918808011114" className="hover:text-rose-gold-light transition-colors">
                  📞 +91 88080 11114
                </a>
              </li>
              <li className="leading-relaxed">
                📍 Jamuna Gali, Malviya Rd,<br />
                Pathar Deva, Deoria,<br />
                Uttar Pradesh 274806
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blush/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-blush/40">
          <p>© {new Date().getFullYear()} Shivam Jewellers. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-rose-gold-light transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-rose-gold-light transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
