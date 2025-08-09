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

export default function Pricing() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center space-y-4">
          <h1 className="text-4xl font-semibold lg:text-5xl">
            Simple Plans for Every Aspirant
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose a subscription that matches your UPSC preparation pace. All plans come with expert evaluation and actionable feedback.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {/* Free Plan */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-medium">Starter</CardTitle>
              <div className="my-2 text-2xl font-semibold">₹0 / mo</div>
              <CardDescription>For exploring the platform</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <hr className="border-muted border-dashed" />
              <ul className="space-y-3 text-sm">
                {[
                  "1 Mock Test Submission / month",
                  "Access to Basic Dashboard",
                  "Standard Evaluation (3–5 days)",
                  "Email Support",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="size-4 text-green-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="mt-auto">
              <Button asChild variant="outline" className="w-full">
                <Link href="#">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Pro Plan - Highlighted */}
          <Card className="relative flex flex-col border-2 border-primary">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 px-3 py-1 text-xs font-semibold text-black shadow ring-1 ring-white/20">
              Most Popular
            </span>

            <CardHeader>
              <CardTitle className="font-medium">Pro Aspirant</CardTitle>
              <div className="my-2 text-2xl font-semibold">₹499 / mo</div>
              <CardDescription>Best for consistent writing practice</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <hr className="border-muted border-dashed" />
              <ul className="space-y-3 text-sm">
                {[
                  "Up to 10 Mock Submissions / month",
                  "Priority Evaluation (within 48 hrs)",
                  "Detailed Faculty Feedback",
                  "Progress Tracking Dashboard",
                  "Expert Tips & Comments",
                  "Email + Chat Support",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="size-4 text-green-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="mt-auto">
              <Button asChild className="w-full">
                <Link href="#">Subscribe Now</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-medium">UPSC Intensive</CardTitle>
              <div className="my-2 text-2xl font-semibold">₹999 / mo</div>
              <CardDescription>For serious aspirants with daily targets</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <hr className="border-muted border-dashed" />
              <ul className="space-y-3 text-sm">
                {[
                  "Unlimited Mock Submissions",
                  "Fastest Evaluation (24–36 hrs)",
                  "One-on-One Feedback Sessions",
                  "Personalized Improvement Plan",
                  "Exclusive Mentor Access",
                  "Early Access to New Features",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="size-4 text-green-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter className="mt-auto">
              <Button asChild variant="outline" className="w-full">
                <Link href="#">Join Now</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}
