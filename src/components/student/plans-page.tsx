"use client";

import { useEffect, useState } from "react";
import { useStudentStore, Plan } from "@/stores/student";

// Shadcn UI & Icons
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner"; // Using sonner from your store example

// --- Main Page Component ---
export default function PlansPage() {
  const {
    plans,
    loading,
    fetchPlans,
    purchasePlan,
    subscriptions,
    fetchUserSubscriptions,
  } = useStudentStore();
  // State to track which specific plan is being purchased
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    fetchUserSubscriptions();
  }, [fetchPlans, fetchUserSubscriptions]);

const handlePurchase = async (planId: string) => {
    setPurchasingId(planId);
    try {
      // The store's purchasePlan action now returns a promise
      // that resolves on success or rejects on failure/dismissal.
      await purchasePlan(planId);
      // Success is handled by the store's 'handler'
    } catch (error: any) {
      // Failure is handled by the store's 'ondismiss' or 'payment.failed'
      console.error("Purchase flow failed or was cancelled:", error.message);
    } finally {
      setPurchasingId(null); // Reset loading state
    }
  };

  const activeSubscription = subscriptions?.find(
    (sub) => sub.status === "active"
  );

  // Main loading state for the whole page
  if (loading && !plans) {
    return <PlansPageSkeleton />;
  }

  // State for when no plans are available
  if (!plans || plans.length === 0) {
    return (
      <main className="w-full min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">No Plans Available</h1>
          <p className="text-muted-foreground mt-2">
            Please check back later or contact support.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Select a plan that best fits your learning needs and goals.
          </p>
        </div>

        {/* Responsive Grid for Plan Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isPurchasing={purchasingId === plan.id}
              onPurchase={() => handlePurchase(plan.id)}
              hasActiveSubscription={!!activeSubscription}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

// --- Helper Components ---

// A dedicated component for rendering a single plan card
const PlanCard = ({
  plan,
  isPurchasing,
  onPurchase,
  hasActiveSubscription
}: {
  plan: Plan; // ✅ This now uses the imported Plan type
  isPurchasing: boolean;
  onPurchase: () => void;
  hasActiveSubscription: boolean;
}) => {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: plan.currency || "INR",
  }).format(plan.price); // This correctly formats the price from your schema (e.g., 100.00)

  const isRecurring = plan.type === "recurring";
  const isDisabled = isPurchasing || (isRecurring && hasActiveSubscription);
  const buttonText = isPurchasing
    ? "Processing..."
    : isRecurring && hasActiveSubscription
    ? "Subscription Active" // New text
    : "Purchase Plan";

  return (
    <Card className="flex flex-col shadow-md hover:shadow-xl transition-shadow">
      {/* ... (CardHeader and CardContent are unchanged) */}
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <div className="my-4">
          <span className="text-5xl font-extrabold">{formattedPrice}</span>
          <span className="text-muted-foreground">
            {plan.type === "recurring" ? "/ month" : " (one-time)"}
          </span>
        </div>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          <FeatureListItem text={`${plan.gs_credits_granted} General Credits`} />
          <FeatureListItem text={`${plan.specialized_credits_granted} Specialized Credits`} />
          <FeatureListItem text={`${plan.mentorship_credits_granted} Mentorship Credits`} />
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={onPurchase}
          disabled={isDisabled} // ✅ 9. Use new disabled logic
        >
          {isPurchasing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {buttonText} {/* ✅ 10. Use new button text */}
        </Button>
      </CardFooter>
    </Card>
  );
};

const FeatureListItem = ({ text }: { text: string }) => (
  <li className="flex items-center">
    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 mr-3">
      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
    </div>
    <span className="text-sm text-muted-foreground">{text}</span>
  </li>
);

// --- Skeleton Component ---
function PlansPageSkeleton() {
  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Skeleton for Header */}
        <div className="text-center mb-12">
          <Skeleton className="h-10 w-1/3 mx-auto" />
          <Skeleton className="h-6 w-2/3 mx-auto mt-4" />
        </div>
        {/* Skeleton for Plan Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="items-center">
                <Skeleton className="h-7 w-2/5" />
                <Skeleton className="h-12 w-1/2 my-4" />
                <Skeleton className="h-5 w-full" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}