import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  type OrgProductCondition,
  type OrgProductOriginality,
  type OrgProductStatus,
  type OrgProductStockType,
} from "@/entities/supplierProducts/api";
import { useVehicleMakes } from "@/entities/vehicle/model/useVehicleMakes";
import type { SupplierProduct } from "@/entities/supplierProducts/model/types";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
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

export type SupplierProductFormValues = {
  title: string;
  description: string;
  makeId: string;
  partNumber: string;
  price: string;
  quantity: string;
  stockType: OrgProductStockType;
  condition: OrgProductCondition;
  originality: OrgProductOriginality;
  status: OrgProductStatus;
  allowCart: boolean;
  allowChat: boolean;
};

export type SupplierProductFormSubmitPayload = {
  title: string;
  description: string | null;
  makeId: number;
  partNumber: string;
  price: number;
  quantity: number;
  stockType: OrgProductStockType;
  condition: OrgProductCondition;
  originality: OrgProductOriginality;
  status: OrgProductStatus;
  allowCart: boolean;
  allowChat: boolean;
};

export const EMPTY_SUPPLIER_PRODUCT_FORM: SupplierProductFormValues = {
  title: "",
  description: "",
  makeId: "",
  partNumber: "",
  price: "",
  quantity: "",
  stockType: "unique",
  condition: "new",
  originality: "oem",
  status: "draft",
  allowCart: true,
  allowChat: true,
};

export const supplierProductToFormValues = (
  product: SupplierProduct,
): SupplierProductFormValues => ({
  title: product.title,
  description: product.description ?? "",
  makeId: product.make.id ? String(product.make.id) : "",
  partNumber: product.partNumber,
  price: product.price ? String(product.price) : "",
  quantity: Number.isFinite(product.quantityOnHand)
    ? String(product.quantityOnHand)
    : "",
  stockType: product.stockType,
  condition: product.condition,
  originality: product.originality,
  status: product.status,
  allowCart: product.allowCart,
  allowChat: product.allowChat,
});

type SupplierProductFormProps = {
  initialValues: SupplierProductFormValues;
  initialMakeName?: string;
  submitLabel: string;
  onSubmit: (payload: SupplierProductFormSubmitPayload) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  resetToken?: number;
  prefillMakeOption?: {
    makeId: number;
    makeName: string;
  } | null;
  requireChanges?: boolean;
};

const MAKES_LIMIT = 50;

const STOCK_TYPE_OPTIONS: Array<{ value: OrgProductStockType; label: string }> =
  [
    { value: "unique", label: "Уникальный товар" },
    { value: "stock", label: "Складской остаток" },
  ];

const CONDITION_OPTIONS: Array<{ value: OrgProductCondition; label: string }> =
  [
    { value: "new", label: "Новый" },
    { value: "used", label: "Б/у" },
  ];

const ORIGINALITY_OPTIONS: Array<{
  value: OrgProductOriginality;
  label: string;
}> = [
  { value: "oem", label: "Оригинал (OEM)" },
  { value: "aftermarket", label: "Аналог" },
];

const STATUS_OPTIONS: Array<{ value: OrgProductStatus; label: string }> = [
  { value: "draft", label: "Черновик" },
  { value: "published", label: "Опубликован" },
  { value: "archived", label: "Архив" },
];

