"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/stores/auth";
import { useStudentStore } from "@/stores/student";

// Icons
import {
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";

// Shadcn UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Sun, Moon } from "lucide-react";

export function useBasePath() {
  const pathname = usePathname();
  if (pathname?.startsWith("/student")) return "/student";
  if (pathname?.startsWith("/faculty")) return "/faculty";
  if (pathname?.startsWith("/admin")) return "/admin";
  return ""; // default
}

export function NavUser() {
  const { isMobile } = useSidebar();
  let basePath = useBasePath();

  // Auth store state
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const logout = useAuthStore((state) => state.logout);
  const { theme, setTheme } = useTheme();

  // ✅ THE FIX: Select each piece of state individually.
  // This returns stable primitives (number, function) instead of a new object on every render.
  const unreadNotificationCount = useStudentStore((state) => state.unreadNotificationCount);
  const fetchUserNotifications = useStudentStore((state) => state.fetchUserNotifications);

  // Fetch notifications when the user is available
  useEffect(() => {
    if (user) {
      fetchUserNotifications();
    }
  }, [user, fetchUserNotifications]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const displayName = profile?.full_name || user?.email || "User";
  const displayEmail = user?.email || "No email";

  if (!user) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={""} alt={displayName} />
                <AvatarFallback className="rounded-lg">
                  {displayName?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {displayEmail}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={""} alt={displayName} />
                  <AvatarFallback className="rounded-lg">
                    {displayName?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {displayEmail}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <Link href={`${basePath}/account`}>
              <DropdownMenuItem>
                <IconUserCircle className="mr-2 size-4" />
                <span>Account</span>
              </DropdownMenuItem>
            </Link>

            <Link href={`${basePath}/notifications`}>
              <DropdownMenuItem>
                <IconNotification className="mr-2 size-4" />
                <span>Notifications</span>
                {unreadNotificationCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-auto h-5 rounded-full px-1.5 text-xs font-semibold"
                  >
                    {unreadNotificationCount}
                  </Badge>
                )}
              </DropdownMenuItem>
            </Link>

            <DropdownMenuItem onClick={toggleTheme}>
              {theme === "dark" ? (
                <Moon className="mr-2 size-4" />
              ) : (
                <Sun className="mr-2 size-4" />
              )}
              <span>Theme</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/" onClick={() => logout()}>
                <IconLogout className="mr-2 size-4" />
                <span>Log out</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}