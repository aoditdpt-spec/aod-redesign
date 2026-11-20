import type { MetadataRoute } from "next";
import { categories } from "@/data/site";

const base = "https://www.aod.co.in";

// Every public page, for search engines.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/categories", "/book", "/business", "/artists", "/dispute-desk", "/about", "/blog", "/privacy", "/terms", "/refund-policy"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, priority: p === "" ? 1 : 0.7 })),
    ...categories.map((c) => ({ url: `${base}/categories/${c.slug}`, priority: 0.8 })),
  ];
}
