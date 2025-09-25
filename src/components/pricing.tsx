'use client'

import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
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

const plans = [
  {
    name: 'Starter',
    price: '₹0 / mo',
    description: 'For exploring the platform',
    features: [
      "1 Mock Test Submission / month",
      "Access to Basic Dashboard",
      "Standard Evaluation (3–5 days)",
      "Email Support",
    ],
    isPopular: false,
    cta: 'Get Started',
  },
  {
    name: 'Pro Aspirant',
    price: '₹499 / mo',
    description: 'Best for consistent writing practice',
    features: [
      "Up to 10 Mock Submissions / month",
      "Priority Evaluation (within 48 hrs)",
      "Detailed Faculty Feedback",
      "Progress Tracking Dashboard",
      "Expert Tips & Comments",
      "Email + Chat Support",
    ],
    isPopular: true,
    cta: 'Subscribe Now',
  },
  {
    name: 'UPSC Intensive',
    price: '₹999 / mo',
    description: 'For serious aspirants with daily targets',
    features: [
      "Unlimited Mock Submissions",
      "Fastest Evaluation (24–36 hrs)",
      "One-on-One Feedback Sessions",
      "Personalized Improvement Plan",
      "Exclusive Mentor Access",
      "Early Access to New Features",
    ],
    isPopular: false,
    cta: 'Join Now',
  },
    {
    name: 'UPSC Intensive2',
    price: '₹999 / mo',
    description: 'For serious aspirants with daily targets',
    features: [
      "Unlimited Mock Submissions",
      "Fastest Evaluation (24–36 hrs)",
      "One-on-One Feedback Sessions",
      "Personalized Improvement Plan",
      "Exclusive Mentor Access",
      "Early Access to New Features",
    ],
    isPopular: false,
    cta: 'Join Now',
  },
      {
    name: 'UPSC Intensive3',
    price: '₹999 / mo',
    description: 'For serious aspirants with daily targets',
    features: [
      "Unlimited Mock Submissions",
      "Fastest Evaluation (24–36 hrs)",
      "One-on-One Feedback Sessions",
      "Personalized Improvement Plan",
      "Exclusive Mentor Access",
      "Early Access to New Features",
    ],
    isPopular: false,
    cta: 'Join Now',
  },
        {
    name: 'UPSC Intensive4',
    price: '₹999 / mo',
    description: 'For serious aspirants with daily targets',
    features: [
      "Unlimited Mock Submissions",
      "Fastest Evaluation (24–36 hrs)",
      "One-on-One Feedback Sessions",
      "Personalized Improvement Plan",
      "Exclusive Mentor Access",
      "Early Access to New Features",
    ],
    isPopular: false,
    cta: 'Join Now',
  },
];

// FIX: Add 'as const' to tell TypeScript these are literal values, not generic strings
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
} as const; // <-- Fix is here

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
} as const; // <-- And here

export default function Pricing() {
  return (
    <section id="pricing" className="py-16 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center space-y-4">
          <h1 className="text-4xl font-semibold lg:text-5xl">
            Simple Plans for Every Aspirant
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose a subscription that matches your UPSC preparation pace. All plans come with expert evaluation and actionable feedback.
          </p>
        </div>

        <motion.div
          className="mt-12 grid gap-6 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {plans.map((plan) => (
            <motion.div key={plan.name} variants={itemVariants}>
              <Card className={`flex flex-col h-full ${plan.isPopular ? 'relative border-2 border-primary' : ''}`}>
                {plan.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 px-3 py-1 text-xs font-semibold text-black shadow ring-1 ring-white/20">
                    Most Popular
                  </span>
                )}

                <CardHeader>
                  <CardTitle className="font-medium">{plan.name}</CardTitle>
                  <div className="my-2 text-2xl font-semibold">{plan.price}</div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 flex-1">
                  <hr className="border-muted border-dashed" />
                  <ul className="space-y-3 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="size-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="mt-auto">
                  {/* <Button asChild className="w-full" variant={plan.isPopular ? 'default' : 'outline'}>
                    <Link href="#">{plan.cta}</Link>
                  </Button> */}
                  <SmoothDrawer></SmoothDrawer>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}