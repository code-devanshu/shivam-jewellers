// JSON.stringify does not escape "<", so a value containing "</script>" (e.g.
// an admin-entered product name/description) can break out of the
// <script type="application/ld+json"> tag it's rendered into and inject
// arbitrary HTML/JS. Escaping "<" as a unicode sequence keeps the JSON valid
// while making that breakout impossible.
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
