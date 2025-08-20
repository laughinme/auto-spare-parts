
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