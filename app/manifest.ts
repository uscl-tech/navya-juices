import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Navya's Fresh Juices",
    short_name: "Navya's Juices",
    description: "Premium organic wheatgrass juice for optimal health and wellness",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#10b981",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/mobile-home.jpg",
        sizes: "1080x1920",
        type: "image/jpg",
        form_factor: "narrow",
        label: "Navya's Fresh Juices Home Screen",
      },
      {
        src: "/screenshots/desktop-home.jpg",
        sizes: "1920x1080",
        type: "image/jpg",
        form_factor: "wide",
        label: "Navya's Fresh Juices Desktop Home",
      },
    ],
    orientation: "portrait",
    categories: ["food", "health", "shopping"],
  }
}
