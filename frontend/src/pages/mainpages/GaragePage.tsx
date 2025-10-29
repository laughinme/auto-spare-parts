import { GarageVehiclesWidget } from "@/widgets/vehicle/ui/GarageVehiclesWidget";

export default function GaragePage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 md:px-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Гараж
          </h1>
          <p className="text-sm text-muted-foreground">
            Управляйте автомобилями и держите под рукой всю информацию для быстрого подбора деталей.
          </p>
        </header>

        <GarageVehiclesWidget />
      </div>
    </div>
  );
}
