import apiProtected, { apiPublic } from './axiosInstance.js';

/* ==================== ORGANIZATION PRODUCTS ==================== */

export async function createProduct({ productData, orgId }) {
  const url = `/organizations/${orgId}/products/`;
  const response = await apiProtected.post(url, productData);
  return response.data;
}

export async function getProducts({ orgId, query, limit = 20, offset = 0 }) {
  const response = await apiProtected.get(`/organizations/${orgId}/products/`, {
    params: { q: query, limit, offset },
  });
  return response.data;
}

export async function getDetailsProducts({ orgId, productId }) {
  if (!orgId || !productId) {
    throw new Error("Organization ID and Product ID are required");
  }
  const response = await apiProtected.get(`/organizations/${orgId}/products/${productId}/`);
  return response.data;
}

export async function updateProduct({ orgId, productId, productData }) {
  const response = await apiProtected.patch(`/organizations/${orgId}/products/${productId}/`, productData);
  return response.data;
}

export async function deleteProduct({ orgId, productId }) {
  await apiProtected.delete(`/organizations/${orgId}/products/${productId}/`);
}

export async function publishProduct({ orgId, productId }) {
  const response = await apiProtected.post(`/organizations/${orgId}/products/${productId}/publish`);
  return response.data;
}

export async function unpublishProduct({ orgId, productId }) {
  const response = await apiProtected.post(`/organizations/${orgId}/products/${productId}/unpublish`);
  return response.data;
}

/* ==================== PUBLIC CATALOG ==================== */
/**
 * По новой схеме:
 *  - make_id: number
 *  - condition: 'new' | 'used'
 *  - price_min/price_max: number
 */
export async function searchProducts({
  q,
  make_id,
  condition,
  price_min,
  price_max,
  limit = 20,
  cursor,
} = {}) {
  const response = await apiProtected.get('/products/catalog', {
    params: { q, make_id, condition, price_min, price_max, limit, cursor },
  });
  return response.data;
}

export async function getProductsFeed({ limit = 20, cursor } = {}) {
  const response = await apiProtected.get('/products/feed', {
    params: { limit, cursor },
  });
  return response.data;
}

export async function getPublicProductDetails(productId) {
  const response = await apiProtected.get(`/products/${productId}`);
  return response.data;
}

/* ==================== GARAGE ==================== */

export async function addVehicleToGarage(vehicleData) {
  const response = await apiProtected.post('/users/me/garage/add-vehicle', vehicleData);
  return response.data;
}

export async function getGarageVehicles({ search = "", limit = 50 } = {}) {
  const response = await apiProtected.get('/users/me/garage/vehicles', {
    params: { search, limit },
  });
  return response.data;
}

/* ==================== VEHICLES (makes/models/years) ==================== */

export async function getVehicleMakes({ limit = 50, search } = {}) {
  const response = await apiPublic.get('/vehicles/makes/', {
    params: { limit, search },
  });
  return response.data;
}

export async function getVehicleModels({ limit = 50, make_id, search } = {}) {
  const response = await apiPublic.get('/vehicles/models/', {
    params: { limit, make_id, search },
  });
  return response.data;
}

export async function getVehicleYears({ model_id }) {
  if (!model_id) {
    throw new Error('model_id is required');
  }
  const response = await apiPublic.get('/vehicles/years/', {
    params: { model_id },
  });
  return response.data;
}

/* ==================== PRODUCT MEDIA ==================== */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = { 'image/jpeg': true, 'image/png': true };

/**
 * Upload product photos (JPEG/PNG, ≤10 MB)
 * @param {Object} params
 * @param {string} params.orgId
 * @param {string} params.productId
 * @param {File[]|FileList} params.files
 */
