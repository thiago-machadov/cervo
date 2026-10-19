"use client"

import { useActionState, useEffect, useRef } from "react"
import { PaperPlaneRightIcon } from "@phosphor-icons/react/dist/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addComment } from "@/app/actions/checkins"

export function CommentForm({ checkInId }: { checkInId: string }) {
  const [state, action, pending] = useActionState(addComment, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.ok) formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={action} className="space-y-1">
      <input type="hidden" name="checkInId" value={checkInId} />
      <div className="flex gap-2">
        <Input
          name="body"
          aria-label="Comentário"
          placeholder="Escreva um comentário…"
          required
          maxLength={1000}
          autoComplete="off"
          enterKeyHint="send"
          className="h-11"
        />
        <Button type="submit" size="icon-lg" className="size-11" disabled={pending}>
          <PaperPlaneRightIcon />
          <span className="sr-only">Enviar</span>
        </Button>
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
    </form>
  )
}
