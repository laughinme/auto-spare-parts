import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { useAddToGarage } from "@/features/vehicle/useAddToGarage";
import { useVehicleMakes } from "@/entities/vehicle/model/useVehicleMakes";
import { useVehicleModels } from "@/entities/vehicle/model/useVehicleModel";
import { useVehicleYears } from "@/entities/vehicle/model/useVehicleYear";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";

const DEFAULT_LIMIT = 50;

export function AddVehicleDialog() {
  const [open, setOpen] = useState(false);
  const [makeValue, setMakeValue] = useState<string | null>(null);
  const [modelValue, setModelValue] = useState<string | null>(null);
  const [yearValue, setYearValue] = useState<string | null>(null);
  const [vehicleTypeValue, setVehicleTypeValue] = useState<string>("");
  const [vin, setVin] = useState("");
  const [comment, setComment] = useState("");
  const [makeSearch, setMakeSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");

  const selectedMakeId = useMemo(
    () => (makeValue ? Number(makeValue) : null),
    [makeValue],
  );
  const selectedModelId = useMemo(
    () => (modelValue ? Number(modelValue) : null),
    [modelValue],
  );
  const selectedYear = useMemo(
    () => (yearValue ? Number(yearValue) : null),
    [yearValue],
  );

  const addVehicleMutation = useAddToGarage();

  const {
    data: makes = [],
    isLoading: isLoadingMakes,
    isFetching: isFetchingMakes,
    isError: isErrorMakes,
  } = useVehicleMakes({
    limit: DEFAULT_LIMIT,
    search: makeSearch.trim() === "" ? null : makeSearch.trim(),
  });

  const {
    data: models = [],
    isLoading: isLoadingModels,
    isFetching: isFetchingModels,
    isError: isErrorModels,
  } = useVehicleModels({
    limit: DEFAULT_LIMIT,
    search: modelSearch.trim() === "" ? null : modelSearch.trim(),
    make_id: selectedMakeId,
  });

  const {
    data: years = [],
    isLoading: isLoadingYears,
    isFetching: isFetchingYears,
    isError: isErrorYears,
  } = useVehicleYears({
    model_id: selectedModelId,
  });

  useEffect(() => {
    setModelValue(null);
    setModelSearch("");
    setYearValue(null);
  }, [makeValue]);

  useEffect(() => {
    setYearValue(null);
  }, [modelValue]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      addVehicleMutation.reset();
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setMakeValue(null);
    setModelValue(null);
    setYearValue(null);
    setVehicleTypeValue("");
    setVin("");
    setComment("");
    setMakeSearch("");
    setModelSearch("");
  };

  const isVehicleTypeValid =
    vehicleTypeValue.trim() !== "" && Number.isFinite(Number(vehicleTypeValue));

  const canSubmit =
    selectedMakeId !== null &&
    selectedModelId !== null &&
    selectedYear !== null &&
    isVehicleTypeValid &&
    !addVehicleMutation.isPending;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const payload = {
      make_id: selectedMakeId!,
      model_id: selectedModelId!,
      year: selectedYear!,
      vehicle_type_id: Number(vehicleTypeValue),
      vin: vin.trim() !== "" ? vin.trim() : undefined,
      comment: comment.trim() !== "" ? comment.trim() : undefined,
    };

    const makeName =
      makes.find((make) => make.makeId === selectedMakeId)?.makeName ?? "—";
    const modelName =
      models.find((model) => model.modelId === selectedModelId)?.modelName ?? "—";
    const vehicleTypeName =
      vehicleTypeValue.trim() !== ""
        ? `Тип #${vehicleTypeValue.trim()}`
        : undefined;

    addVehicleMutation.mutate(
      {
        payload,
        meta: {
          makeName,
          modelName,
          vehicleTypeName,
        },
      },
      {
        onSuccess: () => {
          toast.success("Автомобиль добавлен в гараж");
        },
      },
    );

    setOpen(false);
  };

  const isMakesLoadingState = isLoadingMakes || isFetchingMakes;
  const isModelsLoadingState = isLoadingModels || isFetchingModels;
  const isYearsLoadingState = isLoadingYears || isFetchingYears;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="mr-2 size-4" aria-hidden />
          Добавить авто
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Добавление автомобиля</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
          <div className="grid gap-5">
            <div className="space-y-2">
              <Label htmlFor="make-search">Марка</Label>
              <Input
                id="make-search"
                placeholder="Поиск по маркам"
                value={makeSearch}
                onChange={(event) => setMakeSearch(event.target.value)}
                autoComplete="off"
              />
              <Select
                value={makeValue ?? undefined}
                onValueChange={setMakeValue}
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
              <Label htmlFor="model-search">Модель</Label>
              <Input
                id="model-search"
                placeholder="Поиск по моделям"
                value={modelSearch}
                onChange={(event) => setModelSearch(event.target.value)}
                autoComplete="off"
                disabled={selectedMakeId === null}
              />
              <Select
                value={modelValue ?? undefined}
                onValueChange={setModelValue}
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
                    years.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle-type-id">Тип автомобиля (ID)</Label>
              <Input
                id="vehicle-type-id"
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
              <Label htmlFor="vehicle-vin">VIN (необязательно)</Label>
              <Input
                id="vehicle-vin"
                value={vin}
                onChange={(event) => setVin(event.target.value)}
                placeholder="Например, XW8ZZZ1JZXW000001"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle-comment">Комментарий</Label>
              <Textarea
                id="vehicle-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Добавьте заметки о состоянии автомобиля"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              Добавить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
