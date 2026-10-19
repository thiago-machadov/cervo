import type { Metadata, Viewport } from "next"
import { Geist_Mono, Noto_Sans, Roboto_Slab } from "next/font/google"
import { CrayonDefs } from "@/components/doodles/crayon-defs"
import { Toaster } from "@/components/ui/sonner"
import { SITE } from "@/lib/site-info"
import "./globals.css"

const sans = Noto_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
})

const display = Roboto_Slab({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: "%s · Cervo" },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ["clube do livro", "app de leitura", "hábito de leitura", "meta de leitura", "check-in de leitura", "sequência de leitura", "ler mais"],
  appleWebApp: { capable: true, title: SITE.name, statusBarStyle: "default" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
  },
  twitter: { card: "summary_large_image", title: SITE.title, description: SITE.description },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#eceae6",
  // O app tem só o tema claro: avisa o navegador para não aplicar o modo escuro nos controles nativos.
  colorScheme: "light",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${display.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-background">
        <CrayonDefs />
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
