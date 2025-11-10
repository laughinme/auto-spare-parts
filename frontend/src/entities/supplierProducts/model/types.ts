import type {
  OrgProductCondition,
  OrgProductOriginality,
  OrgProductStatus,
  OrgProductStockType,
} from "@/shared/api/org-products";

export type SupplierProductCreatePayload = {
  title: string;
  description?: string | null;
  makeId: number;
  partNumber: string;
  price: number;
  stockType: OrgProductStockType;
  quantityOnHand: number;
  condition: OrgProductCondition;
  originality: OrgProductOriginality;
  status: OrgProductStatus;
  allowCart: boolean;
  allowChat: boolean;
};

export type CreateSupplierProductVariables = {
  orgId: string;
  product: SupplierProductCreatePayload;
};

export type SupplierProductMedia = {
  id: string;
  url: string;
  alt: string | null;
};

export type SupplierProductMake = {
  id: number;
  name: string;
};

export type SupplierProductOrganization = {
  id: string;
  name: string;
  country: string;
  address: string | null;
};

export type SupplierProduct = {
  id: string;
  title: string;
  description: string | null;
  make: SupplierProductMake;
  partNumber: string;
  price: number;
  stockType: OrgProductStockType;
  quantityOnHand: number;
  condition: OrgProductCondition;
  originality: OrgProductOriginality;
  allowCart: boolean;
  allowChat: boolean;
  status: OrgProductStatus;
  media: SupplierProductMedia[];
  organization: SupplierProductOrganization;
  createdAt: string;
  updatedAt: string | null;
};

export type SupplierProductsPage = {
  items: SupplierProduct[];
  offset: number;
  limit: number;
  total: number;
};

export type UpdateProductBody = {
  title?: string;
  description?: string | null;
  makeId?: number;
  partNumber?: string;
  price?: number;
  stockType?: OrgProductStockType;
  quantity?: number;
  condition?: OrgProductCondition;
  originality?: OrgProductOriginality;
  status?: OrgProductStatus;
  allowCart?: boolean;
  allowChat?: boolean;
};

export type UpdateSupplierProductVariables = {
  orgId: string;
  productId: string;
  product: UpdateProductBody;
};

export type PublishProductVars = {
  orgId: string;
  productId: string;
}