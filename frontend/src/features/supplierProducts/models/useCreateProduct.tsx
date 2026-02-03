import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createOrgProduct } from "@/entities/supplierProducts/api"
import { toCreateOrgProductBody, toSupplierProduct } from "@/entities/supplierProducts/model/adapters"
import type {
  CreateSupplierProductVariables,
  SupplierProduct,
} from "@/entities/supplierProducts/model/types"

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation<SupplierProduct, unknown, CreateSupplierProductVariables>({
    mutationFn: async ({ orgId, product }) => {
      const body = toCreateOrgProductBody(product)
      const dto = await createOrgProduct(orgId, body)

      return toSupplierProduct(dto)
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["supplier-products"] })
    },
  })
}
