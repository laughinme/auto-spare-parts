import { useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { useCreateProduct } from "@/features/supplierProducts/useCreateProduct"
import type {
  CreateSupplierProductVariables,
  SupplierProductCreatePayload,
} from "@/entities/supplierProducts/model/types"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog"
import {
  SupplierProductForm,
  EMPTY_SUPPLIER_PRODUCT_FORM,
  type SupplierProductFormSubmitPayload,
} from "./SupplierProductForm"

type SupplierProductCreateDialogProps = {
  orgId: string
}

export function SupplierProductCreateDialog({
  orgId,
}: SupplierProductCreateDialogProps) {
  const [open, setOpen] = useState(false)
  const [resetToken, setResetToken] = useState(0)

  const createProductMutation = useCreateProduct()

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      createProductMutation.reset()
      setResetToken((token) => token + 1)
    }
  }

  const handleSubmit = (values: SupplierProductFormSubmitPayload) => {
    const payload: SupplierProductCreatePayload = {
      title: values.title,
      description: values.description,
      makeId: values.makeId,
      partNumber: values.partNumber,
      price: values.price,
      stockType: values.stockType,
      quantityOnHand: values.quantity,
      condition: values.condition,
      originality: values.originality,
      status: values.status,
      allowCart: values.allowCart,
      allowChat: values.allowChat,
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
        <SupplierProductForm
          initialValues={EMPTY_SUPPLIER_PRODUCT_FORM}
          initialMakeName=""
          submitLabel="Создать"
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
          isSubmitting={createProductMutation.isPending}
          resetToken={resetToken}
        />
      </DialogContent>
    </Dialog>
  )
}
