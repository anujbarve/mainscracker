"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStudentStore, Notification, NotificationType } from "@/stores/student";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// --- Icons ---
import {
  IconShoppingCart,
  IconBook,
  IconChecks,
  IconUserCircle,
  IconAlertTriangle,
  IconCalendarDue,
  IconAdjustments,
  IconMailOpened,
  IconBellCheck,
} from "@tabler/icons-react";

// --- Helper: Formats time into a user-friendly string ---
function formatTimeAgo(dateString: string) {
  // ... (no changes here)
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)} years ago`;
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)} months ago`;
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)} days ago`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)} hours ago`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)} minutes ago`;
  return "just now";
}

// --- Config: Maps notification types to icons and navigation paths ---
const notificationConfig: Record<
  NotificationType,
  { icon: React.ElementType; getHref: (data: any) => string }
> = {
  // ... (no changes here)
  purchase_successful: {
    icon: IconShoppingCart,
    getHref: (data) => `/student/orders-list/${data?.order_id || ""}`,
  },
  answer_assigned: {
    icon: IconBook,
    getHref: (data) => `/student/answers-list/${data?.answer_id || ""}`,
  },
  answer_evaluated: {
    icon: IconChecks,
    getHref: (data) => `/student/answers-list/${data?.answer_id || ""}`,
  },
  mentorship_scheduled: {
    icon: IconUserCircle,
    getHref: () => `/student/mentorship-list`,
  },
  credit_low: {
    icon: IconAlertTriangle, // A warning icon is appropriate
    getHref: () => `/student/plans`, // Direct user to buy more credits
  },
  subscription_expiring: {
    icon: IconCalendarDue, // An icon related to time/deadlines
    getHref: () => `/student/subscriptions`, // Direct user to manage subscriptions
  },
  admin_credit_adjustment: {
    icon: IconAdjustments, // An icon representing manual change/adjustment
    getHref: () => `/student/orders-list`, // A general link to their billing history
  },
};

// --- Sub-Component: Renders a single notification item ---
const NotificationItem = ({ notification }: { notification: Notification }) => {
  // ... (no changes to this component)
  const router = useRouter();
  const markAsRead = useStudentStore((s) => s.markNotificationAsRead);

  const config = notificationConfig[notification.type];
  const Icon = config.icon;
  const href = config.getHref(notification.data);

  const handleClick = () => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    router.push(href);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex cursor-pointer items-start gap-4 rounded-lg border border-transparent p-4 transition-colors hover:border-border hover:bg-accent",
        !notification.is_read && "bg-primary/5"
      )}
    >
      <div className={cn("mt-1 flex-shrink-0 rounded-full p-2", !notification.is_read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
        <Icon className="size-5" />
      </div>
      <div className="flex-grow">
        <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <p className="font-semibold text-sm">{notification.title}</p>
          <p className="flex-shrink-0 text-xs text-muted-foreground">
            {formatTimeAgo(notification.created_at)}
          </p>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
      </div>
    </div>
  );
};


// --- Main Page Component ---
export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    notifications,
    unreadNotificationCount,
    loading,
    fetchUserNotifications,
    markAllNotificationsAsRead,
  } = useStudentStore();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    fetchUserNotifications({ force: true });
  }, [user, fetchUserNotifications, router]);

  const showLoader = loading && !notifications;

  return (
    // ✅ Main wrapper with responsive padding for a full-width feel
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      {/* ✅ Responsive Page Header */}
      <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-1 text-muted-foreground">
            {unreadNotificationCount > 0
              ? `You have ${unreadNotificationCount} unread messages.`
              : "You are all caught up."}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={markAllNotificationsAsRead}
          disabled={unreadNotificationCount === 0}
          className="w-full sm:w-auto" // Full width on mobile, auto on larger screens
        >
          <IconMailOpened className="mr-2 size-4" />
          Mark all as read
        </Button>
      </div>

      <Separator />

      {/* ✅ Content Area */}
      <div className="mt-6">
        {showLoader ? (
          // Skeleton Loader
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48 sm:w-64" />
                  <Skeleton className="h-4 w-64 sm:w-80" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications && notifications.length > 0 ? (
          // List of Notifications
          <div className="space-y-2">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </div>
        ) : (
          // Empty State
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed text-center text-muted-foreground">
            <IconBellCheck className="size-12" />
            <h3 className="text-xl font-semibold">All caught up!</h3>
            <p>You have no new notifications.</p>
          </div>
        )}
      </div>
    </main>
  );
}