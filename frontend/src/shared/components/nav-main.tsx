import type { ComponentType, ReactNode, SVGProps } from "react"
import { NavLink } from "react-router-dom"

import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/components/ui/badge"

export type NavSection = {
  label: string
  items: {
    title: string
    path: string
    icon?: ComponentType<SVGProps<SVGSVGElement>>
  }[]
}

export function NavMain({
  sections,
  searchSlot,
  itemCounters,
}: {
  sections: NavSection[]
  searchSlot?: ReactNode
  itemCounters?: Record<string, number>
}) {
  const nodes: ReactNode[] = []

  sections.forEach((section, index) => {
    nodes.push(
      <div
        key={`section-${section.label}`}
        className="flex flex-nowrap items-center gap-3"
      >
        <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
          {section.label}
        </span>
        <div className="flex flex-nowrap items-center gap-1">
          {section.items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              {item.icon && <item.icon className="size-4 shrink-0" />}
              <span className="flex items-center gap-1">
                {item.title}
                {itemCounters?.[item.path] && itemCounters[item.path]! > 0 ? (
                  <Badge
                    variant="secondary"
                    className="px-1.5 py-0 text-[0.65rem] font-semibold leading-none"
                  >
                    {itemCounters[item.path]}
                  </Badge>
                ) : null}
              </span>
            </NavLink>
          ))}
        </div>
      </div>
    )

    if (index === 0 && searchSlot) {
      nodes.push(
        <div
          key="nav-search-slot"
          className="flex min-w-[240px] flex-none items-center justify-center"
        >
          {searchSlot}
        </div>
      )
    }
  })

  return (
    <nav className="flex flex-1 flex-nowrap items-center gap-6 overflow-x-auto">
      {nodes}
    </nav>
  )
}
