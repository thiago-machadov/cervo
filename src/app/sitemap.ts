import type { MetadataRoute } from "next"
import { SITE } from "@/lib/site-info"

/** Páginas públicas que devem aparecer no Google. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/instalar", priority: 0.6, changeFrequency: "monthly" },
    { path: "/termos", priority: 0.2, changeFrequency: "yearly" },
    { path: "/privacidade", priority: 0.2, changeFrequency: "yearly" },
  ]
  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE.url}${path === "/" ? "" : path}`,
    lastModified: new Date("2026-10-19"),
    changeFrequency,
    priority,
  }))
}
