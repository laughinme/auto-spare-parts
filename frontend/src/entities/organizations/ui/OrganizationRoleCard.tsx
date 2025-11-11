import { ShieldCheck } from "lucide-react";

import type { UserPos } from "@/entities/organizations/model/types";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
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

type OrganizationRoleCardProps = {
  role: UserPos;
};

const ROLE_DESCRIPTIONS: Record<UserPos["role"], { label: string; description: string }> = {
  owner: {
    label: "Владелец",
    description: "Полный контроль над организацией, командой и финансовыми операциями.",
  },
  admin: {
    label: "Администратор",
    description: "Управляете товарами, участниками и заявками клиентов.",
  },
  staff: {
    label: "Сотрудник",
    description: "Работаете с каталогом и заказами от лица организации.",
  },
  accountant: {
    label: "Бухгалтер",
    description: "Отвечаете за выплаты, документы и финансовую отчётность.",
  },
};

export function OrganizationRoleCard({ role }: OrganizationRoleCardProps) {
  const currentRole = ROLE_DESCRIPTIONS[role.role] ?? {
    label: "Участник",
    description: "Работаете от лица организации в рамках назначенных прав.",
  };
  const invitedAtLabel = formatDate(role.invitedAt);
  const acceptedAtLabel = formatDate(role.acceptedAt);
  const isPending = role.acceptedAt === null;
  const inviterInitials = getInitials(role.invitedBy.username);

  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle>Ваша роль в организации</CardTitle>
        <CardDescription>Актуальный уровень доступа и условия участия.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <Badge variant="secondary" className="text-xs uppercase tracking-wide">
                {currentRole.label}
              </Badge>
              <p className="text-sm text-muted-foreground">{currentRole.description}</p>
            </div>
            <ShieldCheck className="size-10 text-primary" aria-hidden />
          </div>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <RoleField label="Статус доступа" value={isPending ? "Ожидает подтверждения" : "Активен"} />
            <RoleField label="ID участника" value={role.userId} mono />
            <RoleField label="Дата приглашения" value={invitedAtLabel ?? "—"} />
            <RoleField label="Дата подтверждения" value={acceptedAtLabel ?? "—"} />
          </dl>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/80 p-4 sm:flex-row sm:items-center">
          <Avatar className="h-12 w-12 text-base font-semibold uppercase">
            <AvatarFallback>{inviterInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-sm">
            <p className="font-semibold text-foreground">{role.invitedBy.username}</p>
            <p className="text-muted-foreground">
              Пригласил(а) вас {invitedAtLabel ?? "—"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type RoleFieldProps = {
  label: string;
  value: string;
  mono?: boolean;
};

function RoleField({ label, value, mono = false }: RoleFieldProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/80 p-3">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 text-sm font-semibold text-foreground",
          mono && "font-mono text-xs tracking-wide",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

type OrganizationRoleCardErrorProps = {
  onRetry: () => void;
};

export function OrganizationRoleCardError({ onRetry }: OrganizationRoleCardErrorProps) {
  return (
    <Card className="border border-destructive/30 bg-destructive/5">
      <CardContent className="flex flex-col gap-3 py-6 text-sm">
        <div className="space-y-1 text-destructive">
          <p className="font-semibold">Не удалось загрузить сведения о вашей роли</p>
          <p className="text-destructive/80">Попробуйте обновить страницу или повторите попытку позже.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => onRetry()}
        >
          Обновить
        </Button>
      </CardContent>
    </Card>
  );
}

export function OrganizationRoleCardSkeleton() {
  return (
    <Card className="border-border/60">
      <CardHeader className="space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_value, index) => (
              <div key={`role-field-${index}`} className="rounded-lg border border-border/60 p-3">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-2 h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

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

function getInitials(username: string) {
  if (!username?.trim()) {
    return "U";
  }

  const parts = username.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
