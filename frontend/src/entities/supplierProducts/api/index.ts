import apiProtected from "@/shared/api/axiosInstance";

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

export type CreateOrgProductBody = {
  title: string;
  description: string | null;
  make_id: number;
  part_number: string;
  price: number;
  stock_type: OrgProductStockType;
  quantity: number;
  condition: OrgProductCondition;
  originality: OrgProductOriginality;
  status: OrgProductStatus;
  allow_cart: boolean;
  allow_chat: boolean;
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
  const encodedOrgId = encodeURIComponent(org_id);
  const response = await apiProtected.get<PageDto<OrgProductDto>>(
    `/organizations/${encodedOrgId}/products/`,
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

export async function createOrgProduct(org_id: string, payload: CreateOrgProductBody) {
  const encodedOrgId = encodeURIComponent(org_id);
  const response = await apiProtected.post<OrgProductDto>(
    `/organizations/${encodedOrgId}/products/`,
    payload,
  );

  return response.data;
}

export type ProductDetailParams = { 
  org_id: string; 
  product_id: string
 }

export async function getOrgProductDetail({ org_id, product_id }: ProductDetailParams) {
  const encodedOrgId = encodeURIComponent(org_id);
  const response = await apiProtected.get<OrgProductDto>(
    `/organizations/${encodedOrgId}/products/${product_id}/`,
  );
  return response.data;
}

export type UpdateProductBodyDto = {
  title?: string;
  description?: string | null;
  make_id?: number;
  part_number?: string;
  price?: number;
  stock_type?: OrgProductStockType;
  quantity?: number;
  condition?: OrgProductCondition;
  originality?: OrgProductOriginality;
  status?: OrgProductStatus;
  allow_cart?: boolean;
  allow_chat?: boolean;
}

export async function updateOrgProduct({ org_id, product_id }: ProductDetailParams, payload: UpdateProductBodyDto) {
  const encodedOrgId = encodeURIComponent(org_id);
  const response = await apiProtected.patch<OrgProductDto>(
    `/organizations/${encodedOrgId}/products/${product_id}/`,
    payload,
  );
  return response.data;
}

export type PublishProductParams = { 
  org_id: string; 
  product_id: string
 }

export async function publishProduct ({ org_id, product_id }: PublishProductParams) {
  const encodedOrgId = encodeURIComponent(org_id);
  const response = await apiProtected.post<OrgProductDto>(
    `/organizations/${encodedOrgId}/products/${product_id}/publish`,
  );
  return response.data;
  
} 

export async function unpublishProduct ({ org_id, product_id }: PublishProductParams) {
  const encodedOrgId = encodeURIComponent(org_id);
  const response = await apiProtected.post<OrgProductDto>(
    `/organizations/${encodedOrgId}/products/${product_id}/unpublish`,
  );
  return response.data;
  
} 
