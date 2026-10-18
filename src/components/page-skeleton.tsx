import { SpiralDoodle } from "@/components/doodles"
import { Skeleton } from "@/components/ui/skeleton"

export function PageSkeleton() {
  return (
    <div className="relative space-y-4 p-4" aria-busy="true" aria-label="Carregando">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
      <SpiralDoodle className="absolute top-36 left-1/2 w-14 -translate-x-1/2 animate-spin opacity-60 [animation-duration:2.4s]" />
    </div>
  )
}
