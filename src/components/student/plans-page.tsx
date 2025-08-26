"use client";

import { useEffect, useState } from "react";
import { useStudentStore } from "@/stores/student"; // Make sure path is correct

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
  const { plans, loading, fetchPlans, purchasePlan } = useStudentStore();
  // State to track which specific plan is being purchased
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch plans when the component mounts
    fetchPlans();
  }, [fetchPlans]);

  const handlePurchase = async (planId: string) => {
    setPurchasingId(planId);
    try {
      await purchasePlan(planId);
      // The toast success message is handled inside the store
    } catch (error: any) {
      // The toast error message is also handled in the store, but you could add more here
      console.error("Purchase failed:", error);
    } finally {
      setPurchasingId(null); // Reset loading state for the button
    }
  };

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
            />
          ))}
        </div>
      </div>
    </main>
  );
}

// --- Helper Components ---

// Type for a single Plan object (adjust if your schema is different)
type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  gs_credits_granted: number;
  specialized_credits_granted: number;
  mentorship_credits_granted: number;
};

// A dedicated component for rendering a single plan card
const PlanCard = ({
  plan,
  isPurchasing,
  onPurchase,
}: {
  plan: Plan;
  isPurchasing: boolean;
  onPurchase: () => void;
}) => {
  // Assuming price is in cents, format it to a currency string
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: plan.currency || "USD",
  }).format(plan.price / 100);

  return (
    <Card className="flex flex-col shadow-md hover:shadow-xl transition-shadow">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <div className="my-4">
          <span className="text-5xl font-extrabold">{formattedPrice}</span>
          <span className="text-muted-foreground">/ month</span>
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
          disabled={isPurchasing}
        >
          {isPurchasing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPurchasing ? "Processing..." : "Purchase Plan"}
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