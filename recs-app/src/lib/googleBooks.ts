/**
 * Google Books API wrapper (ARCHITECTURE §1: `/volumes?q=`, free, no key).
 * Pure module — no React. Normalizes raw volumes into `BookVolume` and, per D5
 * (canonical-work granularity), dedupes editions down to one entry per book.
 */

/** A single book, normalized from a Google Books volume. */
export type BookVolume = {
  volumeId: string;
  title: string;
  authors: string[];
  coverUrl: string | null;
  description: string | null;
  /** Google `categories`, capped — feeds the TagChip row. */
  tags: string[];
};

const BASE = 'https://www.googleapis.com/books/v1/volumes';
export const PAGE_SIZE = 20;

// The API returns 0 results for many queries unless a `country` is supplied.
const COUNTRY = 'US';

// Basic search needs no key (ARCHITECTURE §1), but the shared keyless quota is
// low. If a key is provided it's appended to raise the limit — otherwise unused.
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY ?? '';
const keyParam = API_KEY ? `&key=${API_KEY}` : '';

/** Shape of the bits of a Google Books volume we read. */
type RawVolume = {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    description?: string;
    categories?: string[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
};

type RawSearchResponse = { items?: RawVolume[]; totalItems?: number };

/** Google serves cover URLs over http and with a page-curl overlay; clean both. */
function normalizeCover(links?: { thumbnail?: string; smallThumbnail?: string }): string | null {
  const raw = links?.thumbnail ?? links?.smallThumbnail;
  if (!raw) return null;
  return raw.replace(/^http:\/\//, 'https://').replace('&edge=curl', '');
}

function toBookVolume(raw: RawVolume): BookVolume {
  const info = raw.volumeInfo ?? {};
  return {
    volumeId: raw.id,
    title: info.title ?? 'Untitled',
    authors: info.authors ?? [],
    coverUrl: normalizeCover(info.imageLinks),
    description: info.description ?? null,
    tags: (info.categories ?? []).slice(0, 3),
  };
}

/** Search books. `startIndex` paginates (see `PAGE_SIZE`). */
export async function searchVolumes(
  query: string,
  startIndex = 0,
): Promise<{ volumes: BookVolume[]; totalItems: number }> {
  const url =
    `${BASE}?q=${encodeURIComponent(query)}` +
    `&maxResults=${PAGE_SIZE}&startIndex=${startIndex}&country=${COUNTRY}${keyParam}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Books search failed (${res.status})`);
  const json = (await res.json()) as RawSearchResponse;
  return {
    volumes: (json.items ?? []).map(toBookVolume),
    totalItems: json.totalItems ?? 0,
  };
}

/** Fetch a single volume by id — used by the detail screen's `gb:` branch. */
export async function fetchVolume(volumeId: string): Promise<BookVolume> {
  const res = await fetch(`${BASE}/${encodeURIComponent(volumeId)}?country=${COUNTRY}${keyParam}`);
  if (!res.ok) throw new Error(`Google Books volume fetch failed (${res.status})`);
  return toBookVolume((await res.json()) as RawVolume);
}

/** Grouping key: lowercased, punctuation-stripped, whitespace-collapsed. */
function normalizeKeyPart(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Higher = more complete; breaks ties within a canonical group. */
function completeness(v: BookVolume): number {
  return (v.coverUrl ? 2 : 0) + (v.description ? 1 : 0);
}

/**
 * Collapse editions to canonical works (D5). Groups by title + first author,
 * keeps the most complete volume per group, and preserves the order in which
 * each group first appeared in the results.
 */
export function canonicalize(volumes: BookVolume[]): BookVolume[] {
  const groups = new Map<string, { best: BookVolume; order: number }>();
  volumes.forEach((v, i) => {
    const key = `${normalizeKeyPart(v.title)}|${normalizeKeyPart(v.authors[0] ?? '')}`;
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, { best: v, order: i });
    } else if (completeness(v) > completeness(existing.best)) {
      existing.best = v; // keep earliest `order`
    }
  });
  return [...groups.values()].sort((a, b) => a.order - b.order).map((g) => g.best);
}
