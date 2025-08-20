
import apiProtected from './axiosInstance.js';

export async function createProduct({ productData, orgId }) {
  const url = `/organizations/${orgId}/products`;
  const response = await apiProtected.post(url, productData);

  return response.data;
}