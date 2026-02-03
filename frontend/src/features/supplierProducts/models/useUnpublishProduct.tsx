import { useMutation, useQueryClient } from "@tanstack/react-query";

import { unpublishProduct } from "@/entities/supplierProducts/api";
import { toSupplierProduct } from "@/entities/supplierProducts/model/adapters";
import type {
  SupplierProduct,
  PublishProductVars,
} from "@/entities/supplierProducts/model/types";

export function useUnpublishProduct() {
  const queryClient = useQueryClient();

  return useMutation<SupplierProduct, unknown, PublishProductVars>({
    mutationFn: async ({ orgId, productId }) => {
      const dto = await unpublishProduct({
        org_id: orgId,
        product_id: productId,
      });
      return toSupplierProduct(dto);
    },
    onSuccess(_, { orgId, productId }) {
      queryClient.invalidateQueries({ queryKey: ["supplier-products"] });
      queryClient.invalidateQueries({
        queryKey: ["supplier-product-detail", { orgId, productId }],
      });
    },
  });
}
