import apiProtected from "./axiosInstance";

export type VehicleDto = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  make: { make_id: number; make_name: string };
  model: { model_id: number; make_id: number; model_name: string };
  year: number;
  vehicle_type: { vehicle_type_id: number; name: string };
  vin: string;
  comment: string;
};

export type VehiclesParams = {
    cursor?: string
    limit?: number
    search?: string
    make_id?: number
    model_id?: number
}

export type CursorPageDto<T> = {
  items: T[];
  next_cursor: string | null;
};
    
export const getVehicles = async (params?: VehiclesParams) => {
    const response = await apiProtected.get<CursorPageDto<VehicleDto>>('/users/me/garage/vehicles', { params });
    return response.data;
}