export async function uploadProductPhotos({ orgId, productId, files }) {
  const filesArr = Array.from(files || []);
  if (!filesArr.length) {
    const e = new Error('Нет файлов для загрузки (files пуст)');
    e.code = 'CLIENT_VALIDATION';
    throw e;
  }

  const bad = [];
  const good = [];
  filesArr.forEach((f, i) => {
    if (!(f instanceof Blob)) { bad.push(`[#${i}] не Blob/File`); return; }
    if (!ALLOWED_MIME[f.type]) { bad.push(`[#${i}] тип ${f.type || 'unknown'} не поддерживается`); return; }
    if (f.size > MAX_FILE_SIZE) { bad.push(`[#${i}] ${(f.size/1024/1024).toFixed(2)} MB > 10 MB`); return; }
    good.push(f);
  });
  if (!good.length) {
    const e = new Error(`Все файлы отклонены: ${bad.join('; ')}`);
    e.code = 'CLIENT_VALIDATION';
    throw e;
  }

  const formData = new FormData();
  good.forEach((file, i) => formData.append('files', file, file.name || `photo_${i}.jpg`));

  const { data } = await apiProtected.put(
    `/organizations/${orgId}/products/${productId}/media`,
    formData
  );
  return data;
}


export async function deleteProductMedia({ orgId, productId, mediaId }) {
  if (!orgId || !productId || !mediaId) {
    throw new Error("Organization ID, Product ID and Media ID are required");
  }
  await apiProtected.delete(`/organizations/${orgId}/products/${productId}/media/${mediaId}`);
}

export async function getCart() {
  const { data } = await apiProtected.get('/cart/');
  return data; // CartModel
}

/** Краткая сводка корзины (для бейджа) */
export async function getCartSummary() {
  const { data } = await apiProtected.get('/cart/summary');
  return data; // { total_items, total_amount }
}

/** Добавить товар в корзину (если уже есть — увеличится qty) */
export async function addItemToCart({ product_id, quantity = 1 }) {
  const { data } = await apiProtected.post('/cart/items/', { product_id, quantity });
  return data; // CartModel
}

/** Обновить количество конкретной позиции корзины */
export async function updateCartItem({ item_id, quantity }) {
  const { data } = await apiProtected.put(`/cart/items/${item_id}`, { quantity });
  return data; // CartModel
}

/** Удалить позицию из корзины */
export async function removeCartItem({ item_id }) {
  const { data } = await apiProtected.delete(`/cart/items/${item_id}`);
  return data; // CartModel
}

/** Очистить корзину полностью */
export async function clearCart() {
  const { data } = await apiProtected.delete('/cart/');
  return data; // CartModel (пустая)
}

export async function listSellerOrders({ statuses, search, org_id, cursor, limit = 20 } = {}) {
  const sp = new URLSearchParams();
  if (Array.isArray(statuses)) statuses.forEach((s) => sp.append('statuses', s));
  if (search) sp.set('search', search);
  if (org_id) sp.set('org_id', org_id);
  if (cursor) sp.set('cursor', cursor);
  if (limit != null) sp.set('limit', String(limit));
  const url = `/seller/orders/${sp.toString() ? `?${sp.toString()}` : ''}`;
  const res = await apiProtected.get(url);
  return res.data;
}

export async function getSellerOrderItem(order_item_id) {
  const res = await apiProtected.get(`/seller/orders/${order_item_id}/`);
  return res.data;
}

export async function acceptSellerOrderItem(order_item_id) {
  const res = await apiProtected.post(`/seller/orders/${order_item_id}/accept`);
  return res.data;
}

export async function rejectSellerOrderItem(order_item_id, reason) {
  const payload = reason ? { reason } : {};
  const res = await apiProtected.post(`/seller/orders/${order_item_id}/reject`, payload);
  return res.data;
}

export async function shipSellerOrderItem(order_item_id, { carrier_code, tracking_number, tracking_url, shipped_at } = {}) {
  const res = await apiProtected.post(`/seller/orders/${order_item_id}/ship`, {
    carrier_code,
    tracking_number,
    tracking_url,
    shipped_at,
  });
  return res.data;
}

export async function deliverSellerOrderItem(order_item_id, { delivered_at } = {}) {
  const res = await apiProtected.post(`/seller/orders/${order_item_id}/deliver`, { delivered_at });
  return res.data;
}