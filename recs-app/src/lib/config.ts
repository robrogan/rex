/**
 * App-wide config. `PUBLIC_BASE_URL` is where the public share pages (A9) will
 * live — a placeholder until the domain/app name is chosen (see DECISIONS_NEEDED).
 * Override via the `EXPO_PUBLIC_PUBLIC_BASE_URL` env var once the domain exists.
 */
export const PUBLIC_BASE_URL =
  process.env.EXPO_PUBLIC_PUBLIC_BASE_URL ?? 'https://example.com';

export function publicItemUrl(itemId: string): string {
  return `${PUBLIC_BASE_URL}/item/${itemId}`;
}
