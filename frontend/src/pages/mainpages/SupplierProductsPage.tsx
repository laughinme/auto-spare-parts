import { useMemo } from "react";

import { useAuth } from "@/app/providers/auth/useAuth";
import { SupplierProductsWidget } from "@/widgets/supplier/ui/SupplierProductsWidget";
import { SupplierProductCreateDialog } from "@/widgets/supplier/ui/SupplierProductCreateDialog";
import { Button } from "@/shared/components/ui/button";

export default function SupplierProductsPage() {
  const auth = useAuth();
  const organization = auth?.user?.organization ?? null;
  const orgId = organization?.id ?? null;

  const organizationName = useMemo(
    () => organization?.name?.trim() || "Организация",
    [organization?.name],
  );

  if (!orgId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Доступ ограничен</h1>
          <p className="text-muted-foreground">
            Для просмотра товаров необходимо завершить регистрацию поставщика.
          </p>
        </div>
        <Button type="button" variant="default" disabled>
          Пройти онбординг
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold leading-tight">
            {organizationName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Управляйте ассортиментом, следите за статусом публикаций и остатками.
          </p>
        </header>
        <SupplierProductsWidget
          orgId={orgId}
          createAction={<SupplierProductCreateDialog orgId={orgId} />}
        />
      </div>
    </div>
  );
}
