import { useState, type ReactNode } from "react"
import {
  IconBrandGithub,
  IconInnerShadowTop,
  IconMenu2,
} from "@tabler/icons-react"
import { Link, NavLink } from "react-router-dom"

import type { NavSection } from "@/shared/components/nav-main"
import { NavMain } from "@/shared/components/nav-main"
import { NavUser } from "@/shared/components/nav-user"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet"
import { cn } from "@/shared/lib/utils"

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
  onNavItemSelect?: Parameters<typeof NavMain>[0]["onItemSelect"]
}

export function SiteHeader({
  sections,
  user,
  homePath = "/",
  searchSlot,
  navItemCounters,
  onNavItemSelect,
}: SiteHeaderProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 w-full items-center gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileNavOpen(true)}
            >
              <IconMenu2 className="size-5" />
              <span className="sr-only">Открыть меню</span>
            </Button>
            <SheetContent
              side="left"
              className="flex w-[18rem] max-w-[80vw] flex-col gap-4 p-0 sm:w-[20rem] sm:max-w-[20rem]"
            >
              <SheetHeader className="border-b px-4 py-4">
                <SheetTitle className="flex items-center gap-2 text-base font-semibold">
                  <IconInnerShadowTop className="size-5" />
                  AutoSpareParts
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-6">
                {sections.map((section) => (
                  <div key={section.label} className="flex flex-col gap-2">
                    <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
                      {section.label}
                    </span>
                    <div className="flex flex-col gap-1">
                      {section.items.map((item) => {
                        const counter = navItemCounters?.[item.path]
                        return (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            end
                            onClick={(event) => {
                              const result = onNavItemSelect?.({
                                section,
                                item,
                                event,
                              })
                              if (result === false) {
                                event.preventDefault()
                                return
                              }
                              setIsMobileNavOpen(false)
                            }}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                  ? "bg-accent text-accent-foreground"
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              )
                            }
                          >
                            {item.icon ? (
                              <item.icon className="size-4 shrink-0" />
                            ) : null}
                            <span className="flex items-center gap-2">
                              {item.title}
                              {counter && counter > 0 ? (
                                <Badge
                                  variant="secondary"
                                  className="px-1.5 py-0 text-[0.65rem] font-semibold leading-none"
                                >
                                  {counter}
                                </Badge>
                              ) : null}
                            </span>
                          </NavLink>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <Link
            to={homePath}
            className="flex items-center gap-2 rounded-md px-2 py-1 text-base font-semibold tracking-tight text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <IconInnerShadowTop className="size-5" />
            <span className="hidden sm:inline">AutoSpareParts</span>
          </Link>
        </div>
        <div className="hidden flex-1 items-center lg:flex">
          <NavMain
            sections={sections}
            itemCounters={navItemCounters}
            onItemSelect={onNavItemSelect}
          />
        </div>
        {searchSlot ? (
          <div className="flex flex-1 items-center lg:flex-none lg:justify-end">
            <div className="w-full max-w-xl lg:max-w-sm">
              {searchSlot}
            </div>
          </div>
        ) : null}
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="sm:hidden"
          >
            <a
              href="https://github.com/laughinme/AutoSpareParts"
              target="_blank"
              rel="noreferrer"
              aria-label="Открыть репозиторий проекта на GitHub"
              title="GitHub"
            >
              <IconBrandGithub className="size-5" />
            </a>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <a
              href="https://github.com/laughinme/AutoSpareParts"
              target="_blank"
              rel="noreferrer"
              aria-label="Открыть репозиторий проекта на GitHub"
              title="GitHub"
            >
              <IconBrandGithub className="size-4" />
              <span>GitHub</span>
            </a>
          </Button>
          <NavUser user={user} onNavItemSelect={onNavItemSelect} />
        </div>
      </div>
    </header>
  )
}
