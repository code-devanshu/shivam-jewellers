"use client";
import { useEffect, useState, useRef } from "react";

const OPENCAGE_KEY = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY!;

export default function AddressAutocomplete({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (val: string) => void;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const justSelected = useRef(false); // ✅ new ref to avoid post-select fetch

  useEffect(() => {
    if (justSelected.current) {
      justSelected.current = false;
      return;
    }

    const controller = new AbortController();

    if (value.length < 3) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
            value
          )}&key=${OPENCAGE_KEY}&limit=5&countrycode=in`,
          { signal: controller.signal }
        );

        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results = data.results.map((r: any) => r.formatted);
        setSuggestions(results);
      } catch (err) {
        console.warn("Autocomplete error:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchSuggestions, 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(e.target.value); // still controlled
  };

  const handleSelect = (val: string) => {
    justSelected.current = true; // ✅ suppress next useEffect run
    onSelect(val); // parent updates form value
    setSuggestions([]); // hide suggestions
  };

  return (
    <div className="relative">
      <input
        type="text"
        className="border rounded-lg p-3 w-full text-[15px] focus:border-pink-500 transition"
        value={value}
        onChange={handleChange}
        placeholder="Start typing address..."
      />
      {loading && (
        <div className="text-xs text-gray-400 mt-1">Loading suggestions...</div>
      )}
      {suggestions.length > 0 && (
        <ul className="absolute z-20 top-full left-0 right-0 bg-white border rounded shadow max-h-52 overflow-y-auto mt-1">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="px-4 py-2 hover:bg-pink-50 cursor-pointer text-sm"
              onClick={() => handleSelect(s)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
