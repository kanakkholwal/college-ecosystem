import type { MetadataRoute } from "next";
import { appConfig, orgConfig } from "~/project.config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "college-platform",
    name: appConfig.name,
    short_name: orgConfig.shortName,
    description: appConfig.description,
    icons: [
      {
        src: "./favicon/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose:"maskable"
      },
      {
        src: "./favicon/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose:"maskable"
      },
    ],
    theme_color: "#0d9488",
    background_color: "#0d9488",
    start_url: "/",
    scope: ".",
    display: "standalone",
    orientation: "portrait-primary",
  };
}
