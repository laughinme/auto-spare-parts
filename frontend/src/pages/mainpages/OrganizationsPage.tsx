import { OrganizationsListWidget } from "@/widgets/organizations/ui/OrganizationsListWidget";

export default function OrganizationsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-1">
          <p className="text-sm font-medium text-primary uppercase tracking-wide">
            Organizations
          </p>
          <h1 className="text-2xl font-semibold leading-tight">
            Мои организации
          </h1>
          <p className="text-sm text-muted-foreground">
            Просматривайте компании, к которым у вас есть доступ. Здесь будет
            отображаться статус и основная информация по каждой организации.
          </p>
        </header>
        <OrganizationsListWidget />
      </div>
    </div>
  );
}
