import apiProtected from "./client.js";

export async function getCart({ includeLocked = false } = {}) {
  const params = {};
  if (includeLocked) {
    params.include_locked = true;
  }
  const response = await apiProtected.get("/cart/", { params });
  return response.data;
}

export async function getCartSummary() {
  const response = await apiProtected.get("/cart/summary");
  return response.data;
}

export async function addCartItem({ productId, quantity = 1 }) {
  const response = await apiProtected.post("/cart/items/", {
    product_id: productId,
    quantity
  });
  return response.data;
}

export async function updateCartItem({ itemId, quantity }) {
  const response = await apiProtected.put(`/cart/items/${itemId}`, {
    quantity
  });
  return response.data;
}

export async function removeCartItem(itemId) {
  const response = await apiProtected.delete(`/cart/items/${itemId}`);
  return response.data;
}

export async function clearCart() {
  const response = await apiProtected.delete("/cart/");
  return response.data;
}