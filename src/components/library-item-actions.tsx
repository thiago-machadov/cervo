"use client"

import { useTransition } from "react"
import { TrashIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { removeFromLibrary, setLibraryStatus } from "@/app/actions/library"
import { STATUS_LABEL } from "@/lib/utils-text"

type Status = "WANT" | "READING" | "DONE"

export function LibraryStatusTabs({ itemId, status }: { itemId: string; status: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <Tabs
      value={status}
      onValueChange={(value) => startTransition(() => setLibraryStatus(itemId, value as Status))}
    >
      <TabsList variant="pill" className="w-full" aria-busy={pending}>
        {(Object.keys(STATUS_LABEL) as Status[]).map((key) => (
          <TabsTrigger key={key} value={key} disabled={pending}>
            {STATUS_LABEL[key]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

export function RemoveFromLibraryButton({ itemId }: { itemId: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <Button
      variant="destructive"
      className="w-full"
      disabled={pending}
      onClick={() => {
        if (confirm("Remover este livro da sua biblioteca?")) startTransition(() => removeFromLibrary(itemId))
      }}
    >
      <TrashIcon /> Remover da biblioteca
    </Button>
  )
}
