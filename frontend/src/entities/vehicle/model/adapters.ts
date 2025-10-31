import type { VehicleDto, CursorPageDto } from "@/shared/api/vehicles";
import type { Vehicle, VehicleFeed } from "./types";
import type { VehicleMake, VehicleModel } from "./types";
import type { VehicleMakeDto, VehicleModelDto } from "@/shared/api/vehicles";


export const toVehicle = (dto: VehicleDto): Vehicle => ({
  id: dto.id,
  userId: dto.user_id,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at,
  make: {
    makeId: dto.make.make_id,
    makeName: dto.make.make_name,
  },
  model: {
    modelId: dto.model.model_id,
    makeId: dto.model.make_id,
    modelName: dto.model.model_name,
  },
  year: dto.year,
  vehicleType: {
    vehicleTypeId: dto.vehicle_type.vehicle_type_id,
    name: dto.vehicle_type.name,
  },
  vin: dto.vin,
  comment: dto.comment,
});

export const toVehicleFeed = (resp: CursorPageDto<VehicleDto>): VehicleFeed => ({
  items: resp.items.map(toVehicle),
  nextCursor: resp.next_cursor ?? null,
});

export const toVehicleMake = (dto: VehicleMakeDto): VehicleMake => ({
  makeId: dto.make_id,
  makeName: dto.make_name,
});

export const toVehicleModel = (dto: VehicleModelDto): VehicleModel => ({
  modelId: dto.model_id,
  makeId: dto.make_id,
  modelName: dto.model_name,
});

export const toVehicleMakes = (dtos: VehicleMakeDto[]): VehicleMake[] =>
  dtos.map(toVehicleMake);

export const toVehicleModels = (dtos: VehicleModelDto[]): VehicleModel[] =>
  dtos.map(toVehicleModel);

export const fromVehicle = (vehicle: Vehicle): VehicleDto => ({
  id: vehicle.id,
  user_id: vehicle.userId,
  created_at: vehicle.createdAt,
  updated_at: vehicle.updatedAt,
  make: {
    make_id: vehicle.make.makeId,
    make_name: vehicle.make.makeName,
  },
  model: {
    model_id: vehicle.model.modelId,
    make_id: vehicle.model.makeId,
    model_name: vehicle.model.modelName,
  },
  year: vehicle.year,
  vehicle_type: {
    vehicle_type_id: vehicle.vehicleType.vehicleTypeId,
    name: vehicle.vehicleType.name,
  },
  vin: vehicle.vin,
  comment: vehicle.comment,
});
