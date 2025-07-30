"use client"

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
            Pricing that Scales with You
          </h1>
          <p className="text-muted-foreground text-lg">
            Gemini is evolving to be more than just the models. It supports an
            entire suite of APIs and platforms helping developers and businesses
            innovate.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {/* Free Plan */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-medium">Free</CardTitle>
              <div className="my-2 text-2xl font-semibold">$0 / mo</div>
              <CardDescription>Per editor</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <hr className="border-muted border-dashed" />
              <ul className="space-y-3 text-sm">
                {[
                  "Basic Analytics Dashboard",
                  "5GB Cloud Storage",
                  "Email and Chat Support",
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
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-purple-400 to-amber-300 px-3 py-1 text-xs font-semibold text-black shadow ring-1 ring-white/20">
              Most Popular
            </span>

            <CardHeader>
              <CardTitle className="font-medium">Pro</CardTitle>
              <div className="my-2 text-2xl font-semibold">$19 / mo</div>
              <CardDescription>Per editor</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <hr className="border-muted border-dashed" />
              <ul className="space-y-3 text-sm">
                {[
                  "Everything in Free Plan",
                  "5GB Cloud Storage",
                  "Email and Chat Support",
                  "Access to Community Forum",
                  "Single User Access",
                  "Access to Basic Templates",
                  "Mobile App Access",
                  "1 Custom Report Per Month",
                  "Monthly Product Updates",
                  "Standard Security Features",
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
                <Link href="#">Get Started</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Startup Plan */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-medium">Startup</CardTitle>
              <div className="my-2 text-2xl font-semibold">$29 / mo</div>
              <CardDescription>Per editor</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <hr className="border-muted border-dashed" />
              <ul className="space-y-3 text-sm">
                {[
                  "Everything in Pro Plan",
                  "5GB Cloud Storage",
                  "Email and Chat Support",
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
        </div>
      </div>
    </section>
  )
}
