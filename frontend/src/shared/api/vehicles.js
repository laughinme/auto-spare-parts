import { apiPublic } from "./client.js";

export async function getVehicleMakes({ limit = 50, search } = {}) {
  const response = await apiPublic.get("/vehicles/makes/", {
    params: { limit, search }
  });
  return response.data;
}

export async function getVehicleModels({
  limit = 50,
  make_id,
  search
} = {}) {
  const response = await apiPublic.get("/vehicles/models/", {
    params: { limit, make_id, search }
  });
  return response.data;
}

export async function getVehicleYears({ model_id }) {
  if (!model_id) {
    throw new Error("model_id is required");
  }
  const response = await apiPublic.get("/vehicles/years/", {
    params: { model_id }
  });
  return response.data;
}