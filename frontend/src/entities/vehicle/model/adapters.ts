import type { VehicleDto, CursorPageDto} from '@/shared/api/vehicles';
import type { Vehicle, VehicleFeed } from './types';

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