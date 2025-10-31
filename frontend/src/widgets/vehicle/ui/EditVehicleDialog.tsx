import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import type { Vehicle } from "@/entities/vehicle/model/types"
import { useVehicleMakes } from "@/entities/vehicle/model/useVehicleMakes"
import { useVehicleModels } from "@/entities/vehicle/model/useVehicleModel"
import { useVehicleYears } from "@/entities/vehicle/model/useVehicleYear"
import { useUpdateGarageVehicle } from "@/features/vehicle/useUpdateGarageVehicle"
import type { UpdateVehicleBody } from "@/shared/api/vehicles"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Textarea } from "@/shared/components/ui/textarea"

const DEFAULT_LIMIT = 50

type EditVehicleDialogProps = {
  vehicle: Vehicle | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditVehicleDialog({
  vehicle,
  open,
  onOpenChange,
}: EditVehicleDialogProps) {
  const [makeValue, setMakeValue] = useState<string | null>(null)
  const [modelValue, setModelValue] = useState<string | null>(null)
  const [yearValue, setYearValue] = useState<string | null>(null)
  const [vehicleTypeValue, setVehicleTypeValue] = useState<string>("")
  const [vin, setVin] = useState("")
  const [comment, setComment] = useState("")
  const [makeSearch, setMakeSearch] = useState("")
  const [modelSearch, setModelSearch] = useState("")

  const selectedMakeId = useMemo(
    () => (makeValue ? Number(makeValue) : null),
    [makeValue],
  )
  const selectedModelId = useMemo(
    () => (modelValue ? Number(modelValue) : null),
    [modelValue],
  )
  const selectedYear = useMemo(
    () => (yearValue ? Number(yearValue) : null),
    [yearValue],
  )

  const updateVehicleMutation = useUpdateGarageVehicle()

  const {
    data: makes = [],
    isLoading: isLoadingMakes,
    isFetching: isFetchingMakes,
    isError: isErrorMakes,
  } = useVehicleMakes({
    limit: DEFAULT_LIMIT,
    search: makeSearch.trim() === "" ? null : makeSearch.trim(),
  })

  const {
    data: models = [],
    isLoading: isLoadingModels,
    isFetching: isFetchingModels,
    isError: isErrorModels,
  } = useVehicleModels({
    limit: DEFAULT_LIMIT,
    search: modelSearch.trim() === "" ? null : modelSearch.trim(),
    make_id: selectedMakeId,
  })

  const {
    data: years = [],
    isLoading: isLoadingYears,
    isFetching: isFetchingYears,
    isError: isErrorYears,
  } = useVehicleYears({
    model_id: selectedModelId,
  })

  useEffect(() => {
    if (!open) {
      updateVehicleMutation.reset()
    }
  }, [open, updateVehicleMutation])

  useEffect(() => {
    if (!open || !vehicle) {
      return
    }

    setMakeValue(String(vehicle.make.makeId))
    setModelValue(String(vehicle.model.modelId))
    setYearValue(String(vehicle.year))
    setVehicleTypeValue(String(vehicle.vehicleType.vehicleTypeId))
    setVin(vehicle.vin ?? "")
    setComment(vehicle.comment ?? "")
    setMakeSearch("")
    setModelSearch("")
  }, [vehicle, open])

  const handleMakeChange = (value: string) => {
    setMakeValue(value)
    setModelValue(null)
    setYearValue(null)
  }

  const handleModelChange = (value: string) => {
    setModelValue(value)
    setYearValue(null)
  }

  const trimmedVin = vin.trim()
  const trimmedComment = comment.trim()

  const isVehicleTypeValid =
    vehicleTypeValue.trim() !== "" && Number.isFinite(Number(vehicleTypeValue))

  const payload = useMemo(() => {
    if (!vehicle) {
      return {}
    }

    const nextPayload: UpdateVehicleBody = {}

    if (
      selectedMakeId !== null &&
      selectedMakeId !== vehicle.make.makeId
    ) {
      nextPayload.make_id = selectedMakeId
    }

    if (
      selectedModelId !== null &&
      selectedModelId !== vehicle.model.modelId
    ) {
      nextPayload.model_id = selectedModelId
    }

    if (selectedYear !== null && selectedYear !== vehicle.year) {
      nextPayload.year = selectedYear
    }

    if (isVehicleTypeValid) {
      const nextVehicleTypeId = Number(vehicleTypeValue)
      if (nextVehicleTypeId !== vehicle.vehicleType.vehicleTypeId) {
        nextPayload.vehicle_type_id = nextVehicleTypeId
      }
    }

    if (trimmedVin !== vehicle.vin) {
      nextPayload.vin = trimmedVin
    }

    if (trimmedComment !== vehicle.comment) {
      nextPayload.comment = trimmedComment
    }

    return nextPayload
  }, [
    vehicle,
    selectedMakeId,
    selectedModelId,
    selectedYear,
    isVehicleTypeValid,
    vehicleTypeValue,
    trimmedVin,
    trimmedComment,
  ])

  const hasChanges = useMemo(
    () => Object.keys(payload).length > 0,
    [payload],
  )

  const canSubmit =
    Boolean(vehicle) &&
    isVehicleTypeValid &&
    hasChanges &&
    !updateVehicleMutation.isPending

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!vehicle || !canSubmit) {
      return
    }

    const nextVehicleTypeId = isVehicleTypeValid
      ? Number(vehicleTypeValue)
      : vehicle.vehicleType.vehicleTypeId

    const nextMakeName =
      (selectedMakeId !== null
        ? makes.find((make) => make.makeId === selectedMakeId)?.makeName
        : null) ?? vehicle.make.makeName

    const nextModelName =
      (selectedModelId !== null
        ? models.find((model) => model.modelId === selectedModelId)?.modelName
        : null) ?? vehicle.model.modelName

    const optimisticVehicle: Vehicle = {
      ...vehicle,
      make: {
        makeId: selectedMakeId ?? vehicle.make.makeId,
        makeName: nextMakeName,
      },
      model: {
        modelId: selectedModelId ?? vehicle.model.modelId,
        makeId: selectedMakeId ?? vehicle.make.makeId,
        modelName: nextModelName,
      },
      year: selectedYear ?? vehicle.year,
      vehicleType: {
        vehicleTypeId: nextVehicleTypeId,
        name:
          nextVehicleTypeId === vehicle.vehicleType.vehicleTypeId
            ? vehicle.vehicleType.name
            : `Тип #${nextVehicleTypeId}`,
      },
      vin: trimmedVin,
      comment: trimmedComment,
      updatedAt: new Date().toISOString(),
    }

    updateVehicleMutation.mutate(
      {
        vehicleId: vehicle.id,
        payload,
        optimisticVehicle,
      },
      {
        onSuccess: () => {
          toast.success("Данные автомобиля обновлены")
          onOpenChange(false)
        },
      },
    )
  }

  const handleDialogChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
  }

  const isMakesLoadingState = isLoadingMakes || isFetchingMakes
  const isModelsLoadingState = isLoadingModels || isFetchingModels
  const isYearsLoadingState = isLoadingYears || isFetchingYears

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Редактирование автомобиля</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="edit-make-search">Марка</Label>
              <Input
                id="edit-make-search"
                placeholder="Поиск по маркам"
                value={makeSearch}
                onChange={(event) => setMakeSearch(event.target.value)}
                autoComplete="off"
              />
              <Select
                value={makeValue ?? undefined}
                onValueChange={handleMakeChange}
              >
                <SelectTrigger
                  className="w-full"
                  disabled={isMakesLoadingState || isErrorMakes}
                >
                  <SelectValue placeholder="Выберите марку" />
                </SelectTrigger>
                <SelectContent align="start">
                  {makes.length === 0 ? (
                    <SelectItem value="__empty" disabled>
                      {isErrorMakes
                        ? "Не удалось загрузить марки"
                        : "Марки не найдены"}
                    </SelectItem>
                  ) : (
                    makes.map((make) => (
                      <SelectItem key={make.makeId} value={String(make.makeId)}>
                        {make.makeName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-model-search">Модель</Label>
              <Input
                id="edit-model-search"
                placeholder="Поиск по моделям"
                value={modelSearch}
                onChange={(event) => setModelSearch(event.target.value)}
                autoComplete="off"
                disabled={selectedMakeId === null}
              />
              <Select
                value={modelValue ?? undefined}
                onValueChange={handleModelChange}
              >
                <SelectTrigger
                  className="w-full"
                  disabled={
                    selectedMakeId === null ||
                    isModelsLoadingState ||
                    isErrorModels
                  }
                >
                  <SelectValue placeholder="Выберите модель" />
                </SelectTrigger>
                <SelectContent align="start">
                  {models.length === 0 ? (
                    <SelectItem value="__empty" disabled>
                      {selectedMakeId === null
                        ? "Сначала выберите марку"
                        : isErrorModels
                          ? "Не удалось загрузить модели"
                          : "Модели не найдены"}
                    </SelectItem>
                  ) : (
                    models.map((model) => (
                      <SelectItem key={model.modelId} value={String(model.modelId)}>
                        {model.modelName}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Год выпуска</Label>
              <Select
                value={yearValue ?? undefined}
                onValueChange={setYearValue}
              >
                <SelectTrigger
                  className="w-full"
                  disabled={
                    selectedModelId === null ||
                    isYearsLoadingState ||
                    isErrorYears
                  }
                >
                  <SelectValue placeholder="Выберите год" />
                </SelectTrigger>
                <SelectContent align="start">
                  {years.length === 0 ? (
                    <SelectItem value="__empty" disabled>
                      {selectedModelId === null
                        ? "Сначала выберите модель"
                        : isErrorYears
                          ? "Не удалось загрузить годы"
                          : "Годы не найдены"}
                    </SelectItem>
                  ) : (
                    years.map((yearOption) => (
                      <SelectItem key={yearOption} value={String(yearOption)}>
                        {yearOption}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-vehicle-type-id">Тип автомобиля (ID)</Label>
              <Input
                id="edit-vehicle-type-id"
                type="number"
                inputMode="numeric"
                min={1}
                value={vehicleTypeValue}
                onChange={(event) => setVehicleTypeValue(event.target.value)}
                placeholder="Например, 1"
              />
              <p className="text-xs text-muted-foreground">
                Используйте идентификатор типа из справочника.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-vehicle-vin">VIN (необязательно)</Label>
              <Input
                id="edit-vehicle-vin"
                value={vin}
                onChange={(event) => setVin(event.target.value)}
                placeholder="Например, XW8ZZZ1JZXW000001"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-vehicle-comment">Комментарий</Label>
              <Textarea
                id="edit-vehicle-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Добавьте заметки о состоянии автомобиля"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              Сохранить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
