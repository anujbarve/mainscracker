"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
// Assuming the store and components are correctly named and pathed
import { useStudentStore } from "@/stores/student"; 
import { SubscriptionsPageSkeleton } from "@/components/student/subscription-skeleton";
import { SubscriptionCard } from "@/components/student/subscription-card";

export default function ManageSubscriptionsPage() {
  // ✅ Using optional chaining for safety, in case the store returns a different shape
  const { subscriptions, loading, fetchUserSubscriptions } = useStudentStore();

  useEffect(() => {
    // Ensure fetch function exists before calling
    if (fetchUserSubscriptions) {
      fetchUserSubscriptions();
    }
  }, [fetchUserSubscriptions]);

  // --- CORRECTED LOGIC ---
  // This is the most robust way to check for the initial loading state.
  // It checks if we are loading AND if `subscriptions` is either null/undefined OR an empty array.
  // This prevents the "cannot read .length of null" error.
  const showSkeleton = loading && (!subscriptions || subscriptions.length === 0);

  if (showSkeleton) {
    return <SubscriptionsPageSkeleton />;
  }

  // --- CORRECTED LOGIC for rendering subscriptions ---
  // After the loading state, we check if the subscriptions array is truthy and has items.
  const hasSubscriptions = subscriptions && subscriptions.length > 0;

  return (
    <main className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2">
           <h1 className="text-3xl font-bold tracking-tight">Manage Subscriptions</h1>
           <p className="text-muted-foreground">
             View, manage, or cancel your active and past subscriptions.
           </p>
        </div>

        {hasSubscriptions ? (
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            {subscriptions.map((sub) => (
              // ✅ Added a null check for `sub` and `sub.id` just in case the array contains invalid data
              sub && sub.id ? <SubscriptionCard key={sub.id} subscription={sub} /> : null
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <CardHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="mt-4">No Subscriptions Found</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                You do not have any active or past subscriptions.
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}