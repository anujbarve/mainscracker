"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconCirclePlus,
  IconPaywall,
  IconArrowsSort
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/stores/auth"

export function useBasePath() {
  const pathname = usePathname()
  if (pathname.startsWith("/student")) return "/student"
  if (pathname.startsWith("/faculty")) return "/faculty"
  if (pathname.startsWith("/admin")) return "/admin"
  return "" // default
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { profile } = useAuthStore()

  // detect base path dynamically
  let basePath = useBasePath()

  // role-based navigation
  const data = React.useMemo(() => {
    if (profile?.role === "admin") {
      return {
        navMain: [
          { title: "Overview", url: `${basePath}/overview`, icon: IconDashboard },
          { title: "Manage Users", url: `${basePath}/users`, icon: IconUsers },
          { title: "Manage Faculty", url: `${basePath}/faculty`, icon: IconChartBar },
          { title: "Manage Submissions", url: `${basePath}/submissions`, icon: IconFolder },
          { title: "Model Answer Papers", url: `${basePath}/papers`, icon: IconDatabase },
        ],
        documents: [
          { name: "System Reports", url: `${basePath}/reports/system`, icon: IconReport },
          { name: "Financial Reports", url: `${basePath}/reports/finance`, icon: IconFileWord },
        ],
        navSecondary: [
          { title: "System Settings", url: `${basePath}/settings`, icon: IconSettings },
          { title: "Get Help", url: "#", icon: IconHelp },
          { title: "Search", url: "#", icon: IconSearch },
        ],
      }
    }

    if (profile?.role === "faculty") {
      return {
        navMain: [
          { title: "Dashboard", url: `${basePath}/overview`, icon: IconDashboard },
          { title: "My Courses", url: `${basePath}/courses`, icon: IconFileDescription },
          { title: "Submissions", url: `${basePath}/submissions`, icon: IconFolder },
        ],
        documents: [
          { name: "Course Reports", url: `${basePath}/reports/courses`, icon: IconReport },
        ],
        navSecondary: [
          { title: "Settings", url: `${basePath}/settings`, icon: IconSettings },
          { title: "Help", url: "#", icon: IconHelp },
        ],
      }
    }

    // default: student
    return {
      navMain: [
        { title: "Dashboard", url: `${basePath}/account`, icon: IconDashboard },
        { title: "Submit Answer Sheet", url: `${basePath}/answersheet`, icon: IconCirclePlus },
        { title: "My Submissions", url: `${basePath}/answers-list`, icon: IconFileDescription },
        { title: "My Orders", url: `${basePath}/orders-list`, icon: IconArrowsSort },
        { title: "My Subscriptions", url: `${basePath}/subscriptions`, icon: IconPaywall },
      ],
      documents: [],
      navSecondary: [
        { title: "Settings", url: `${basePath}/settings`, icon: IconSettings },
        { title: "Help", url: "#", icon: IconHelp },
      ],
    }
  }, [profile?.role, basePath])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href={basePath || "/"}>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">UPSC Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
