import type { Metadata, Viewport } from "next"
import { Geist_Mono, Noto_Sans, Roboto_Slab } from "next/font/google"
import { CrayonDefs } from "@/components/doodles/crayon-defs"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
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
  title: { default: "Cervo", template: "%s · Cervo" },
  description: "Cervo: seu clube do livro com os amigos. Check-ins diários, metas e sequências de leitura.",
  applicationName: "Cervo",
  appleWebApp: { capable: true, title: "Cervo", statusBarStyle: "default" },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eceae6" },
    { media: "(prefers-color-scheme: dark)", color: "#151a2b" },
  ],
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: o next-themes ajusta a classe do <html> antes da hidratação.
    <html lang="pt-BR" suppressHydrationWarning className={`${sans.variable} ${display.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-background">
        <ThemeProvider>
          <CrayonDefs />
          {children}
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}
