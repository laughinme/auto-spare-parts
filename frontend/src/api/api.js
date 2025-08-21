
import apiProtected from './axiosInstance.js';

export async function createProduct({ productData, orgId }) {
  const url = `/organizations/${orgId}/products`;
  const response = await apiProtected.post(url, productData);

  return response.data;
}
export async function getProducts({ orgId, query, limit = 20, offset = 0 }) {
    const response = await apiProtected.get(`/organizations/${orgId}/products`, {
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
  const response = await apiProtected.patch(`/organizations/${orgId}/${productId}/`, productData);
  return response.data;
}

export async function deleteProduct({ orgId, productId }) {
  await apiProtected.delete(`/organizations/${orgId}/${productId}/`);
}