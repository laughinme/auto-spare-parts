import type { ReactNode } from "react"
import { IconInnerShadowTop } from "@tabler/icons-react"
import { Link } from "react-router-dom"

import type { NavSection } from "@/shared/components/nav-main"
import { NavMain } from "@/shared/components/nav-main"
import { NavUser } from "@/shared/components/nav-user"

type SiteHeaderProps = {
  sections: NavSection[]
  user: {
    name: string
    email: string
    avatar: string
  }
  homePath?: string
  searchSlot?: ReactNode
  navItemCounters?: Record<string, number>
}

export function SiteHeader({
  sections,
  user,
  homePath = "/",
  searchSlot,
  navItemCounters,
}: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 w-full items-center gap-4 px-4 sm:px-6">
        <Link
          to={homePath}
          className="flex items-center gap-2 rounded-md px-2 py-1 text-base font-semibold tracking-tight text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <IconInnerShadowTop className="size-5" />
          <span>AutoSpareParts</span>
        </Link>
        <NavMain
          sections={sections}
          searchSlot={searchSlot}
          itemCounters={navItemCounters}
        />
        <div className="ml-auto flex items-center gap-3">
          <NavUser user={user} />
        </div>
      </div>
    </header>
  )
}
