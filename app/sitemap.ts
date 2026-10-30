import type { MetadataRoute } from "next";

import { prisma } from "@/lib/db/prisma";
import { siteUrl } from "@/lib/site-config";

// Event baru/berubah terus-menerus, jadi sitemap dibangkitkan tiap kali
// diminta (bukan dibekukan sekali saat build) supaya selalu akurat.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await prisma.event.findMany({
    where: { status: { in: ["PUBLISHED", "FINISHED"] } },
    select: { slug: true, updatedAt: true },
  });

  const eventEntries: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${siteUrl}/events/${event.slug}`,
    lastModified: event.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    {
      url: `${siteUrl}/events`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...eventEntries,
  ];
}
