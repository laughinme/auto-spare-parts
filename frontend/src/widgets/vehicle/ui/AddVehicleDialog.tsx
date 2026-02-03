import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { useAddToGarage } from "@/features/vehicle/useAddToGarage";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import type { AddVehicleBody } from "@/entities/vehicle/api";
import {
  EMPTY_VEHICLE_FORM,
  VehicleForm,
  type VehicleFormSubmitPayload,
} from "./VehicleForm";

export function AddVehicleDialog() {
  const [open, setOpen] = useState(false);
  const [resetToken, setResetToken] = useState(0);

  const addVehicleMutation = useAddToGarage();

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      addVehicleMutation.reset();
      setResetToken((token) => token + 1);
    }
  };

  const handleSubmit = (values: VehicleFormSubmitPayload) => {
    const payload: AddVehicleBody = {
      make_id: values.makeId,
      model_id: values.modelId,
      year: values.year,
      vehicle_type_id: values.vehicleTypeId,
      vin: values.vin ?? undefined,
      comment: values.comment ?? undefined,
    };

    const vehicleTypeName = `Тип #${values.vehicleTypeId}`;

    addVehicleMutation.mutate(
      {
        payload,
        meta: {
          makeName: values.makeName,
          modelName: values.modelName,
          vehicleTypeName,
        },
      },
      {
        onSuccess: () => {
          toast.success("Автомобиль добавлен в гараж");
          handleOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="mr-2 size-4" aria-hidden />
          Добавить авто
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Добавление автомобиля</DialogTitle>
        </DialogHeader>
        <VehicleForm
          initialValues={EMPTY_VEHICLE_FORM}
          submitLabel="Добавить"
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
          isSubmitting={addVehicleMutation.isPending}
          resetToken={resetToken}
        />
      </DialogContent>
    </Dialog>
  );
}
