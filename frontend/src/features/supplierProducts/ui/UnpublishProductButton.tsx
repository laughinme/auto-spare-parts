import type { ComponentProps } from "react";
import { Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import type { SupplierProduct } from "@/entities/supplierProducts/model/types";
import { useUnpublishProduct } from "../models/useUnpublishProduct";

type UnpublishProductButtonProps = {
  orgId: string;
  product: Pick<SupplierProduct, "id" | "status">;
} & Omit<ComponentProps<typeof Button>, "children" | "onClick">;

export function UnpublishProductButton({
  orgId,
  product,
  disabled,
  ...buttonProps
}: UnpublishProductButtonProps) {
  const unpublishMutation = useUnpublishProduct();
  const isPublished = product.status === "published";
  const isDisabled =
    Boolean(disabled) || unpublishMutation.isPending || !isPublished;

  const handleClick = () => {
    if (isDisabled) return;

    unpublishMutation.mutate(
      { orgId, productId: product.id },
      {
        onSuccess: () => {
          toast.success("Товар скрыт");
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, "Не удалось скрыть товар"));
        },
      },
    );
  };

  return (
    <Button
      {...buttonProps}
      type="button"
      disabled={isDisabled}
      onClick={handleClick}
    >
      {unpublishMutation.isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : null}
      unpublish
    </Button>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? fallback;
  }
  return fallback;
}
