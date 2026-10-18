"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GOAL_PRESETS, goalUnit, type GoalType } from "@/lib/goals"
import { cn } from "@/lib/utils"

/** Escolha de meta diária (unidade + valor). Envia `goalType` e `dailyGoal` no formulário. */
export function GoalPicker({ defaultType = "PAGES", defaultValue }: { defaultType?: GoalType; defaultValue?: number | null }) {
  const [type, setType] = useState<GoalType>(defaultType)
  const [value, setValue] = useState<number | null>(defaultValue ?? GOAL_PRESETS[defaultType][1]!)
  const presets = GOAL_PRESETS[type]
  const isCustom = value !== null && !presets.includes(value)

  return (
    <div className="space-y-6">
      <input type="hidden" name="goalType" value={type} />
      <input type="hidden" name="dailyGoal" value={value ?? ""} />

      <Tabs
        value={type}
        onValueChange={(next) => {
          const nextType = next as GoalType
          setType(nextType)
          setValue(GOAL_PRESETS[nextType][1]!)
        }}
      >
        <TabsList variant="pill" className="w-full">
          <TabsTrigger value="PAGES">Páginas</TabsTrigger>
          <TabsTrigger value="MINUTES">Minutos</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Meta diária">
        {presets.map((preset) => {
          const selected = value === preset
          return (
            <button
              key={preset}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setValue(preset)}
              className={cn(
                "flex flex-col items-center rounded-2xl bg-card py-4 ring-1 ring-border transition-all active:scale-[0.98]",
                selected && "bg-primary text-primary-foreground ring-primary"
              )}
            >
              <span className="font-display text-4xl font-bold">{preset}</span>
              <span className={cn("text-xs text-muted-foreground", selected && "text-primary-foreground/80")}>
                {goalUnit(type, preset)} por dia
              </span>
            </button>
          )
        })}
      </div>

      <label className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border has-focus-visible:ring-primary">
        <span className="text-sm font-medium">Outro valor</span>
        <Input
          type="number"
          inputMode="numeric"
          min={1}
          max={1000}
          placeholder="—"
          value={isCustom ? value : ""}
          onChange={(e) => setValue(e.target.value ? Number(e.target.value) : null)}
          className={cn("ml-auto h-10 w-24 text-right", isCustom && "border-primary")}
        />
        <span className="w-16 text-sm text-muted-foreground">{type === "PAGES" ? "págs." : "min"}/dia</span>
      </label>
    </div>
  )
}
