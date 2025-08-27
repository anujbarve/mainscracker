"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Calendar, Repeat, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils"; // We'll add these helpers
import { SubscriptionWithPlan } from "@/stores/types";
import { useStudentStore } from "@/stores/student";

interface SubscriptionCardProps {
  subscription: SubscriptionWithPlan;
}

const statusConfig = {
    active: {
        label: "Active",
        className: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
        icon: <CheckCircle className="mr-1.5 h-4 w-4" />,
    },
    canceled: {
        label: "Canceled",
        className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
        icon: <XCircle className="mr-1.5 h-4 w-4" />,
    },
    past_due: {
        label: "Past Due",
        className: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
        icon: <AlertTriangle className="mr-1.5 h-4 w-4" />,
    },
    unpaid: {
        label: "Unpaid",
        className: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
        icon: <AlertTriangle className="mr-1.5 h-4 w-4" />,
    }
};

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const { cancelSubscription, loading } = useStudentStore();
  const plan = subscription.plans;
  const statusInfo = statusConfig[subscription.status] || statusConfig.canceled;
  
  if (!plan) return null; // Or render a fallback card

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle>{plan.name} Plan</CardTitle>
            <Badge variant="outline" className={cn("flex items-center text-sm", statusInfo.className)}>
                {statusInfo.icon}
                {statusInfo.label}
            </Badge>
        </div>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center text-3xl font-bold">
            {formatCurrency(plan.price)}
            <span className="ml-1.5 text-sm font-normal text-muted-foreground">
                / {plan.interval}
            </span>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center">
                <Repeat className="mr-2 h-4 w-4" />
                <span>Renews on {formatDate(subscription.current_period_end)}</span>
            </div>
            <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Subscribed on {formatDate(subscription.created_at)}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter>
        {subscription.status === "active" && (
           <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" disabled={loading}>
                 {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                 Cancel Subscription
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will cancel your subscription at the end of the current billing period on {formatDate(subscription.current_period_end)}. You will retain access until then.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Go Back</AlertDialogCancel>
                <AlertDialogAction onClick={() => cancelSubscription(subscription.id)}>
                  Yes, Cancel Subscription
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {subscription.status === "canceled" && (
            <p className="w-full text-center text-sm text-muted-foreground">
                Access ends on {formatDate(subscription.current_period_end)}.
            </p>
        )}
      </CardFooter>
    </Card>
  );
}