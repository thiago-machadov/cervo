"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { SunDoodle } from "@/components/doodles"
import { GoalPicker } from "@/components/goal-picker"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { FieldError } from "@/components/ui/field"
import { saveGoal } from "@/app/actions/onboarding"
import { goalUnit, type GoalType } from "@/lib/goals"

export function EditGoalDrawer({ goalType, dailyGoal }: { goalType: string | null; dailyGoal: number | null }) {
  const [open, setOpen] = useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
      <DrawerTrigger
        render={
          <button type="button" className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left ring-1 ring-border/60" />
        }
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-secondary">
          <SunDoodle className="w-8" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-muted-foreground">Meta diária</span>
          <span className="block font-semibold">
            {dailyGoal ? `${dailyGoal} ${goalUnit(goalType, dailyGoal)} por dia` : "Definir meta"}
          </span>
        </span>
        <span className="text-sm font-semibold text-primary">{dailyGoal ? "Alterar" : "Definir"}</span>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Meta diária</DrawerTitle>
          </DrawerHeader>
          {open && <GoalForm goalType={goalType} dailyGoal={dailyGoal} onDone={() => setOpen(false)} />}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function GoalForm({ goalType, dailyGoal, onDone }: { goalType: string | null; dailyGoal: number | null; onDone: () => void }) {
  const [state, action, pending] = useActionState(saveGoal, undefined)

  useEffect(() => {
    if (state?.ok) {
      toast.success("Meta atualizada")
      onDone()
    }
  }, [state, onDone])

  return (
    <form action={action}>
      <div className="px-4">
        <GoalPicker defaultType={(goalType ?? "PAGES") as GoalType} defaultValue={dailyGoal} />
        {state?.error && <FieldError className="mt-4">{state.error}</FieldError>}
      </div>
      <DrawerFooter>
        <Button type="submit" size="lg" className="h-12" disabled={pending}>
          {pending ? "Salvando…" : "Salvar meta"}
        </Button>
      </DrawerFooter>
    </form>
  )
}
