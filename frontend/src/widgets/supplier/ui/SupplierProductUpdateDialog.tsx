import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { useUpdateProduct } from "@/features/supplierProducts/models/useUpdateProduct";
import type {
  SupplierProduct,
  UpdateProductBody,
} from "@/entities/supplierProducts/model/types";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  SupplierProductForm,
  supplierProductToFormValues,
  type SupplierProductFormSubmitPayload,
} from "./SupplierProductForm";

type SupplierProductUpdateDialogProps = {
  orgId: string;
  product: SupplierProduct;
};

export function SupplierProductUpdateDialog({
  orgId,
  product,
}: SupplierProductUpdateDialogProps) {
  const [open, setOpen] = useState(false);
  const [resetToken, setResetToken] = useState(0);

  const updateProductMutation = useUpdateProduct();

  const initialValues = useMemo(
    () => supplierProductToFormValues(product),
    [product],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      updateProductMutation.reset();
      setResetToken((token) => token + 1);
    }
  };

  const handleSubmit = (values: SupplierProductFormSubmitPayload) => {
    const payload = buildUpdatePayload(values, product);

    if (Object.keys(payload).length === 0) {
      toast.info("Изменений нет");
      return;
    }

    updateProductMutation.mutate(
      { orgId, productId: product.id, product: payload },
      {
        onSuccess: () => {
          toast.success("Товар обновлён");
          handleOpenChange(false);
        },
        onError: (error) => {
          const message =
            error instanceof AxiosError
              ? error.response?.data?.message ?? "Не удалось обновить товар"
              : "Не удалось обновить товар";
          toast.error(message);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Pencil className="size-4" aria-hidden />
          edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Редактирование товара</DialogTitle>
          <DialogDescription>
            Обновите сведения о товаре и сохраните изменения.
          </DialogDescription>
        </DialogHeader>
        <SupplierProductForm
          initialValues={initialValues}
          initialMakeName={product.make.name}
          submitLabel="Сохранить"
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
          isSubmitting={updateProductMutation.isPending}
          resetToken={resetToken}
          prefillMakeOption={{
            makeId: product.make.id,
            makeName: product.make.name,
          }}
          requireChanges
        />
      </DialogContent>
    </Dialog>
  );
}

function buildUpdatePayload(
  values: SupplierProductFormSubmitPayload,
  product: SupplierProduct,
): UpdateProductBody {
  const payload: UpdateProductBody = {};

  if (values.title !== product.title) {
    payload.title = values.title;
  }

  const nextDescription = values.description ?? null;
  const currentDescription = product.description ?? null;
  if (nextDescription !== currentDescription) {
    payload.description = nextDescription;
  }

  if (values.makeId !== product.make.id) {
    payload.makeId = values.makeId;
  }

  if (values.partNumber !== product.partNumber) {
    payload.partNumber = values.partNumber;
  }

  if (values.price !== product.price) {
    payload.price = values.price;
  }

  if (values.stockType !== product.stockType) {
    payload.stockType = values.stockType;
  }

  if (values.quantity !== product.quantityOnHand) {
    payload.quantity = values.quantity;
  }

  if (values.condition !== product.condition) {
    payload.condition = values.condition;
  }

  if (values.originality !== product.originality) {
    payload.originality = values.originality;
  }

  if (values.status !== product.status) {
    payload.status = values.status;
  }

  if (values.allowCart !== product.allowCart) {
    payload.allowCart = values.allowCart;
  }

  if (values.allowChat !== product.allowChat) {
    payload.allowChat = values.allowChat;
  }

  return payload;
}
