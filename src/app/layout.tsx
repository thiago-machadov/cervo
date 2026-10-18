import type { Metadata, Viewport } from "next"
import { Barlow_Condensed, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google"
import { CrayonDefs } from "@/components/doodles/crayon-defs"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
})

const display = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: { default: "Cervo", template: "%s · Cervo" },
  description: "Cervo: seu clube do livro com os amigos. Check-ins diários, metas e sequências de leitura.",
  applicationName: "Cervo",
  appleWebApp: { capable: true, title: "Cervo", statusBarStyle: "default" },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#eceae6",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${sans.variable} ${display.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-muted">
        <CrayonDefs />
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
