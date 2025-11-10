import { useOrganizationsMine } from "@/entities/organizations/model/useOrganizationsMine";
import {
  OrganizationCard,
  OrganizationCardSkeleton,
} from "@/entities/organizations/ui/OrganizationCard";
import { Button } from "@/shared/components/ui/button";

const INITIAL_SKELETON_COUNT = 3;

export function OrganizationsListWidget() {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useOrganizationsMine();

  const organizations = data ?? [];
  const showSkeletons = isLoading && organizations.length === 0;
  const showEmptyState =
    !isLoading && !isFetching && organizations.length === 0 && !isError;

  return (
    <section className="flex flex-col gap-4">
      {isError ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-6 text-center">
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">
              Не удалось загрузить организации
            </p>
            <p className="text-sm text-muted-foreground">
              Проверьте подключение к интернету и попробуйте снова.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => refetch()}>
            Повторить попытку
          </Button>
        </div>
      ) : null}

      {showEmptyState ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          <p className="text-base font-medium text-foreground">
            Организации не найдены
          </p>
          <p className="text-sm max-w-md">
            Как только вы присоединитесь к организации или создадите свою,
            она появится здесь.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {showSkeletons
            ? Array.from({ length: INITIAL_SKELETON_COUNT }).map(
                (_value, index) => (
                  <OrganizationCardSkeleton
                    key={`organization-card-skeleton-${index}`}
                  />
                ),
              )
            : organizations.map((organization) => (
                <OrganizationCard
                  key={organization.id}
                  organization={organization}
                />
              ))}
        </div>
      )}

      {isFetching && !isLoading ? (
        <p className="text-center text-xs text-muted-foreground">
          Обновляем список…
        </p>
      ) : null}
    </section>
  );
}
