"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useStudentStore } from "@/stores/student";
import { OrderStatus } from "@/stores/types"; // Assuming OrderStatus is exported from your types

// Shadcn UI & Icons
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  CreditCard,
  Hash,
  Package,
  CircleDollarSign,
  ArrowLeft,
  ServerCrash,
} from "lucide-react";

// --- Helper Components ---

const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const statusConfig = {
    succeeded: { label: "Succeeded", icon: CheckCircle, color: "bg-green-400/20 text-green-600 border-green-400/30" },
    pending: { label: "Pending", icon: Clock, color: "bg-yellow-400/20 text-yellow-600 border-yellow-400/30" },
    failed: { label: "Failed", icon: XCircle, color: "bg-red-400/20 text-red-600 border-red-400/30" },
  }[status] || { label: "Unknown", icon: XCircle, color: "bg-gray-400/20 text-gray-600 border-gray-400/30" };
  
  return (
    <Badge variant="outline" className={`inline-flex items-center gap-1.5 ${statusConfig.color}`}>
      {React.createElement(statusConfig.icon, { className: "h-3.5 w-3.5" })}
      <span>{statusConfig.label}</span>
    </Badge>
  );
};

const DetailItem = ({ icon, label, children, isMono = false }: { icon: React.ElementType; label: string; children: React.ReactNode, isMono?: boolean }) => (
  <div className="flex items-start">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
      {React.createElement(icon, { className: "h-5 w-5" })}
    </div>
    <div className="ml-4 flex-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className={`text-sm font-semibold truncate ${isMono ? 'font-mono text-xs' : ''}`}>{children}</div>
    </div>
  </div>
);

// --- Main Page Component ---
export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { orders, fetchUserOrders } = useStudentStore();

  // Fetch data only if it's not already in the store
  React.useEffect(() => {
    if (!orders) {
      fetchUserOrders();
    }
  }, [orders, fetchUserOrders]);

  // Guard Clause 1: Handle the loading state
  if (!orders) {
    return <OrderDetailPageSkeleton />;
  }

  const order = orders.find((ord) => ord.id === id);

  // Guard Clause 2: Handle the "not found" state
  if (!order) {
    return (
      <main className="flex min-h-[calc(100vh-theme(spacing.16))] w-full flex-col items-center justify-center p-4 text-center">
        <ServerCrash className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Order Not Found</h1>
        <p className="text-muted-foreground">The order you are looking for does not exist or you do not have permission to view it.</p>
        <Button asChild className="mt-6">
          <Link href="/student/orders-list">Back to Billing</Link>
        </Button>
      </main>
    );
  }

  // Format currency robustly
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: order.currency.toUpperCase(),
  }).format(order.amount_paid);

  return (
    <main className="w-full min-h-[calc(100vh-theme(spacing.16))] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/student/orders-list" className="flex items-center gap-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" /> Back to Billing
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
          <p className="text-muted-foreground">
            Order placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Main content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-6 w-6" />
                  Plan Details
                </CardTitle>
                <CardDescription>
                  Details of the plan purchased in this order.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-bold text-primary">{order.plans?.name || 'Plan Not Found'}</h3>
                <p className="mt-2 text-muted-foreground">
                  {order.plans?.description || 'No description available.'}
                </p>
                <Separator className="my-6" />
                <h4 className="font-semibold mb-4">Credits Granted</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">GS Credits</p>
                    <p className="text-2xl font-bold">{order.plans?.gs_credits_granted || 0}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Specialized Credits</p>
                    <p className="text-2xl font-bold">{order.plans?.specialized_credits_granted || 0}</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground">Mentorship Credits</p>
                    <p className="text-2xl font-bold">{order.plans?.mentorship_credits_granted || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Metadata and Actions */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <DetailItem icon={Clock} label="Status">
                  <OrderStatusBadge status={order.status} />
                </DetailItem>
                <DetailItem icon={CircleDollarSign} label="Amount Paid">
                  {formattedAmount}
                </DetailItem>
                <Separator />
                <DetailItem icon={Calendar} label="Order Date">
                  {new Date(order.created_at).toLocaleString()}
                </DetailItem>
                <DetailItem icon={Hash} label="Order ID" isMono>
                  {order.id}
                </DetailItem>
                <DetailItem icon={CreditCard} label="Payment ID" isMono>
                  {order.payment_gateway_charge_id || "N/A"}
                </DetailItem>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}


// --- Skeleton Component for Loading State ---
function OrderDetailPageSkeleton() {
  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-9 w-1/3 mb-2" />
        <Skeleton className="h-5 w-1/4 mb-6" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-1/2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-12 w-full mt-2" />
                <Separator className="my-6" />
                <Skeleton className="h-6 w-1/4 mb-4" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Right Column Skeleton */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-7 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Separator />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}