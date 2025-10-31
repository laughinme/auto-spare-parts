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

export type VehicleMakeDto = {
    make_id: number;
    make_name: string;
};

export type VehicleMakesParams = {
    limit: number;
    search?: string | null;
}

export const getVehiclesMakes = async ({ limit, search }: VehicleMakesParams) => {
    const response = await apiProtected.get<VehicleMakeDto[]>('/vehicles/makes', {
        params: { limit, search }
    });
    return response.data;
}

export type VehicleModelDto = {
    model_id: number;
    make_id: number;
    model_name: string;
};

export type VehicleModelsParams = {
    make_id: number;
    limit: number;
    search?: string | null;
}

export const getVehicleModels = async ({ make_id, limit, search }: VehicleModelsParams) => {
    const response = await apiProtected.get<VehicleModelDto[]>('/vehicles/models', {
        params: { make_id, limit, search }
    });
    return response.data;
}


export type VehicleYearsParams = {
    model_id: number;
}

export const getVehicleYears = async ({ model_id }: VehicleYearsParams) => {
    const response = await apiProtected.get<number[]>('/vehicles/years', {
        params: { model_id }
    });
    return response.data;
}

export type AddVehicleBody= {
    make_id: number;
    model_id: number;
    year: number;
    vehicle_type_id: number;
    vin?: string;
    comment?: string;
}
export const addVehicle = async (data: AddVehicleBody) => {
    const response = await apiProtected.post<VehicleDto>('/users/me/garage/add-vehicle', data);
    return response.data;
}

export const removeVehicle = async (vehicleId: string) => {
    const response = await apiProtected.delete<void>(`/users/me/garage/${vehicleId}/`);
    return response.data;
}

export type UpdateVehicleBody= {
    make_id?: number;
    model_id?: number;
    year?: number;
    vehicle_type_id?: number;
    vin?: string;
    comment?: string;
}
export const updateVehicle = async (vehicleId: string, data: UpdateVehicleBody) => {
    const response = await apiProtected.patch<VehicleDto>(`/users/me/garage/${vehicleId}/`, data);
    return response.data;
}

export const getVehicleDetails = async (vehicleId: string) => {
    const response = await apiProtected.get<VehicleDto>(`/users/me/garage/${vehicleId}/`);
    return response.data;
}
