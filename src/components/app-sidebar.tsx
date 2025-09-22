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
  IconArrowsSort,
  IconChalkboardTeacher,
  IconCalendarTime,
  IconClipboardList,
  IconLayoutDashboard,
  IconFileText,
  IconNotebook,
  IconReportAnalytics,
  IconListDetails,
  IconCreditCard
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
          { title: "Overview", url: `${basePath}/dashboard`, icon: IconLayoutDashboard },
          { title: "Manage Users", url: `${basePath}/users`, icon: IconUsers },
          { title: "Manage Answer Sheets", url: `${basePath}/answersheets`, icon: IconFileText },
          { title: "Manage Mentorship Sessions", url: `${basePath}/mentorships`, icon: IconNotebook },
          { title: "Reports", url: `${basePath}/reports`, icon: IconReportAnalytics },
          { title: "Logs", url: `${basePath}/logs`, icon: IconListDetails },
          { title: "Billing", url: `${basePath}/billing`, icon: IconCreditCard },
          { title: "System Settings", url: `${basePath}/settings`, icon: IconSettings },
        ],
        documents: [],
        navSecondary: [],
      }
    }

    if (profile?.role === "faculty") {
      return {
        navMain: [
          { title: "Dashboard", url: `${basePath}/dashboard`, icon: IconDashboard },
          { title: "Review Queue", url: `${basePath}/review`, icon: IconClipboardList },
          { title: "Mentorship", url: `${basePath}/mentorship`, icon: IconChalkboardTeacher },
        ],
        documents: [
          { name: "Course Reports", url: `${basePath}/reports/courses`, icon: IconReport },
        ],
        navSecondary: [
          { title: "Help", url: `${basePath}/help`, icon: IconHelp },
        ],
      }
    }

    // default: student
    return {
      navMain: [
        { title: "Dashboard", url: `${basePath}/dashboard`, icon: IconDashboard },
        { title: "Submit Answer Sheet", url: `${basePath}/answersheet`, icon: IconCirclePlus },
        { title: "My Submissions", url: `${basePath}/answers-list`, icon: IconFileDescription },
        { title: "My Orders", url: `${basePath}/orders-list`, icon: IconArrowsSort },
        { title: "Schedule Mentorship", url: `${basePath}/request-mentorship`, icon: IconCalendarTime },
        { title: "Mentorship Sessions", url: `${basePath}/mentorship-list`, icon: IconChalkboardTeacher },
        { title: "My Subscriptions", url: `${basePath}/subscriptions`, icon: IconPaywall },
      ],
      documents: [],
      navSecondary: [
        { title: "Help", url: `${basePath}/help`, icon: IconHelp },
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
              <a href={"/"}>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Mains Cracker</span>
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
