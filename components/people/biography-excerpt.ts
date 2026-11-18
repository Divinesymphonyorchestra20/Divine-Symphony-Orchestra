export function biographyExcerpt(biography: string) {
  const text = biography.trim().replace(/\s+/g, " ");
  if (text.length <= 240) return text;
  const excerpt = text.slice(0, 240);
  const lastSpace = excerpt.lastIndexOf(" ");
  return `${excerpt.slice(0, lastSpace > 0 ? lastSpace : excerpt.length).trimEnd()}…`;
}
