// Fungsi murni, aman dipakai di client component (misalnya untuk
// auto-generate slug dari judul saat mengetik). Tidak menyentuh database.
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
