/** Utilitários (só no navegador) para orientar a instalação do app (PWA). */

export type Platform = "ios" | "android" | "desktop"

export function detectPlatform(userAgent: string): Platform {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios"
  if (/Android/i.test(userAgent)) return "android"
  return "desktop"
}

/** No iPhone só o Safari consegue instalar (Chrome/Firefox para iOS não têm a opção). */
export function isIosNonSafari(userAgent: string) {
  return /iPhone|iPad|iPod/i.test(userAgent) && /CriOS|FxiOS|EdgiOS|OPiOS|Instagram|FBAN|FBAV/i.test(userAgent)
}

/** O app já está aberto como instalado (tela inicial)? */
export function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/** Evento do Chrome/Android que permite mostrar o "Instalar" nativo. */
export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}
