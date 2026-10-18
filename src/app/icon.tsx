import { ImageResponse } from "next/og"
import { AppIconArt } from "./app-icon-art"

export function generateImageMetadata() {
  return [192, 512].map((size) => ({
    id: String(size),
    contentType: "image/png",
    size: { width: size, height: size },
  }))
}

export default async function Icon({ id }: { id: Promise<string | number> }) {
  const size = Number(await id)
  return new ImageResponse(<AppIconArt size={size} />, { width: size, height: size })
}
