import type { MetadataRoute } from "next";

// The web app manifest (served at /manifest.webmanifest): lets phones install the site as an app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "AOD – Artists on Demand",
    short_name: "AOD",
    description: "Book verified photographers, cinematographers, live bands, anchors and more in Ahmedabad.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    categories: ["lifestyle", "entertainment", "business"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
