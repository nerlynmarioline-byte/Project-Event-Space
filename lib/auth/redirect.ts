/**
 * Membatasi redirect hanya ke path internal (mencegah open redirect).
 * Nilai seperti "https://situs-lain.com" atau "//situs-lain.com" ditolak.
 */
export function getSafeRedirectPath(
  value: FormDataEntryValue | string | null | undefined,
  fallback = "/"
): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}
