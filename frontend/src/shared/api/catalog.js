import apiProtected from "./client.js";

export async function searchProducts({
  q,
  brand,
  condition,
  price_min,
  price_max,
  limit = 20,
  cursor
} = {}) {
  const response = await apiProtected.get("/products/catalog", {
    params: {
      q,
      brand,
      condition,
      price_min,
      price_max,
      limit,
      cursor
    }
  });
  return response.data;
}

export async function getProductsFeed({ limit = 20, cursor } = {}) {
  const response = await apiProtected.get("/products/feed", {
    params: {
      limit,
      cursor
    }
  });
  return response.data;
}

export async function getPublicProductDetails(productId) {
  const response = await apiProtected.get(`/products/${productId}`);
  return response.data;
}