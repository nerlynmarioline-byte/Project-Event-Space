import "server-only";

import { prisma } from "@/lib/db/prisma";

export { slugify } from "@/lib/events/slug-client";
import { slugify } from "@/lib/events/slug-client";

/** Menambahkan -2, -3, dst kalau slug sudah dipakai event lain. */
export async function ensureUniqueSlug(
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(baseSlug) || "event";
  let candidate = base;
  let counter = 2;

  while (true) {
    const existing = await prisma.event.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    candidate = `${base}-${counter}`;
    counter += 1;
  }
}