export function SupplierProductForm({
  initialValues,
  initialMakeName = "",
  submitLabel,
  onSubmit,
  onCancel,
  isSubmitting = false,
  resetToken,
  prefillMakeOption = null,
  requireChanges = false,
}: SupplierProductFormProps) {
  const [form, setForm] = useState<SupplierProductFormValues>(initialValues);
  const [makeSearch, setMakeSearch] = useState(initialMakeName);

  useEffect(() => {
    setForm(initialValues);
    setMakeSearch(initialMakeName);
  }, [initialValues, initialMakeName, resetToken]);

  const trimmedMakeSearch = makeSearch.trim();

  const {
    data: makes = [],
    isLoading: isLoadingMakes,
    isFetching: isFetchingMakes,
    isError: isErrorMakes,
  } = useVehicleMakes({
    limit: MAKES_LIMIT,
    search: trimmedMakeSearch === "" ? null : trimmedMakeSearch,
  });

  const makeOptions = useMemo(() => {
    if (!prefillMakeOption) {
      return makes;
    }

    const exists = makes.some((make) => make.makeId === prefillMakeOption.makeId);
    if (exists) {
      return makes;
    }

    return [prefillMakeOption, ...makes];
  }, [makes, prefillMakeOption]);

  const hasChanges = useMemo(() => {
    if (!requireChanges) {
      return true;
    }

    const normalize = (value: string) => value.trim();

    return (
      normalize(form.title) !== normalize(initialValues.title) ||
      normalize(form.description) !== normalize(initialValues.description) ||
      form.makeId !== initialValues.makeId ||
      normalize(form.partNumber) !== normalize(initialValues.partNumber) ||
      Number(form.price) !== Number(initialValues.price) ||
      Number(form.quantity) !== Number(initialValues.quantity) ||
      form.stockType !== initialValues.stockType ||
      form.condition !== initialValues.condition ||
      form.originality !== initialValues.originality ||
      form.status !== initialValues.status ||
      form.allowCart !== initialValues.allowCart ||
      form.allowChat !== initialValues.allowChat
    );
  }, [form, initialValues, requireChanges]);

  const canSubmit = useMemo(() => {
    const title = form.title.trim();
    const partNumber = form.partNumber.trim();
    const makeId = Number(form.makeId);
    const price = Number(form.price);
    const quantity = Number(form.quantity);

    return (
      !isSubmitting &&
      title.length > 0 &&
      partNumber.length > 0 &&
      Number.isFinite(makeId) &&
      makeId > 0 &&
      Number.isFinite(price) &&
      price >= 0 &&
      Number.isFinite(quantity) &&
      quantity >= 0 &&
      hasChanges
    );
  }, [form, isSubmitting, hasChanges]);

  const updateField =
    <Key extends keyof SupplierProductFormValues>(key: Key) =>
    (value: SupplierProductFormValues[Key]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = form.title.trim();
    const partNumber = form.partNumber.trim();
    const description = form.description.trim();
    const makeId = Number(form.makeId);
    const price = Number(form.price);
    const quantity = Number(form.quantity);

    if (!title) {
      toast.error("Введите название товара");
      return;
    }

    if (!Number.isFinite(makeId) || makeId <= 0) {
      toast.error("Укажите марку (ID должен быть числом больше 0)");
      return;
    }

    if (!partNumber) {
      toast.error("Введите артикул/номер детали");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      toast.error("Цена должна быть указана корректно");
      return;
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
      toast.error("Количество должно быть числом больше или равно 0");
      return;
    }

    const payload: SupplierProductFormSubmitPayload = {
      title,
      description: description === "" ? null : description,
      makeId,
      partNumber,
      price,
      quantity,
      stockType: form.stockType,
      condition: form.condition,
      originality: form.originality,
      status: form.status,
      allowCart: form.allowCart,
      allowChat: form.allowChat,
    };

    onSubmit(payload);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-5">
        <div className="space-y-2">
          <Label htmlFor="supplier-product-title">Название</Label>
          <Input
            id="supplier-product-title"
            value={form.title}
            onChange={(event) => updateField("title")(event.target.value)}
            placeholder="Например, Бампер передний"
            required
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supplier-product-description">Описание</Label>
          <Textarea
            id="supplier-product-description"
            value={form.description}
            onChange={(event) =>
              updateField("description")(event.target.value)
            }
            placeholder="Укажите состояние, дефекты и другую важную информацию"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="supplier-product-make-search">Марка</Label>
            <Input
              id="supplier-product-make-search"
              value={makeSearch}
              onChange={(event) => setMakeSearch(event.target.value)}
              placeholder="Начните вводить название марки"
              autoComplete="off"
            />
            <Select
              value={form.makeId || undefined}
              onValueChange={(value) => updateField("makeId")(value)}
            >
              <SelectTrigger
                className="w-full"
                disabled={
                  (isLoadingMakes && makeOptions.length === 0) || isErrorMakes
                }
              >
                <SelectValue placeholder="Выберите марку" />
              </SelectTrigger>
              <SelectContent>
                {makeOptions.length === 0 && !isLoadingMakes ? (
                  <SelectItem value="__empty" disabled>
                    Марки не найдены
                  </SelectItem>
                ) : (
                  makeOptions.map((make) => (
                    <SelectItem
                      key={make.makeId}
                      value={String(make.makeId)}
                    >
                      {make.makeName}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {isLoadingMakes || isFetchingMakes
                ? "Загрузка марок…"
                : isErrorMakes
                  ? "Не удалось загрузить список марок."
                  : "Укажите марку производителя из справочника."}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier-product-part-number">
              Артикул / Part number
            </Label>
            <Input
              id="supplier-product-part-number"
              value={form.partNumber}
              onChange={(event) =>
                updateField("partNumber")(event.target.value)
              }
              placeholder="Например, 6Q0807221A"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier-product-price">Цена</Label>
            <Input
              id="supplier-product-price"
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(event) => updateField("price")(event.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier-product-quantity">Количество</Label>
            <Input
              id="supplier-product-quantity"
              type="number"
              min={0}
              step={1}
              value={form.quantity}
              onChange={(event) =>
                updateField("quantity")(event.target.value)
              }
              placeholder="0"
              required
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Тип</Label>
            <Select
              value={form.stockType}
              onValueChange={(value) =>
                updateField("stockType")(value as OrgProductStockType)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                {STOCK_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Состояние</Label>
            <Select
              value={form.condition}
              onValueChange={(value) =>
                updateField("condition")(value as OrgProductCondition)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите состояние" />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Оригинальность</Label>
            <Select
              value={form.originality}
              onValueChange={(value) =>
                updateField("originality")(value as OrgProductOriginality)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите оригинальность" />
              </SelectTrigger>
              <SelectContent>
                {ORIGINALITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Статус</Label>
            <Select
              value={form.status}
              onValueChange={(value) =>
                updateField("status")(value as OrgProductStatus)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
            <Checkbox
              id="supplier-product-allow-cart"
              checked={form.allowCart}
              onCheckedChange={(checked) =>
                updateField("allowCart")(checked === true)
              }
            />
            <Label
              htmlFor="supplier-product-allow-cart"
              className="flex-1 select-none text-sm font-medium"
            >
              Разрешить добавление в корзину
            </Label>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border px-3 py-2">
            <Checkbox
              id="supplier-product-allow-chat"
              checked={form.allowChat}
              onCheckedChange={(checked) =>
                updateField("allowChat")(checked === true)
              }
            />
            <Label
              htmlFor="supplier-product-allow-chat"
              className="flex-1 select-none text-sm font-medium"
            >
              Разрешить переписку
            </Label>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {isSubmitting && (
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
          )}
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
