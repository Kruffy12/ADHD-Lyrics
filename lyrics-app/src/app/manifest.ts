import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const basePath =
    process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") ?? "";

  return {
    name: "Sensory Lyrics — We Don't Bite",
    short_name: "Sensory Lyrics",
    description:
      "Rhythm-reactive, swipeable lyric visuals for iOS Safari.",
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#050508",
    theme_color: "#050508",
    icons: [
      {
        src: `${basePath}/icons/icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
