import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/my-bookings", "/admin", "/artists/"] },
    sitemap: "https://www.aod.co.in/sitemap.xml",
  };
}
