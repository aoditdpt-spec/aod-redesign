import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // aod.co.in's addresses that are named differently here (2026-11-21), so old links, bookmarks and
  // emails still land on the right page.
  async redirects() {
    return [
      { source: "/for-artists", destination: "/artists", permanent: true },
      { source: "/book/personal", destination: "/book", permanent: true },
      { source: "/book/business", destination: "/business", permanent: true },
      { source: "/resolve", destination: "/dispute-desk", permanent: true },
      { source: "/resolve/:path(new|track)", destination: "/dispute-desk/:path", permanent: true },
      { source: "/admin/dashboard", destination: "/admin", permanent: true },
      { source: "/admin/resolution", destination: "/admin/disputes", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // The service worker must never be cached, so phones pick up a new version at once.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
};

export default nextConfig;
