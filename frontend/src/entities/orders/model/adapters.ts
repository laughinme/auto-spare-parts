import type {
  OrderDto,
  OrderItemDto,
  OrderProductDto,
  OrderSellerOrganizationDto,
  OrdersListResponseDto,
} from "@/shared/api/orders";

import type {
  BuyerOrder,
  BuyerOrderItem,
  BuyerOrderProduct,
  BuyerOrderProductMake,
  BuyerOrderProductMedia,
  BuyerOrderProductOrganization,
  BuyerOrderSellerOrganization,
  BuyerOrdersList,
} from "./types";

const toNumber = (value: number | string | null | undefined): number => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const toBuyerOrderProductMedia = (
  dto: OrderProductDto["media"][number]
): BuyerOrderProductMedia => ({
  id: dto.id,
  url: dto.url,
  alt: dto.alt,
});

const toBuyerOrderProductMake = (
  dto: OrderProductDto["make"] | null
): BuyerOrderProductMake | null => {
  if (!dto) {
    return null;
  }

  return {
    id: dto.make_id,
    name: dto.make_name,
  };
};

const toBuyerOrderProductOrganization = (
  dto: OrderProductDto["organization"]
): BuyerOrderProductOrganization => ({
  id: dto.id,
  name: dto.name,
  country: dto.country,
  address: dto.address,
});

const toBuyerOrderProduct = (dto: OrderProductDto | null): BuyerOrderProduct | null => {
  if (!dto) {
    return null;
  }

  return {
    id: dto.id,
    title: dto.title,
    description: dto.description,
    make: toBuyerOrderProductMake(dto.make),
    partNumber: dto.part_number,
    price: toNumber(dto.price),
    stockType: dto.stock_type,
    quantityOnHand: dto.quantity_on_hand,
    condition: dto.condition,
    originality: dto.originality,
    allowCart: dto.allow_cart,
    allowChat: dto.allow_chat,
    status: dto.status,
    isInStock: dto.is_in_stock,
    isBuyable: dto.is_buyable,
    media: dto.media.map(toBuyerOrderProductMedia),
    organization: toBuyerOrderProductOrganization(dto.organization),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

const toBuyerOrderSellerOrganization = (
  dto: OrderSellerOrganizationDto | null
): BuyerOrderSellerOrganization | null => {
  if (!dto) {
    return null;
  }

  return {
    id: dto.id,
    name: dto.name,
    country: dto.country,
    address: dto.address,
  };
};

const toBuyerOrderItem = (dto: OrderItemDto): BuyerOrderItem => ({
  id: dto.id,
  quantity: dto.quantity,
  status: dto.status,
  unitPrice: toNumber(dto.unit_price),
  totalPrice: toNumber(dto.total_price),
  productSnapshot: {
    title: dto.product_title,
    description: dto.product_description,
    makeId: dto.product_make_id,
    makeName: dto.product_make_name,
    partNumber: dto.product_part_number,
    condition: dto.product_condition,
  },
  product: toBuyerOrderProduct(dto.product),
  sellerOrganization: toBuyerOrderSellerOrganization(dto.seller_organization),
  carrierCode: dto.carrier_code,
  trackingNumber: dto.tracking_number,
  trackingUrl: dto.tracking_url,
  shippedAt: dto.shipped_at,
  deliveredAt: dto.delivered_at,
});

const toBuyerOrder = (dto: OrderDto): BuyerOrder => ({
  id: dto.id,
  buyerId: dto.buyer_id,
  paymentStatus: dto.payment_status,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at,
  totalAmount: toNumber(dto.total_amount),
  totalItems: dto.total_items,
  uniqueItems: dto.unique_items,
  orderProgress: dto.order_progress,
  notes: dto.notes,
  shippingAddress: dto.shipping_address,
  shippedItems: dto.shipped_items,
  deliveredItems: dto.delivered_items,
  items: dto.items.map(toBuyerOrderItem),
});

export const toBuyerOrdersList = (dto: OrdersListResponseDto): BuyerOrdersList => ({
  items: dto.items.map(toBuyerOrder),
  nextCursor: dto.next_cursor,
});
