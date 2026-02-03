import { useParams } from "react-router-dom";

import { Card, CardContent } from "@/shared/components/ui/card";
import { OrganizationDetailsWidget } from "@/widgets/organizations/ui/OrganizationDetailsWidget";

export default function OrganizationDetailsPage() {
  const { organizationId } = useParams<{ organizationId: string }>();

  if (!organizationId) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">
              Не найден идентификатор организации. Вернитесь назад и выберите запись ещё раз.
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            Organizations
          </p>
          <h1 className="text-2xl font-semibold leading-tight">
            Детали организации
          </h1>
          <p className="text-sm text-muted-foreground">
            Полный профиль компании и основные реквизиты. Эти данные доступны всем участникам организации.
          </p>
        </header>

        <OrganizationDetailsWidget organizationId={organizationId} />
      </div>
    </div>
  );
}
