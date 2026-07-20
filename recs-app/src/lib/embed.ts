/**
 * PostgREST returns an embedded resource as a single object when it can prove the
 * relationship is to-one (e.g. a UNIQUE foreign key like `rec_status.recommendation_id`),
 * but as an array otherwise. To stay robust across both, normalize either shape to
 * one row. Used wherever we embed `rec_status` on `recommendations`.
 */
export function embedOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}
