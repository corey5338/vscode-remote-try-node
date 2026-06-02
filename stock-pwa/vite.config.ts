import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
plugins: [
react(),

VitePWA({
  registerType: "autoUpdate",

  manifest: {
    name: "推奨銘柄",
    short_name: "推奨銘柄",

    description:
      "米国株推奨銘柄ビューア",

    theme_color: "#111827",

    background_color: "#111827",

    display: "standalone",

    start_url: "/",

    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  }
})

]
});