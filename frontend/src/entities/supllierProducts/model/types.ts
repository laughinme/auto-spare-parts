import type {
  OrgProductCondition,
  OrgProductOriginality,
  OrgProductStatus,
  OrgProductStockType,
} from "@/shared/api/org-products";

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
