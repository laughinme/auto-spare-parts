import { useQuery } from "@tanstack/react-query";

import {
  getOrgProducts,
  type OrgProductStatus,
  type OrgProductDto,
  type PageDto,
} from "@/entities/supplierProducts/api";

import { toSupplierProductsPage } from "./adapters";
import type { SupplierProductsPage } from "./types";

export type UseSupplierProductsParams = {
  orgId: string;
  limit?: number;
  offset?: number;
  status?: OrgProductStatus;
  q?: string | null;
};

export function useSupplierProducts({
  orgId,
  limit = 20,
  offset = 0,
  status,
  q,
}: UseSupplierProductsParams) {
  const enabled = Boolean(orgId);

  return useQuery<PageDto<OrgProductDto>, unknown, SupplierProductsPage>({
    queryKey: ["supplier-products", { orgId, limit, offset, status, q }],
    queryFn: () =>
      getOrgProducts({
        org_id: orgId,
        limit,
        offset,
        status,
        q: q ?? undefined,
      }),
    enabled,
    select: toSupplierProductsPage,
    staleTime: 60_000,
  });
}
