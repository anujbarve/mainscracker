"use client"

import * as React from "react"
import { Coins } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useAdminStore } from "@/stores/admin" // 1. Import the store

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

// 2. Update chartConfig for credit economy data
const chartConfig = {
  purchased: {
    label: "Purchased",
    color: "var(--chart-1)",
  },
  consumed: {
    label: "Consumed",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartAreaLegend() {
  // 3. Connect to the store for credit economy data
  const { creditEconomyData, loading, fetchCreditEconomyData } = useAdminStore()

  // 4. Fetch data on component mount
  React.useEffect(() => {
    fetchCreditEconomyData(90)
  }, [fetchCreditEconomyData])

  // 5. Calculate totals for the footer
  const totals = React.useMemo(() => {
    return creditEconomyData.reduce(
      (acc, curr) => {
        acc.purchased += curr.purchased
        acc.consumed += curr.consumed
        return acc
      },
      { purchased: 0, consumed: 0 }
    )
  }, [creditEconomyData])

  // 6. Handle the loading state
  if (loading.creditEconomy) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="aspect-video w-full" />
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Credit Economy Activity</CardTitle>
        <CardDescription>
          Showing total credits purchased and consumed for the last 90 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          {creditEconomyData.length === 0 ? (
            // 7. Handle the empty state
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 text-center">
              <Coins className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No credit data available for this period.
              </p>
            </div>
          ) : (
            <AreaChart
              accessibilityLayer
              data={creditEconomyData} // 8. Use credit economy data
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="period_start" // 9. Use date for the X-axis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              {/* 10. Update Area components and re-add stackId */}
              <Area
                dataKey="consumed"
                type="natural"
                fill="var(--color-consumed)"
                fillOpacity={0.4}
                stroke="var(--color-consumed)"
                stackId="a"
              />
              <Area
                dataKey="purchased"
                type="natural"
                fill="var(--color-purchased)"
                fillOpacity={0.4}
                stroke="var(--color-purchased)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          )}
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {totals.purchased.toLocaleString()} credits purchased
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {totals.consumed.toLocaleString()} credits consumed
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}