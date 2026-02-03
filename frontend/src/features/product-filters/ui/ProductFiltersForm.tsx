import { useId } from "react"

import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
} from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { cn } from "@/shared/lib/utils"
import type { FilterState } from "../model/types"

type ProductFiltersFormProps = {
  state: FilterState
  onChange: (patch: Partial<FilterState>) => void
  onReset: () => void
  onApply: () => void
  disabled?: boolean
  isLoading?: boolean
  className?: string
}

type NullableOption<T> = T | "all"

const conditionOptions: { label: string; value: NullableOption<FilterState["condition"]> }[] =
  [
    { label: "Любое состояние", value: "all" },
    { label: "Новые", value: "new" },
    { label: "Б/У", value: "used" },
  ]

const originalityOptions: {
  label: string
  value: NullableOption<FilterState["originality"]>
}[] = [
  { label: "Любое происхождение", value: "all" },
  { label: "Оригинальные (OEM)", value: "oem" },
  { label: "Аналоги (Aftermarket)", value: "aftermarket" },
]

export function ProductFiltersForm({
  state,
  onChange,
  onReset,
  onApply,
  disabled = false,
  isLoading = false,
  className,
}: ProductFiltersFormProps) {
  const makeId = useId()
  const priceMinId = useId()
  const priceMaxId = useId()

  const conditionValue = state.condition ?? "all"
  const originalityValue = state.originality ?? "all"

  const handleSelectChange = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onChange({ [key]: value })
  }

  return (
    <Card className={cn("border bg-background/80 shadow-sm backdrop-blur", className)}>
      <CardContent className="flex justify-center px-4 py-3 sm:px-5 sm:py-4">
        <form
          className="flex w-full max-w-[20rem] flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            if (!disabled) {
              onApply()
            }
          }}
        >
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={makeId} className="text-xs text-muted-foreground">
                Бренд/Производитель
              </Label>
              <Input
                id={makeId}
                placeholder="ID производителя"
                inputMode="numeric"
                value={state.make_id ?? ""}
                onChange={(event) => {
                  const value = event.target.value
                  const numericValue = value === "" ? null : Number(value)
                  onChange({
                    make_id:
                      value === "" || Number.isNaN(numericValue)
                        ? null
                        : numericValue,
                  })
                }}
                disabled={disabled}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Состояние</Label>
              <Select
                value={conditionValue}
                onValueChange={(value) =>
                  handleSelectChange(
                    "condition",
                    value === "all" ? null : (value as FilterState["condition"])
                  )
                }
                disabled={disabled}
              >
                <SelectTrigger className="h-9 w-full justify-between text-sm">
                  <SelectValue placeholder="Состояние" />
                </SelectTrigger>
                <SelectContent>
                  {conditionOptions.map((option) => (
                    <SelectItem key={option.value ?? "all"} value={option.value ?? "all"}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Оригинальность</Label>
              <Select
                value={originalityValue}
                onValueChange={(value) =>
                  handleSelectChange(
                    "originality",
                    value === "all"
                      ? null
                      : (value as FilterState["originality"])
                  )
                }
                disabled={disabled}
              >
                <SelectTrigger className="h-9 w-full justify-between text-sm">
                  <SelectValue placeholder="Оригинальность" />
                </SelectTrigger>
                <SelectContent>
                  {originalityOptions.map((option) => (
                    <SelectItem key={option.value ?? "all"} value={option.value ?? "all"}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={priceMinId} className="text-xs text-muted-foreground">
                Цена от
              </Label>
              <Input
                id={priceMinId}
                placeholder="0"
                inputMode="numeric"
                value={state.price_min ?? ""}
                onChange={(event) => {
                  const value = event.target.value
                  onChange({ price_min: value })
                }}
                disabled={disabled}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={priceMaxId} className="text-xs text-muted-foreground">
                Цена до
              </Label>
              <Input
                id={priceMaxId}
                placeholder="100000"
                inputMode="numeric"
                value={state.price_max ?? ""}
                onChange={(event) => onChange({ price_max: event.target.value })}
                disabled={disabled}
                className="h-9 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={disabled || isLoading}
            >
              Сбросить
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={disabled || isLoading}
            >
              Применить
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
