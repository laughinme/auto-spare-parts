import apiProtected from "./axiosInstance";

export type OrgProductStatus = "draft" | "published" | "archived";
export type OrgProductStockType = "unique" | "stock";
export type OrgProductCondition = "new" | "used";
export type OrgProductOriginality = "oem" | "aftermarket";

export type OrgProductParams = {
  org_id: string;
  limit?: number;
  offset?: number;
  status?: OrgProductStatus;
  q?: string;
};

export type OrgProductMediaDto = {
  id: string;
  url: string;
  alt: string | null;
};

export type OrgProductMakeDto = {
  make_id: number;
  make_name: string;
};

export type OrgProductOrganizationDto = {
  id: string;
  name: string;
  country: string;
  address: string | null;
};

export type OrgProductDto = {
  id: string;
  title: string;
  description: string | null;
  make: OrgProductMakeDto;
  part_number: string;
  price: number;
  stock_type: OrgProductStockType;
  quantity_on_hand: number;
  condition: OrgProductCondition;
  originality: OrgProductOriginality;
  allow_cart: boolean;
  allow_chat: boolean;
  status: OrgProductStatus;
  media: OrgProductMediaDto[];
  organization: OrgProductOrganizationDto;
  created_at: string;
  updated_at: string | null;
};

export type PageDto<T> = {
  items: T[];
  offset: number;
  limit: number;
  total: number;
};

export async function getOrgProducts({
  org_id,
  limit = 20,
  offset = 0,
  status,
  q,
}: OrgProductParams) {
  const response = await apiProtected.get<PageDto<OrgProductDto>>(
    `/organizations/${org_id}/products/`,
    {
      params: {
        limit,
        offset,
        status,
        q,
      },
    },
  );

  return response.data;
}
