import apiProtected from "./client.js";

export async function addVehicleToGarage(vehicleData) {
  const response = await apiProtected.post(
    "/users/me/garage/add-vehicle",
    vehicleData
  );
  return response.data;
}

export async function getGarageVehicles({
  search = "",
  limit = 50
} = {}) {
  const response = await apiProtected.get("/users/me/garage/vehicles", {
    params: { search, limit }
  });
  return response.data;
}