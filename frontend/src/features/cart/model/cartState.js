export const EMPTY_CART = {
  id: null,
  items: [],
  unique_items: 0,
  total_items: 0,
  total_amount: 0
};

export function normalizeCart(cartData) {
  if (!cartData) return { ...EMPTY_CART };
  const items = Array.isArray(cartData.items) ? cartData.items : [];
  const totalAmount = Number(cartData.total_amount ?? 0);
  const totalItems = Number(cartData.total_items ?? 0);
  const uniqueItems = Number(cartData.unique_items ?? 0);

  return {
    id: cartData.id ?? null,
    items,
    unique_items: Number.isNaN(uniqueItems) ? 0 : uniqueItems,
    total_items: Number.isNaN(totalItems) ? 0 : totalItems,
    total_amount: Number.isNaN(totalAmount) ? 0 : totalAmount
  };
}