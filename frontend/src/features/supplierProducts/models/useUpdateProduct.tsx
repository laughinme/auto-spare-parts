import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateOrgProduct } from "@/entities/supplierProducts/api"
import {
  toUpdateOrgProductBody,
  toSupplierProduct,
} from "@/entities/supplierProducts/model/adapters"
import type {
  SupplierProduct,
  UpdateSupplierProductVariables,
} from "@/entities/supplierProducts/model/types"

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation<SupplierProduct, unknown, UpdateSupplierProductVariables>({
    mutationFn: async ({ orgId, productId, product }) => {
      const payload = toUpdateOrgProductBody(product)
      const dto = await updateOrgProduct(
        { org_id: orgId, product_id: productId },
        payload,
      )

      return toSupplierProduct(dto)
    },
    onSuccess(_, { orgId, productId }) {
      queryClient.invalidateQueries({ queryKey: ["supplier-products"] })
      queryClient.invalidateQueries({
        queryKey: ["supplier-product-detail", { orgId, productId }],
      })
    },
  })
}
