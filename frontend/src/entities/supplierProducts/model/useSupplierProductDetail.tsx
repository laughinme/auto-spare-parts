import { useQuery } from "@tanstack/react-query";

import {
  getOrgProductDetail,
  type OrgProductDto,
} from "@/entities/supplierProducts/api";

import { toSupplierProduct } from "./adapters";
import type { SupplierProduct } from "./types";

export type SupplierProductDetailParams = {
    orgId: string;
    productId: string;
};

export function useSupplierProductDetail({ orgId, productId }: SupplierProductDetailParams) {
  const enabled = Boolean(orgId && productId);

 return useQuery<OrgProductDto, unknown, SupplierProduct>({
    queryKey: ["supplier-product-detail", { orgId, productId }],
    queryFn: () => getOrgProductDetail({ org_id: orgId, product_id: productId }),
    enabled,
    select: toSupplierProduct,
    staleTime: 60_000,
});
}