import type { MouseEvent } from "react"
import {
  IconBuilding,
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react"
import { Link } from "react-router-dom"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Button } from "@/shared/components/ui/button"
import { useAuth } from "@/app/providers/auth/useAuth"
import { ROUTE_PATHS, SUPPLIER_NAV_SECTION } from "@/app/routes"
import type { NavSection } from "@/shared/components/nav-main"

export function NavUser({
  user,
  onNavItemSelect,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
  onNavItemSelect?: (args: {
    section: NavSection
    item: NavSection["items"][number]
  }) => boolean | void
}) {
  const logout = useAuth()?.logout
  const displayName = user.name?.trim() || "User"
  const displayEmail = user.email?.trim() || "—"
  const initials =
    (displayName.match(/\b\w/g)?.join("").slice(0, 2) ||
      displayName.slice(0, 2) ||
      "US").toUpperCase()

  const avatarProps = {
    src: user.avatar,
    alt: displayName,
  }

  const handleLogout = () => {
    logout?.()
  }

  const handleSupplierItemClick = (
    event: MouseEvent<HTMLAnchorElement>,
    item: NavSection["items"][number],
  ) => {
    const canNavigate = onNavItemSelect?.({
      section: SUPPLIER_NAV_SECTION,
      item,
    })

    if (canNavigate === false) {
      event.preventDefault()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="group flex h-12 items-center gap-3 rounded-lg border border-transparent px-2 text-left transition-colors hover:border-input hover:bg-accent/50"
        >
          <Avatar className="h-9 w-9 rounded-lg">
            <AvatarImage {...avatarProps} />
            <AvatarFallback className="rounded-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 flex-1 text-left text-sm leading-tight sm:grid">
            <span className="truncate font-medium">{displayName}</span>
            <span className="truncate text-xs text-muted-foreground">
              {displayEmail}
            </span>
          </div>
          <IconDotsVertical className="ml-auto size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-9 w-9 rounded-lg">
              <AvatarImage {...avatarProps} />
              <AvatarFallback className="rounded-lg">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{displayName}</span>
              <span className="truncate text-xs text-muted-foreground">
                {displayEmail}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to={ROUTE_PATHS.account.profile}>
              <IconUserCircle />
              Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={ROUTE_PATHS.account.organizations}>
              <IconBuilding />
              Organizations
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {SUPPLIER_NAV_SECTION.items.map((item) => {
            const Icon = item.icon
            return (
              <DropdownMenuItem asChild key={item.path}>
                <Link
                  to={item.path}
                  onClick={(event) => handleSupplierItemClick(event, item)}
                >
                  {Icon ? <Icon className="size-4" /> : null}
                  {item.title}
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout}>
          <IconLogout />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
