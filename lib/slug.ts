/** Shared URL slug helpers for public content identifiers. */
export function slugify(value: string): string {
  return value.normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
}

export function uniqueSlug(value: string, existing: Iterable<string>, fallback = "item"): string {
  const base = slugify(value) || fallback;
  const used = new Set(Array.from(existing, item => item.toLowerCase()));
  if (!used.has(base)) return base;
  let suffix = 2;
  while (used.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}
