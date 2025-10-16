import * as React from "react"
import { IconInnerShadowTop } from "@tabler/icons-react"
import { useAuth } from "@/app/providers/auth/useAuth"
import type { NavSection } from "@/shared/components/nav-main"
import { NavMain } from "@/shared/components/nav-main"
import { NavUser } from "@/shared/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar"

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  sections: NavSection[]
}

export function AppSidebar({ sections, ...props }: AppSidebarProps) {
  const auth = useAuth()
  const email = auth?.user?.email ?? ""
  const userName = (auth?.user?.name as string | undefined) || email || "User"
  const user = {
    name: userName,
    email,
    avatar: "/avatars/shadcn.jpg",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">AutoSpareParts</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain sections={sections} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
