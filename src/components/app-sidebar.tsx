"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  IconLayoutDashboard,
  IconUsers,
  IconFileText,
  IconNotebook,
  IconReportAnalytics,
  IconListDetails,
  IconCreditCard,
  IconSettings,
  IconClipboardList,
  IconHelp,
  IconPaywall,
  IconInnerShadowTop,
  IconDashboard,
  IconChalkboardTeacher,
  IconReport,
  IconCirclePlus,
  IconFileDescription,
  IconArrowsSort,
  IconCalendarTime,
} from "@tabler/icons-react"

import { NavMain, type NavItem } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { NavDocuments } from "@/components/nav-documents"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/stores/auth"

export function useBasePath() {
  const pathname = usePathname()
  if (pathname?.startsWith("/student")) return "/student"
  if (pathname?.startsWith("/faculty")) return "/faculty"
  if (pathname?.startsWith("/admin")) return "/admin"
  return "" // default
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { profile } = useAuthStore()

  // detect base path dynamically
  let basePath = useBasePath()

  // role-based navigation
  const data = React.useMemo(() => {
    if (profile?.role === "admin") {
      const navMain: NavItem[] = [
        {
          title: "Overview",
          url: `${basePath}/dashboard`,
          icon: IconLayoutDashboard,
        },
        {
          title: "Management",
          url: "#", // Parent items don't need a real URL
          icon: IconClipboardList,
          items: [
            { title: "Users", url: `${basePath}/users` },
            { title: "Answer Sheets", url: `${basePath}/answersheets` },
            { title: "Mentorships", url: `${basePath}/mentorships` },
            { title: "Support Tickets", url: `${basePath}/support` },
            { title : "Subjects", url : `${basePath}/subjects`}
          ],
        },
        {
          title: "Analytics",
          url: "#",
          icon: IconReportAnalytics,
          items: [
            { title: "Reports", url: `${basePath}/reports` },
            { title: "Audit Logs", url: `${basePath}/logs` },
          ],
        },
        {
          title: "Configuration",
          url: "#",
          icon: IconSettings,
          items: [
            { title: "Billing", url: `${basePath}/billing` },
            { title: "Plans", url: `${basePath}/plans` },
          ],
        },
      ]
      const navSecondary: NavItem[] = [
        { title: "Help", url: `${basePath}/help`, icon: IconHelp },
      ]
    return { navMain, documents: [], navSecondary }
    }

    if (profile?.role === "faculty") {
      const navMain: NavItem[] = [
        {
          title: "Dashboard",
          url: `${basePath}/dashboard`,
          icon: IconDashboard,
        },
        {
          title: "Review Queue",
          url: `${basePath}/review`,
          icon: IconClipboardList,
        },
        {
          title: "Mentorship",
          url: `${basePath}/mentorship`,
          icon: IconChalkboardTeacher,
        },
      ]
      const navSecondary: NavItem[] = [
        { title: "Help", url: `${basePath}/help`, icon: IconHelp },
      ]
      return { navMain, documents: [
        { name: "Course Reports", url: `${basePath}/reports/courses`, icon: IconReport },
        ], navSecondary }
    }

    // default: student
    const navMain: NavItem[] = [
      {
        title: "Dashboard",
        url: `${basePath}/dashboard`,
        icon: IconDashboard,
      },
      {
        title: "Submit Answer Sheet",
        url: `${basePath}/answersheet`,
        icon: IconCirclePlus,
      },
      {
        title: "My Submissions",
        url: `${basePath}/answers-list`,
        icon: IconFileDescription,
      },
      {
        title: "Mentorship",
        url: "#",
        icon: IconChalkboardTeacher,
        items: [
          {
            title: "Schedule Session",
            url: `${basePath}/request-mentorship`,
          },
          { title: "My Sessions", url: `${basePath}/mentorship-list` },
        ],
      },
      {
        title: "Billing",
        url: "#",
        icon: IconCreditCard,
        items: [
          { title: "My Orders", url: `${basePath}/orders-list` },
          { title: "My Subscriptions", url: `${basePath}/subscriptions` },
        ],
      },
    ]
    const navSecondary: NavItem[] = [
        { title: "Help", url: `${basePath}/help`, icon: IconHelp },
      ]
    return { navMain, documents: [], navSecondary }
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
        <NavDocuments items={data.documents}></NavDocuments>
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}