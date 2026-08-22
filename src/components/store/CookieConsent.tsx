"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";
import Link from "next/link";
import { GoogleAnalytics } from "@next/third-parties/google";
import { useIsClient } from "@/lib/useIsClient";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "1083951127307391";
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;
const CONSENT_KEY = "cookie_consent";

type Consent = "granted" | "denied" | null;

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): Consent {
  const stored = window.localStorage.getItem(CONSENT_KEY);
  return stored === "granted" || stored === "denied" ? stored : null;
}

function getServerSnapshot(): Consent {
  return null;
}

function decide(value: "granted" | "denied") {
  window.localStorage.setItem(CONSENT_KEY, value);
  listeners.forEach((notify) => notify());
}

export default function CookieConsent() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // Defer showing/hiding the banner until after hydration settles on the real
  // localStorage value, so a returning visitor never sees it flash on then off.
  const mounted = useIsClient();

  return (
    <>
      {consent === "granted" && (
        <>
          {GA_MEASUREMENT_ID && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {mounted && consent === null && (
        <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6">
          <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <p className="text-sm text-gray-500 flex-1">
              We use cookies to improve your experience and show you relevant ads. By clicking
              &ldquo;Accept&rdquo;, you agree to our use of cookies.{" "}
              <Link href="/privacy" className="text-rose-gold hover:underline">
                Learn more
              </Link>
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => decide("denied")}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-brown-dark transition-colors"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => decide("granted")}
                className="px-5 py-2 bg-rose-gold hover:bg-rose-gold-dark text-white rounded-full text-sm font-semibold transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
