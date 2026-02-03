import type { ComponentProps } from "react";
import { Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";
import type { SupplierProduct } from "@/entities/supplierProducts/model/types";
import { usePublishProduct } from "../models/usePublishProduct";

type PublishProductButtonProps = {
  orgId: string;
  product: Pick<SupplierProduct, "id" | "status">;
} & Omit<ComponentProps<typeof Button>, "children" | "onClick">;

export function PublishProductButton({
  orgId,
  product,
  disabled,
  ...buttonProps
}: PublishProductButtonProps) {
  const publishMutation = usePublishProduct();
  const isPublished = product.status === "published";
  const isDisabled = Boolean(disabled) || publishMutation.isPending || isPublished;

  const handleClick = () => {
    if (isDisabled) return;

    publishMutation.mutate(
      { orgId, productId: product.id },
      {
        onSuccess: () => {
          toast.success("Товар опубликован");
        },
        onError: (error) => {
          toast.error(getErrorMessage(error, "Не удалось опубликовать товар"));
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
      {publishMutation.isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : null}
      publish
    </Button>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? fallback;
  }
  return fallback;
}
