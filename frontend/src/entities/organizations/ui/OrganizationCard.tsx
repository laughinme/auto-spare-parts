import type { Organization } from "@/entities/organizations/model/types";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

type OrganizationCardProps = {
  organization: Organization;
  className?: string;
};

const createdAtFormatter = new Intl.DateTimeFormat("ru-RU", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function OrganizationCard({
  organization,
  className,
}: OrganizationCardProps) {
  const createdAtLabel = getCreatedAtLabel(organization.createdAt);
  const countryLabel = organization.country?.trim() || "—";

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg leading-tight">
            {organization.name}
          </CardTitle>
          <Badge variant="secondary" className="uppercase tracking-wide">
            {countryLabel}
          </Badge>
        </div>
        <CardDescription>
          Создана {createdAtLabel}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <dl className="grid gap-2 text-muted-foreground">
          <div className="flex items-center justify-between gap-3">
            <dt className="font-medium text-foreground">
              Страна регистрации
            </dt>
            <dd className="text-foreground">{countryLabel}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="font-medium text-foreground">
              Дата создания
            </dt>
            <dd className="text-foreground">{createdAtLabel}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

export function OrganizationCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </CardContent>
    </Card>
  );
}

function getCreatedAtLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  try {
    return createdAtFormatter.format(date);
  } catch {
    return date.toLocaleDateString();
  }
}
