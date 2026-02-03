import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { Vehicle } from "@/entities/vehicle/model/types";
import { useUpdateGarageVehicle } from "@/features/vehicle/useUpdateGarageVehicle";
import type { UpdateVehicleBody } from "@/entities/vehicle/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  VehicleForm,
  EMPTY_VEHICLE_FORM,
  vehicleToFormValues,
  type VehicleFormSubmitPayload,
} from "./VehicleForm";

type EditVehicleDialogProps = {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditVehicleDialog({
  vehicle,
  open,
  onOpenChange,
}: EditVehicleDialogProps) {
  const [resetToken, setResetToken] = useState(0);
  const updateVehicleMutation = useUpdateGarageVehicle();
  const { reset: resetMutation } = updateVehicleMutation;

  useEffect(() => {
    if (!open) {
      resetMutation();
      setResetToken((token) => token + 1);
    }
  }, [open, resetMutation]);

  const initialValues = useMemo(
    () => (vehicle ? vehicleToFormValues(vehicle) : EMPTY_VEHICLE_FORM),
    [vehicle],
  );

  const prefillMakeOption = useMemo(
    () =>
      vehicle
        ? { makeId: vehicle.make.makeId, makeName: vehicle.make.makeName }
        : null,
    [vehicle],
  );

  const prefillModelOption = useMemo(
    () =>
      vehicle
        ? {
            modelId: vehicle.model.modelId,
            makeId: vehicle.make.makeId,
            modelName: vehicle.model.modelName,
          }
        : null,
    [vehicle],
  );

  const handleSubmit = (values: VehicleFormSubmitPayload) => {
    if (!vehicle) {
      return;
    }

    const payload: UpdateVehicleBody = {};

    if (values.makeId !== vehicle.make.makeId) {
      payload.make_id = values.makeId;
    }

    if (values.modelId !== vehicle.model.modelId) {
      payload.model_id = values.modelId;
    }

    if (values.year !== vehicle.year) {
      payload.year = values.year;
    }

    if (values.vehicleTypeId !== vehicle.vehicleType.vehicleTypeId) {
      payload.vehicle_type_id = values.vehicleTypeId;
    }

    const trimmedVin = values.vin ?? "";
    if (trimmedVin !== (vehicle.vin ?? "")) {
      payload.vin = trimmedVin;
    }

    const trimmedComment = values.comment ?? "";
    if (trimmedComment !== (vehicle.comment ?? "")) {
      payload.comment = trimmedComment;
    }

    if (Object.keys(payload).length === 0) {
      toast.info("Изменений не обнаружено");
      onOpenChange(false);
      return;
    }

    const nextVehicleTypeName =
      values.vehicleTypeId === vehicle.vehicleType.vehicleTypeId
        ? vehicle.vehicleType.name
        : `Тип #${values.vehicleTypeId}`;

    const optimisticVehicle: Vehicle = {
      ...vehicle,
      make: {
        makeId: values.makeId,
        makeName: values.makeName,
      },
      model: {
        modelId: values.modelId,
        makeId: values.makeId,
        modelName: values.modelName,
      },
      year: values.year,
      vehicleType: {
        vehicleTypeId: values.vehicleTypeId,
        name: nextVehicleTypeName,
      },
      vin: trimmedVin,
      comment: trimmedComment,
      updatedAt: new Date().toISOString(),
    };

    updateVehicleMutation.mutate(
      {
        vehicleId: vehicle.id,
        payload,
        optimisticVehicle,
      },
      {
        onSuccess: () => {
          toast.success("Данные автомобиля обновлены");
        },
        onSettled: () => onOpenChange(false),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Редактирование автомобиля</DialogTitle>
        </DialogHeader>
        <VehicleForm
          initialValues={initialValues}
          submitLabel="Сохранить"
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={updateVehicleMutation.isPending}
          resetToken={resetToken}
          requireChanges
          prefillMakeOption={prefillMakeOption}
          prefillModelOption={prefillModelOption}
        />
      </DialogContent>
    </Dialog>
  );
}
