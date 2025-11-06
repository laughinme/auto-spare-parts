import { useMemo, useState } from "react"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"

import { useCreateProduct } from "@/features/supplierProducts/useCreateProduct"
import type {
  CreateSupplierProductVariables,
  SupplierProductCreatePayload,
} from "@/entities/supplierProducts/model/types"
import type {
  OrgProductCondition,
  OrgProductOriginality,
  OrgProductStatus,
  OrgProductStockType,
} from "@/shared/api/org-products"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Textarea } from "@/shared/components/ui/textarea"
import { useVehicleMakes } from "@/entities/vehicle/model/useVehicleMakes"

type SupplierProductCreateDialogProps = {
  orgId: string
}

type FormState = {
  title: string
  description: string
  makeId: string
  partNumber: string
  price: string
  quantity: string
  stockType: OrgProductStockType
  condition: OrgProductCondition
  originality: OrgProductOriginality
  status: OrgProductStatus
  allowCart: boolean
  allowChat: boolean
}

const STOCK_TYPE_OPTIONS: Array<{ value: OrgProductStockType; label: string }> =
  [
    { value: "unique", label: "Уникальный товар" },
    { value: "stock", label: "Складской остаток" },
  ]

const CONDITION_OPTIONS: Array<{ value: OrgProductCondition; label: string }> =
  [
    { value: "new", label: "Новый" },
    { value: "used", label: "Б/у" },
  ]

const ORIGINALITY_OPTIONS: Array<{
  value: OrgProductOriginality
  label: string
}> = [
  { value: "oem", label: "Оригинал (OEM)" },
  { value: "aftermarket", label: "Аналог" },
]

const STATUS_OPTIONS: Array<{ value: OrgProductStatus; label: string }> = [
  { value: "draft", label: "Черновик" },
  { value: "published", label: "Опубликован" },
  { value: "archived", label: "Архив" },
]

const INITIAL_STATE: FormState = {
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
}

const MAKES_LIMIT = 50

export function SupplierProductCreateDialog({
  orgId,
}: SupplierProductCreateDialogProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>({ ...INITIAL_STATE })
  const [makeSearch, setMakeSearch] = useState("")

  const trimmedMakeSearch = makeSearch.trim()

  const {
    data: makes = [],
    isLoading: isLoadingMakes,
    isFetching: isFetchingMakes,
    isError: isErrorMakes,
  } = useVehicleMakes({
    limit: MAKES_LIMIT,
    search: trimmedMakeSearch === "" ? null : trimmedMakeSearch,
  })

  const createProductMutation = useCreateProduct()

  const canSubmit = useMemo(() => {
    if (createProductMutation.isPending) {
      return false
    }

    const title = form.title.trim()
    const partNumber = form.partNumber.trim()
    const makeId = Number(form.makeId)
    const price = Number(form.price)
    const quantity = Number(form.quantity)

    return (
      title.length > 0 &&
      partNumber.length > 0 &&
      Number.isFinite(makeId) &&
      makeId > 0 &&
      Number.isFinite(price) &&
      price >= 0 &&
      Number.isFinite(quantity) &&
      quantity >= 0
    )
  }, [form, createProductMutation.isPending])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      createProductMutation.reset()
    } else {
      resetForm()
    }
  }

  const resetForm = () => {
    setForm({ ...INITIAL_STATE })
    setMakeSearch("")
  }

  const updateField =
    <Key extends keyof FormState>(key: Key) =>
    (value: FormState[Key]) => {
      setForm((prev) => ({ ...prev, [key]: value }))
    }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const title = form.title.trim()
    const partNumber = form.partNumber.trim()
    const description = form.description.trim()
    const makeId = Number(form.makeId)
    const price = Number(form.price)
    const quantity = Number(form.quantity)

    if (!title) {
      toast.error("Введите название товара")
      return
    }

    if (!Number.isFinite(makeId) || makeId <= 0) {
      toast.error("Укажите марку (ID должен быть числом больше 0)")
      return
    }

    if (!partNumber) {
      toast.error("Введите артикул/номер детали")
      return
    }

    if (!Number.isFinite(price) || price < 0) {
      toast.error("Цена должна быть указана корректно")
      return
    }

    if (!Number.isFinite(quantity) || quantity < 0) {
      toast.error("Количество должно быть числом больше или равно 0")
      return
    }

    const payload: SupplierProductCreatePayload = {
      title,
      description: description === "" ? null : description,
      makeId,
      partNumber,
      price,
      stockType: form.stockType,
      quantityOnHand: quantity,
      condition: form.condition,
      originality: form.originality,
      status: form.status,
      allowCart: form.allowCart,
      allowChat: form.allowChat,
    }

    const variables: CreateSupplierProductVariables = {
      orgId,
      product: payload,
    }

    createProductMutation.mutate(variables, {
      onSuccess: () => {
        toast.success("Товар создан")
        handleOpenChange(false)
      },
      onError: () => {
        toast.error("Не удалось создать товар")
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary" size="sm">
          <Plus className="mr-2 size-4" aria-hidden />
          Создать товар
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Создание нового товара</DialogTitle>
          <DialogDescription>
            Заполните информацию о товаре. После сохранения позиция появится в
            списке ваших товаров.
          </DialogDescription>
        </DialogHeader>
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
                      (isLoadingMakes && makes.length === 0) ||
                      isErrorMakes
                    }
                  >
                    <SelectValue placeholder="Выберите марку" />
                  </SelectTrigger>
                  <SelectContent>
                    {makes.length === 0 && !isLoadingMakes ? (
                      <SelectItem value="__empty" disabled>
                        Марки не найдены
                      </SelectItem>
                    ) : (
                      makes.map((make) => (
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
                  onChange={(event) =>
                    updateField("price")(event.target.value)
                  }
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
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {createProductMutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              )}
              Создать
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
