import { NextRequest, NextResponse } from "next/server";

type GoogleGeocodeResponse = {
  results?: { address_components?: { long_name?: string; types?: string[] }[] }[];
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_GEOCODING_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Geocoding not configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const lat = typeof body?.lat === "number" ? body.lat : null;
  const lng = typeof body?.lng === "number" ? body.lng : null;
  if (lat === null || lng === null) {
    return NextResponse.json({ error: "lat/lng required" }, { status: 400 });
  }

  const params = new URLSearchParams({
    latlng: `${lat},${lng}`,
    key: apiKey,
    result_type: "postal_code",
  });

  const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`);
  if (!res.ok) {
    return NextResponse.json({ error: "Geocoding request failed" }, { status: 502 });
  }

  const data = (await res.json().catch(() => null)) as GoogleGeocodeResponse | null;
  const components = data?.results?.[0]?.address_components;
  const postal = components?.find((c) => c.types?.includes("postal_code"))?.long_name;

  if (!postal || !/^\d{6}$/.test(postal)) {
    return NextResponse.json({ error: "Could not resolve pincode" }, { status: 404 });
  }

  return NextResponse.json({ pincode: postal });
}
