'use client'

import { useEffect } from "react"
import { Check, Loader2, AlertTriangle } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { motion } from "framer-motion"
import SmoothDrawer from "./kokonutui/smooth-drawer"
import { useHomepageStore } from "@/stores/homepage"
import { Plan } from "@/stores/admin"

// Helper function to create a feature list from a plan object
const generateFeatures = (plan: Plan) => {
  const features = [];
  if (plan.gs_credits_granted > 0) {
    features.push(`${plan.gs_credits_granted} General Studies Credit${plan.gs_credits_granted > 1 ? 's' : ''}`);
  }
  if (plan.specialized_credits_granted > 0) {
    features.push(`${plan.specialized_credits_granted} Specialized Credit${plan.specialized_credits_granted > 1 ? 's' : ''}`);
  }
  if (plan.mentorship_credits_granted > 0) {
    features.push(`${plan.mentorship_credits_granted} Mentorship Credit${plan.mentorship_credits_granted > 1 ? 's' : ''}`);
  }

  // You can add more static features common to all plans if you like
  features.push("Expert Faculty Evaluation");
  features.push("Actionable Feedback");

  return features;
};


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
} as const;

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
} as const;

export default function Pricing() {
  // 1. Connect to the Zustand store
  const { plans, plansLoading, plansError, fetchPlans } = useHomepageStore();

  // 2. Fetch plans when the component mounts
  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // 3. Handle Loading State
  if (plansLoading) {
    return (
      <section id="pricing" className="py-16 md:py-32 flex flex-col items-center justify-center text-center">
        <Loader2 className="size-12 animate-spin mb-4" />
        <h2 className="text-2xl font-semibold">Loading Plans...</h2>
        <p className="text-muted-foreground">Please wait a moment.</p>
      </section>
    );
  }

  // 4. Handle Error State
  if (plansError) {
    return (
      <section id="pricing" className="py-16 md:py-32 flex flex-col items-center justify-center text-center text-destructive">
        <AlertTriangle className="size-12 mb-4" />
        <h2 className="text-2xl font-semibold">Could not load plans</h2>
        <p>{plansError}</p>
      </section>
    );
  }


  return (
    <section id="pricing" className="py-16 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center space-y-4">
          <h1 className="text-4xl font-semibold lg:text-5xl">
            Simple Plans for Every Aspirant
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose a plan that matches your UPSC preparation pace. All plans come with expert evaluation and actionable feedback.
          </p>
        </div>

        <motion.div
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" // Adjusted grid for responsiveness
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* 5. Map over the dynamic 'plans' data from the store */}
          {plans.map((plan) => {
            const features = generateFeatures(plan);
            const priceDisplay = new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: plan.currency,
              minimumFractionDigits: 0,
            }).format(plan.price);
            
            return (
              <motion.div key={plan.id} variants={itemVariants}>
                <Card className="flex flex-col h-full">
                  <CardHeader>
                    <CardTitle className="font-medium">{plan.name}</CardTitle>
                    <div className="my-2">
                       <span className="text-3xl font-bold">{priceDisplay}</span>
                       <span className="text-muted-foreground text-sm">
                         {plan.type === 'one_time' ? '/one-time' : ''}
                       </span>
                    </div>
                    <CardDescription>{plan.description || 'A comprehensive package.'}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-1">
                    <hr className="border-muted border-dashed" />
                    <ul className="space-y-3 text-sm">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="size-4 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="mt-auto">
                    {/* The SmoothDrawer can be configured to handle the purchase logic */}
                    <SmoothDrawer plan={plan}></SmoothDrawer>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  );
}