import type { OrgProductDto, PageDto } from "@/shared/api/org-products";

import type {
  SupplierProduct,
  SupplierProductMake,
  SupplierProductMedia,
  SupplierProductOrganization,
  SupplierProductsPage,
} from "./types";

const toSupplierProductMedia = (dto: OrgProductDto["media"][number]): SupplierProductMedia => ({
  id: dto.id,
  url: dto.url,
  alt: dto.alt,
});

const toSupplierProductMake = (dto: OrgProductDto["make"]): SupplierProductMake => ({
  id: dto.make_id,
  name: dto.make_name,
});

const toSupplierProductOrganization = (
  dto: OrgProductDto["organization"],
): SupplierProductOrganization => ({
  id: dto.id,
  name: dto.name,
  country: dto.country,
  address: dto.address,
});

export const toSupplierProduct = (dto: OrgProductDto): SupplierProduct => ({
  id: dto.id,
  title: dto.title,
  description: dto.description,
  make: toSupplierProductMake(dto.make),
  partNumber: dto.part_number,
  price: dto.price,
  stockType: dto.stock_type,
  quantityOnHand: dto.quantity_on_hand,
  condition: dto.condition,
  originality: dto.originality,
  allowCart: dto.allow_cart,
  allowChat: dto.allow_chat,
  status: dto.status,
  media: dto.media.map(toSupplierProductMedia),
  organization: toSupplierProductOrganization(dto.organization),
  createdAt: dto.created_at,
  updatedAt: dto.updated_at,
});

export const toSupplierProductsPage = (
  page: PageDto<OrgProductDto>,
): SupplierProductsPage => ({
  items: page.items.map(toSupplierProduct),
  offset: page.offset,
  limit: page.limit,
  total: page.total,
});
