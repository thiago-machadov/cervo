import type { MetadataRoute } from "next"
import { SITE } from "@/lib/site-info"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Telas da conta pedem login (e têm noindex); API e fotos de check-in são privadas.
        disallow: ["/api/", "/fotos/", "/conta", "/assinatura", "/onboarding", "/auth/"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
