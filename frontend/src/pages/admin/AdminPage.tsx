import { useEffect, useMemo, useState, type ComponentType } from "react"
import { Link } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  IconArrowUpRight,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconUserCheck,
  IconUserOff,
  IconUsers,
} from "@tabler/icons-react"

import { useAuth } from "@/app/providers/auth/useAuth"
import { ROUTE_PATHS } from "@/app/routes"
import { isAdminUser } from "@/entities/auth/lib/roles"
import type { AdminUserDto } from "@/entities/admin/api"
import { useAdminUsers } from "@/entities/admin/model/useAdminUsers"
import { useAdminBanUser } from "@/entities/admin/model/useAdminBanUser"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/shared/components/ui/toggle-group"
import { cn } from "@/shared/lib/utils"

const formatDate = (value: string | null | undefined) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

const getInitials = (user: AdminUserDto) => {
  const seed = user.username?.trim() || user.email?.trim() || "US"
  return seed
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: string }).message
    if (message) {
      return message
    }
  }
  return fallback
}

function MetricCell({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: number | string
  hint?: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">
          {value}
        </p>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-5 text-muted-foreground" />
      </div>
    </div>
  )
}

export default function AdminPage() {
  const auth = useAuth()
  const user = auth?.user ?? null
  const isAdmin = isAdminUser(user)

  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState<string | null>(null)
  const [bannedFilter, setBannedFilter] = useState<"all" | "banned" | "active">(
    "all",
  )
  const [limit, setLimit] = useState("50")
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)

  useEffect(() => {
    const handler = window.setTimeout(() => {
      const trimmed = searchInput.trim()
      setSearch(trimmed.length > 0 ? trimmed : null)
    }, 400)

    return () => window.clearTimeout(handler)
  }, [searchInput])

  const banned =
    bannedFilter === "all"
      ? null
      : bannedFilter === "banned"
        ? true
        : false

  const usersQuery = useAdminUsers({
    banned,
    search,
    limit: Number(limit),
    enabled: isAdmin,
  })

  const banMutation = useAdminBanUser()

  const users = useMemo(
    () => usersQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [usersQuery.data],
  )

  const totalLoaded = users.length
  const bannedCount = users.filter((item) => item.banned).length
  const activeCount = totalLoaded - bannedCount
  const onboardedCount = users.filter((item) => item.is_onboarded).length

  const isRefreshing =
    usersQuery.isFetching || usersQuery.isFetchingNextPage

  const handleBanToggle = (target: AdminUserDto) => {
    setPendingUserId(target.id)
    banMutation.mutate(
      { userId: target.id, banned: !target.banned },
      {
        onSuccess: () => {
          toast.success(
            target.banned ? "Пользователь разбанен" : "Пользователь забанен",
          )
        },
        onError: (error) => {
          toast.error(
            getErrorMessage(error, "Не удалось обновить статус"),
          )
        },
        onSettled: () => {
          setPendingUserId(null)
        },
      },
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 md:px-6">
          <div className="rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
              <IconShieldCheck className="size-6 text-muted-foreground" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold">Доступ запрещён</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Эта страница доступна только администраторам. Перейдите в пользовательский интерфейс.
            </p>
            <div className="mt-6 flex justify-center">
              <Button asChild>
                <Link to={ROUTE_PATHS.buyer.fyp}>Перейти на FYP</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 md:px-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">
              Админ Панель
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Управление пользователями и регистрациями
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTE_PATHS.buyer.fyp}>
                Вернуться на FYP
                <IconArrowUpRight className="size-4" />
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                usersQuery.refetch()
              }}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <IconRefresh className="size-4" />
              )}
              Обновить
            </Button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <MetricCell
            label="Пользователи"
            value={totalLoaded}
            icon={IconUsers}
          />
          <MetricCell
            label="В бане"
            value={bannedCount}
            icon={IconUserOff}
          />
          <MetricCell
            label="Активные"
            value={activeCount}
            icon={IconUserCheck}
          />
        </section>

        <section className="flex flex-col gap-6">
          <Card className="overflow-hidden border-border/60 shadow-sm">
            <CardHeader className="gap-3">
              <div className="flex flex-col gap-1">
                <CardTitle>Пользователи</CardTitle>
                <CardDescription>
                  Поиск, фильтры и бан/разбан
                </CardDescription>
              </div>
              <CardAction>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => usersQuery.refetch()}
                  disabled={usersQuery.isFetching}
                >
                  {usersQuery.isFetching ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <IconRefresh className="size-4" />
                  )}
                </Button>
              </CardAction>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-72">
                  <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Поиск по username или email"
                    className="h-8 pl-9"
                  />
                </div>

                <ToggleGroup
                  type="single"
                  variant="outline"
                  size="sm"
                  value={bannedFilter}
                  onValueChange={(value) => {
                    if (value) setBannedFilter(value as typeof bannedFilter)
                  }}
                >
                  <ToggleGroupItem value="all">Все</ToggleGroupItem>
                  <ToggleGroupItem value="active">Активные</ToggleGroupItem>
                  <ToggleGroupItem value="banned">В бане</ToggleGroupItem>
                </ToggleGroup>

                <Select value={limit} onValueChange={setLimit}>
                  <SelectTrigger size="sm" className="w-full sm:w-28">
                    <SelectValue placeholder="Лимит" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>

                <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                  {usersQuery.isFetching ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : null}
                  {usersQuery.isFetching ? "Обновляем…" : `Показано: ${totalLoaded}`}
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-0">
              {usersQuery.isLoading ? (
                <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
                  Загружаем пользователей…
                </div>
              ) : usersQuery.isError ? (
                <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-sm text-muted-foreground">
                  Не удалось загрузить пользователей.
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => usersQuery.refetch()}
                  >
                    Повторить
                  </Button>
                </div>
              ) : users.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                  По заданным фильтрам нет пользователей
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Пользователь</TableHead>
                      <TableHead className="hidden md:table-cell">Роли</TableHead>
                      <TableHead className="hidden lg:table-cell">Организация</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="hidden xl:table-cell">Создан</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((item) => {
                      const roles = item.role_slugs ?? []
                      const org = item.organization
                      const isPending = pendingUserId === item.id

                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 rounded-xl">
                                <AvatarImage
                                  src={item.profile_pic_url ?? undefined}
                                  alt={item.username ?? item.email}
                                />
                                <AvatarFallback className="rounded-xl">
                                  {getInitials(item)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="truncate font-medium">
                                  {item.username ?? "Без имени"}
                                </div>
                                <div className="truncate text-xs text-muted-foreground">
                                  {item.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {roles.length > 0 ? (
                                roles.map((role) => (
                                  <Badge
                                    key={`${item.id}-${role}`}
                                    variant="outline"
                                  >
                                    {role}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  —
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="hidden lg:table-cell">
                            {org ? (
                              <div className="min-w-0">
                                <div className="truncate font-medium">
                                  {org.name}
                                </div>
                                <div className="truncate text-xs text-muted-foreground">
                                  {org.type} · {org.country}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {item.banned ? (
                                <Badge variant="outline">В бане</Badge>
                              ) : (
                                <Badge variant="secondary">Активен</Badge>
                              )}
                              <span className="text-[0.7rem] text-muted-foreground">
                                {item.is_onboarded
                                  ? "Онбординг завершён"
                                  : "Онбординг не завершён"}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="hidden xl:table-cell">
                            {formatDate(item.created_at)}
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className={cn(
                                "h-8",
                                !item.banned &&
                                  "border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive",
                              )}
                              onClick={() => handleBanToggle(item)}
                              disabled={banMutation.isPending && isPending}
                            >
                              {banMutation.isPending && isPending ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : null}
                              {item.banned ? "Разбанить" : "Забанить"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3 border-t md:flex-row md:items-center md:justify-between">
              <div className="text-xs text-muted-foreground">
                Показано {totalLoaded} пользователей
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => usersQuery.fetchNextPage()}
                  disabled={
                    !usersQuery.hasNextPage || usersQuery.isFetchingNextPage
                  }
                >
                  {usersQuery.isFetchingNextPage ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  {usersQuery.hasNextPage ? "Загрузить ещё" : "Конец списка"}
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  <Link to={ROUTE_PATHS.buyer.fyp}>
                    В пользовательский режим
                    <IconArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </section>
      </div>
    </div>
  )
}
