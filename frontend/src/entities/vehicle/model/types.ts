export type Vehicle = {
    id: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
    make: { makeId: number; makeName: string };
    model: { modelId: number; makeId: number; modelName: string };
    year: number;
    vehicleType: { vehicleTypeId: number; name: string };
    vin: string;
    comment: string;
};

export type VehicleFeed = { 
    items: Vehicle[];
    nextCursor: string | null 
};