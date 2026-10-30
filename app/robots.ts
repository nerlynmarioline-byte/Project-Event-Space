import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/favorites"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
