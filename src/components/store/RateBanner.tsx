import type { MetalRate } from "@/lib/types";
import { formatPrice } from "@/lib/price";

type Props = { rates: MetalRate[] };

const DOT = <span className="text-blush/30 mx-1">·</span>;
const SEP = <span className="text-blush/20">|</span>;

function RateItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="text-rose-gold font-semibold">{label}</span>
      <span className="text-cream font-medium">{formatPrice(value)}</span>
      <span className="text-blush/50 text-xs">/10g</span>
    </div>
  );
}

export default function RateBanner({ rates }: Props) {
  const gold = rates.find((r) => r.metal.symbol === "Au");
  const silver = rates.find((r) => r.metal.symbol === "Ag");

  if (!gold && !silver) return null;

  const goldPer10g = (purity: number) =>
    Math.round(gold!.ratePerGram * purity * 10);

  const tickerItems = (
    <>
      {gold && <RateItem label="18K Gold" value={goldPer10g(0.75)} />}
      {gold && <>{DOT}<RateItem label="22K Gold" value={goldPer10g(0.916)} /></>}
      {gold && <>{DOT}<RateItem label="24K Gold" value={goldPer10g(1)} /></>}
      {silver && <>{DOT}<RateItem label="Silver 999" value={Math.round(silver.ratePerGram * 10)} /></>}
      <span className="text-blush/30 text-xs shrink-0">{DOT}Today&apos;s rate · GST at checkout{DOT}</span>
    </>
  );

  return (
    <div className="bg-brown-dark py-2 text-sm">
      <style>{`
        @keyframes rb-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .rb-ticker { animation: rb-marquee 22s linear infinite; }
        .rb-ticker:hover { animation-play-state: paused; }
      `}</style>

      {/* Mobile: scrolling marquee */}
      <div className="md:hidden overflow-hidden">
        <div className="rb-ticker flex items-center gap-4 w-max">
          {tickerItems}
          {/* duplicate for seamless loop */}
          {tickerItems}
        </div>
      </div>

      {/* Desktop: static centred row */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-wrap items-center justify-center gap-3 md:gap-5">
        {gold && (
          <>
            <RateItem label="18K Gold" value={goldPer10g(0.75)} />
            {SEP}
            <RateItem label="22K Gold" value={goldPer10g(0.916)} />
            {SEP}
            <RateItem label="24K Gold" value={goldPer10g(1)} />
          </>
        )}
        {gold && silver && SEP}
        {silver && (
          <RateItem label="Silver 999" value={Math.round(silver.ratePerGram * 10)} />
        )}
        <span className="text-blush/30 text-xs">
          Today&apos;s rate · GST applied at checkout
        </span>
      </div>
    </div>
  );
}
