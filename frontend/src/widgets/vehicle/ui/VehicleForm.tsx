import { useEffect, useMemo, useState } from "react";

import { useVehicleMakes } from "@/entities/vehicle/model/useVehicleMakes";
import { useVehicleModels } from "@/entities/vehicle/model/useVehicleModel";
import { useVehicleYears } from "@/entities/vehicle/model/useVehicleYear";
import type {
  Vehicle,
  VehicleMake,
  VehicleModel,
} from "@/entities/vehicle/model/types";
import { Button } from "@/shared/components/ui/button";
import {
  DialogFooter,
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

export type VehicleFormValues = {
  makeId: string | null;
  modelId: string | null;
  year: string | null;
  vehicleTypeId: string;
  vin: string;
  comment: string;
};

export type VehicleFormSubmitPayload = {
  makeId: number;
  modelId: number;
  year: number;
  vehicleTypeId: number;
  vin: string | null;
  comment: string | null;
  makeName: string;
  modelName: string;
};

export const EMPTY_VEHICLE_FORM: VehicleFormValues = {
  makeId: null,
  modelId: null,
  year: null,
  vehicleTypeId: "",
  vin: "",
  comment: "",
};

export const vehicleToFormValues = (vehicle: Vehicle): VehicleFormValues => ({
  makeId: String(vehicle.make.makeId),
  modelId: String(vehicle.model.modelId),
  year: String(vehicle.year),
  vehicleTypeId: String(vehicle.vehicleType.vehicleTypeId),
  vin: vehicle.vin?.trim() ?? "",
  comment: vehicle.comment?.trim() ?? "",
});

type VehicleFormProps = {
  initialValues: VehicleFormValues;
  submitLabel: string;
  onSubmit: (payload: VehicleFormSubmitPayload) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  resetToken?: number | string;
  requireChanges?: boolean;
  prefillMakeOption?: VehicleMake | null;
  prefillModelOption?: VehicleModel | null;
};

export function VehicleForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
  isSubmitting = false,
  resetToken,
  requireChanges = false,
  prefillMakeOption = null,
  prefillModelOption = null,
}: VehicleFormProps) {
  const [form, setForm] = useState<VehicleFormValues>(initialValues);
  const [makeSearch, setMakeSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");

  useEffect(() => {
    setForm(initialValues);
    setMakeSearch("");
    setModelSearch("");
  }, [initialValues, resetToken]);

  const selectedMakeId = useMemo(
    () => (form.makeId ? Number(form.makeId) : null),
    [form.makeId],
  );
  const selectedModelId = useMemo(
    () => (form.modelId ? Number(form.modelId) : null),
    [form.modelId],
  );
  const selectedYear = useMemo(
    () => (form.year ? Number(form.year) : null),
    [form.year],
  );

  const trimmedMakeSearch = makeSearch.trim();
  const trimmedModelSearch = modelSearch.trim();

  const {
    data: makes = [],
    isLoading: isLoadingMakes,
    isFetching: isFetchingMakes,
    isError: isErrorMakes,
  } = useVehicleMakes({
    limit: DEFAULT_LIMIT,
    search: trimmedMakeSearch === "" ? null : trimmedMakeSearch,
  });

  const {
    data: models = [],
    isLoading: isLoadingModels,
    isFetching: isFetchingModels,
    isError: isErrorModels,
  } = useVehicleModels({
    limit: DEFAULT_LIMIT,
    search: trimmedModelSearch === "" ? null : trimmedModelSearch,
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

  const makeOptions = useMemo(() => {
    if (!prefillMakeOption) {
      return makes;
    }
    const exists = makes.some(
      (make) => make.makeId === prefillMakeOption.makeId,
    );
    return exists ? makes : [prefillMakeOption, ...makes];
  }, [makes, prefillMakeOption]);

  const modelOptions = useMemo(() => {
    if (
      !prefillModelOption ||
      selectedMakeId === null ||
      prefillModelOption.makeId !== selectedMakeId
    ) {
      return models;
    }
    const exists = models.some(
      (model) => model.modelId === prefillModelOption.modelId,
    );
    return exists ? models : [prefillModelOption, ...models];
  }, [models, prefillModelOption, selectedMakeId]);

  const handleMakeChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      makeId: value,
      modelId: null,
      year: null,
    }));
  };

  const handleModelChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      modelId: value,
      year: null,
    }));
  };

  const updateField =
    <Key extends keyof VehicleFormValues>(key: Key) =>
    (value: VehicleFormValues[Key]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const trimmedVin = form.vin.trim();
  const trimmedComment = form.comment.trim();
  const isVehicleTypeValid =
    form.vehicleTypeId.trim() !== "" &&
    Number.isFinite(Number(form.vehicleTypeId));

  const hasChanges = useMemo(() => {
    if (!requireChanges) {
      return true;
    }

    return (
      form.makeId !== initialValues.makeId ||
      form.modelId !== initialValues.modelId ||
      form.year !== initialValues.year ||
      form.vehicleTypeId.trim() !== initialValues.vehicleTypeId.trim() ||
      trimmedVin !== initialValues.vin.trim() ||
      trimmedComment !== initialValues.comment.trim()
    );
  }, [
    form,
    initialValues,
    requireChanges,
    trimmedVin,
    trimmedComment,
  ]);

  const isMakesLoadingState = isLoadingMakes || isFetchingMakes;
  const isModelsLoadingState = isLoadingModels || isFetchingModels;
  const isYearsLoadingState = isLoadingYears || isFetchingYears;

  const canSubmit =
    selectedMakeId !== null &&
    selectedModelId !== null &&
    selectedYear !== null &&
    isVehicleTypeValid &&
    !isSubmitting &&
    hasChanges;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    const vehicleTypeId = Number(form.vehicleTypeId);
    const makeName =
      makeOptions.find((make) => make.makeId === selectedMakeId)?.makeName ??
      prefillMakeOption?.makeName ??
      "—";
    const modelName =
      modelOptions.find((model) => model.modelId === selectedModelId)
        ?.modelName ??
      (prefillModelOption?.makeId === selectedMakeId
        ? prefillModelOption?.modelName
        : undefined) ??
      "—";

    onSubmit({
      makeId: selectedMakeId,
      modelId: selectedModelId,
      year: selectedYear,
      vehicleTypeId,
      vin: trimmedVin === "" ? null : trimmedVin,
      comment: trimmedComment === "" ? null : trimmedComment,
      makeName,
      modelName,
    });
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-5">
        <div className="space-y-2">
          <Label htmlFor="vehicle-make-search">Марка</Label>
          <Input
            id="vehicle-make-search"
            placeholder="Поиск по маркам"
            value={makeSearch}
            onChange={(event) => setMakeSearch(event.target.value)}
            autoComplete="off"
          />
          <Select
            value={form.makeId ?? undefined}
            onValueChange={handleMakeChange}
          >
            <SelectTrigger
              className="w-full"
              disabled={isMakesLoadingState || isErrorMakes}
            >
              <SelectValue placeholder="Выберите марку" />
            </SelectTrigger>
            <SelectContent align="start">
              {makeOptions.length === 0 ? (
                <SelectItem value="__empty" disabled>
                  {isErrorMakes
                    ? "Не удалось загрузить марки"
                    : "Марки не найдены"}
                </SelectItem>
              ) : (
                makeOptions.map((make) => (
                  <SelectItem key={make.makeId} value={String(make.makeId)}>
                    {make.makeName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicle-model-search">Модель</Label>
          <Input
            id="vehicle-model-search"
            placeholder="Поиск по моделям"
            value={modelSearch}
            onChange={(event) => setModelSearch(event.target.value)}
            autoComplete="off"
            disabled={selectedMakeId === null}
          />
          <Select
            value={form.modelId ?? undefined}
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
              {modelOptions.length === 0 ? (
                <SelectItem value="__empty" disabled>
                  {selectedMakeId === null
                    ? "Сначала выберите марку"
                    : isErrorModels
                      ? "Не удалось загрузить модели"
                      : "Модели не найдены"}
                </SelectItem>
              ) : (
                modelOptions.map((model) => (
                  <SelectItem
                    key={model.modelId}
                    value={String(model.modelId)}
                  >
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
            value={form.year ?? undefined}
            onValueChange={updateField("year")}
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
          <Label htmlFor="vehicle-type-id">Тип автомобиля (ID)</Label>
          <Input
            id="vehicle-type-id"
            type="number"
            inputMode="numeric"
            min={1}
            value={form.vehicleTypeId}
            onChange={(event) => updateField("vehicleTypeId")(event.target.value)}
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
            value={form.vin}
            onChange={(event) => updateField("vin")(event.target.value)}
            placeholder="Например, XW8ZZZ1JZXW000001"
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicle-comment">Комментарий</Label>
          <Textarea
            id="vehicle-comment"
            value={form.comment}
            onChange={(event) => updateField("comment")(event.target.value)}
            placeholder="Добавьте заметки о состоянии автомобиля"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
