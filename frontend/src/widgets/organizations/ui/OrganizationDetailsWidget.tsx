import { RefreshCcw } from "lucide-react";

import type { Organization } from "@/entities/organizations/model/types";
import { useOrganizationDetails } from "@/entities/organizations/model/useOrganizationDetails";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

type OrganizationDetailsWidgetProps = {
  organizationId: string;
};

export function OrganizationDetailsWidget({
  organizationId,
}: OrganizationDetailsWidgetProps) {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useOrganizationDetails(organizationId);

  if (isLoading) {
    return <OrganizationDetailsSkeleton />;
  }

  if (isError || !data) {
    return <OrganizationDetailsError onRetry={refetch} />;
  }

  return (
    <OrganizationDetailsCard
      organization={data}
    />
  );
}

type OrganizationDetailsCardProps = {
  organization: Organization;
};

function OrganizationDetailsCard({
  organization,
}: OrganizationDetailsCardProps) {
  const countryLabel = organization.country?.trim() || "—";
  const countryBadgeLabel =
    countryLabel === "—" ? "Не указана" : countryLabel.toUpperCase();
  const addressLabel =
    organization.address?.trim() ||
    "Адрес не указан. Добавьте данные, чтобы коллеги быстрее вас находили.";
  const createdAtLabel = formatDate(organization.createdAt);

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-white shadow-lg">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_transparent_55%)]" />
        <div className="relative flex flex-col gap-6 p-6 sm:p-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
              Organization
            </p>
            <h2 className="text-3xl font-semibold leading-tight">
              {organization.name}
            </h2>
            <p className="max-w-2xl text-sm text-white/80">
              {addressLabel}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="secondary"
              className="border border-white/20 bg-white/15 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur"
            >
              {countryBadgeLabel}
            </Badge>
            <span className="text-sm text-white/80">
              На платформе с{" "}
              <span className="font-semibold">
                {createdAtLabel ?? "—"}
              </span>
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <HeroStat label="Страна регистрации" value={countryLabel} />
            <HeroStat label="Дата создания" value={createdAtLabel ?? "—"} />
          </div>
        </div>
      </section>

      <section className="@container/main grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Базовая информация</CardTitle>
            <CardDescription>
              Актуальные реквизиты и общие сведения об организации.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <dl className="grid gap-4 sm:grid-cols-2">
              <InfoField label="Название" value={organization.name} />
              <InfoField label="Страна регистрации" value={countryLabel} />
              <InfoField
                label="Дата создания"
                value={createdAtLabel ?? "—"}
              />
              <InfoField
                label="Юридический адрес"
                value={addressLabel}
                muted={!organization.address?.trim()}
                className="sm:col-span-2"
              />
            </dl>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Что дальше</CardTitle>
            <CardDescription>
              Рекомендации по ведению профиля организации.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4 text-sm text-muted-foreground">
              {CHECKLIST_ITEMS.map((item) => (
                <ChecklistItem key={item.title} title={item.title} text={item.text} />
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

type HeroStatProps = {
  label: string;
  value: string;
};

function HeroStat({ label, value }: HeroStatProps) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-white/80 backdrop-blur">
      <div className="text-xs uppercase tracking-wide text-white/70">
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-white">
        {value}
      </div>
    </div>
  );
}

type InfoFieldProps = {
  label: string;
  value: string;
  mono?: boolean;
  muted?: boolean;
  className?: string;
};

function InfoField({
  label,
  value,
  mono = false,
  muted = false,
  className,
}: InfoFieldProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-background/80 p-4",
        className,
      )}
    >
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-2 whitespace-pre-line text-base font-medium text-foreground",
          mono && "font-mono text-sm uppercase tracking-wide",
          muted && "text-muted-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

type ChecklistItemProps = {
  title: string;
  text: string;
};

function ChecklistItem({ title, text }: ChecklistItemProps) {
  return (
    <li className="rounded-xl border border-border/60 bg-muted/40 p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {text}
      </p>
    </li>
  );
}

type OrganizationDetailsErrorProps = {
  onRetry: () => void;
};

function OrganizationDetailsError({ onRetry }: OrganizationDetailsErrorProps) {
  return (
    <Card className="border border-destructive/40 bg-destructive/10">
      <CardContent className="flex flex-col gap-4 py-6 text-sm text-destructive">
        <div className="space-y-1">
          <p className="font-semibold">Не удалось загрузить данные организации</p>
          <p className="text-muted-foreground">
            Проверьте подключение к интернету и повторите попытку.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 self-start"
          onClick={() => onRetry()}
        >
          <RefreshCcw className="size-4" aria-hidden />
          Повторить
        </Button>
      </CardContent>
    </Card>
  );
}

function OrganizationDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl border border-border/40 bg-muted/50 p-6 sm:p-8">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-4 h-8 w-2/3" />
        <Skeleton className="mt-3 h-4 w-full" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_value, index) => (
            <div
              key={`hero-skeleton-${index}`}
              className="rounded-2xl border border-border/40 bg-background/40 p-4"
            >
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-5 w-20" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-6 h-10 w-32" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Card className="border-border/60">
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_value, index) => (
              <div
                key={`details-skeleton-${index}`}
                className="rounded-lg border border-border/60 bg-background/80 p-4"
              >
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-2 h-4 w-3/4" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_value, index) => (
              <div
                key={`notes-skeleton-${index}`}
                className="rounded-lg border border-border/60 bg-background/70 p-4"
              >
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="mt-2 h-3 w-4/5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const CHECKLIST_ITEMS = [
  {
    title: "Проверьте реквизиты",
    text: "Убедитесь, что название и юридический адрес соответствуют документам компании.",
  },
  {
    title: "Поделитесь доступом",
    text: "Пригласите коллег, чтобы они могли управлять товарами и платежами от лица организации.",
  },
  {
    title: "Держите данные актуальными",
    text: "Обновляйте адрес и страну при изменениях — это ускоряет модерацию и расчёты.",
  },
];

function formatDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  try {
    return dateFormatter.format(date);
  } catch {
    return date.toLocaleDateString();
  }
}
