import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { initials } from "@/lib/utils-text"

export function UserAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <Avatar className={className}>
      <AvatarFallback className={cn("bg-secondary font-semibold text-primary")}>{initials(name)}</AvatarFallback>
    </Avatar>
  )
}
