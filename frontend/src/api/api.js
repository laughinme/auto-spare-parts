
import apiProtected, { apiPublic } from './axiosInstance.js';

export async function createProduct({ productData, orgId }) {
  const url = `/organizations/${orgId}/products/`;
  const response = await apiProtected.post(url, productData);

  return response.data;
}

export async function getProducts({ orgId, query, limit = 20, offset = 0 }) {
    const response = await apiProtected.get(`/organizations/${orgId}/products/`, {
      params: {
        q: query,
        limit,
        offset,
      }
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

// Функция для публикации продукта (делает его видимым в публичном каталоге)
export async function publishProduct({ orgId, productId }) {
  const response = await apiProtected.post(`/organizations/${orgId}/products/${productId}/publish`);
  return response.data;
}

// Функция для снятия продукта с публикации (скрывает из публичного каталога)
export async function unpublishProduct({ orgId, productId }) {
  const response = await apiProtected.post(`/organizations/${orgId}/products/${productId}/unpublish`);
  return response.data;
}

// === PUBLIC PRODUCT CATALOG ===

/**
 * Search products in public catalog with advanced filters
 * @param {Object} params - Search parameters
 * @param {string} [params.q] - Search query (brand, part number, description)
 * @param {string} [params.brand] - Filter by brand
 * @param {string} [params.condition] - Filter by condition (NEW, USED, REFURBISHED)
 * @param {number} [params.price_min] - Minimum price filter
 * @param {number} [params.price_max] - Maximum price filter
 * @param {number} [params.limit=20] - Maximum number of items
 * @param {string} [params.cursor] - Cursor for pagination
 */
export async function searchProducts({
  q,
  brand,
  condition,
  price_min,
  price_max,
  limit = 20,
  cursor
} = {}) {
  const response = await apiProtected.get('/products/catalog', {
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

/**
 * Get products feed (For You Page) with cursor pagination
 * @param {Object} params - Feed parameters
 * @param {number} [params.limit=20] - Maximum number of items
 * @param {string} [params.cursor] - Cursor for pagination
 */
export async function getProductsFeed({ limit = 20, cursor } = {}) {
  const response = await apiProtected.get('/products/feed', {
    params: {
      limit,
      cursor
    }
  });
  return response.data;
}

/**
 * Get public product details by ID
 * @param {string} productId - Product ID
 */
export async function getPublicProductDetails(productId) {
  const response = await apiProtected.get(`/products/${productId}`);
  return response.data;
}

// === GARAGE API ===

/**
 * Add a vehicle to user's garage
 * @param {Object} vehicleData - Vehicle data
 * @param {number} vehicleData.make_id - Vehicle make ID
 * @param {number} vehicleData.model_id - Vehicle model ID  
 * @param {number} vehicleData.year - Vehicle year
 * @param {number} [vehicleData.vehicle_type_id] - Vehicle type ID
 * @param {string} [vehicleData.vin] - Vehicle VIN
 * @param {string} [vehicleData.comment] - User comment
 */
export async function addVehicleToGarage(vehicleData) {
  const response = await apiProtected.post('/users/me/garage/add-vehicle', vehicleData);
  return response.data;
}

/**
 * Get all vehicles in user's garage
 * @param {Object} params - Search parameters
 * @param {string} [params.search] - Search query
 * @param {number} [params.limit=50] - Maximum number of vehicles
 */
export async function getGarageVehicles({ search = "", limit = 50 } = {}) {
  const response = await apiProtected.get('/users/me/garage/vehicles', {
    params: { search, limit }
  });
  return response.data;
}

// === VEHICLES (Makes/Models/Years) ===

/**
 * Get vehicle makes
 * @param {Object} params
 * @param {number} [params.limit=50]
 * @param {string} [params.search]
 */
export async function getVehicleMakes({ limit = 50, search } = {}) {
  const response = await apiPublic.get('/vehicles/makes/', {
    params: { limit, search }
  });
  return response.data;
}

/**
 * Get vehicle models
 * @param {Object} params
 * @param {number} [params.limit=50]
 * @param {number} [params.make_id]
 * @param {string} [params.search]
 */
export async function getVehicleModels({ limit = 50, make_id, search } = {}) {
  const response = await apiPublic.get('/vehicles/models/', {
    params: { limit, make_id, search }
  });
  return response.data;
}

/**
 * Get model years
 * @param {Object} params
 * @param {number} params.model_id
 */
export async function getVehicleYears({ model_id }) {
  if (!model_id) {
    throw new Error('model_id is required');
  }
  const response = await apiPublic.get('/vehicles/years/', {
    params: { model_id }
  });
  return response.data;
}

