import apiProtected from "./client.js";

export async function uploadProductPhotos({ orgId, productId, files }) {
  if (!orgId || !productId) {
    throw new Error("Organization ID and Product ID are required");
  }
  if (!files || files.length === 0) {
    throw new Error("At least one file is required");
  }

  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });

  const response = await apiProtected.put(
    `/organizations/${orgId}/products/${productId}/media`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
  return response.data;
}

export async function deleteProductMedia({ orgId, productId, mediaId }) {
  if (!orgId || !productId || !mediaId) {
    throw new Error("Organization ID, Product ID and Media ID are required");
  }
  await apiProtected.delete(
    `/organizations/${orgId}/products/${productId}/media/${mediaId}`
  );
}