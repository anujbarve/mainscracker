"use client"

import * as React from "react"
import { useAdminStore } from "@/stores/admin"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { format, parseISO, subDays, eachDayOfInterval } from 'date-fns'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

// 1. Chart Configuration
const chartConfig = {
  newStudents: {
    label: "New Students",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

// This component can be a separate file, e.g., components/admin/student-signups-chart.tsx
export function StudentSignupsChart() {
  const { students, loading } = useAdminStore()
  const [timeRange, setTimeRange] = React.useState<"30" | "60" | "90">("30")

  // 2. Memoized function to process data for the chart based on the selected time range
  const chartData = React.useMemo(() => {
    if (!students) return []

    const now = new Date()
    const days = parseInt(timeRange)
    const startDate = subDays(now, days - 1)

    const dateInterval = eachDayOfInterval({ start: startDate, end: now })
    const dailyCounts = new Map<string, number>()
    dateInterval.forEach(day => {
      dailyCounts.set(format(day, 'yyyy-MM-dd'), 0)
    })

    students
      .filter(student => parseISO(student.created_at) >= startDate)
      .forEach(student => {
        const signupDate = format(parseISO(student.created_at), 'yyyy-MM-dd')
        if (dailyCounts.has(signupDate)) {
          dailyCounts.set(signupDate, dailyCounts.get(signupDate)! + 1)
        }
      })

    return Array.from(dailyCounts.entries()).map(([date, count]) => ({
      date,
      "newStudents": count,
    }))
  }, [students, timeRange])

  // 3. Memoized function to calculate the total signups for each time range
  const totals = React.useMemo(() => {
    if (!students) return { "30": 0, "60": 0, "90": 0 }

    const now = new Date()
    const last30Days = subDays(now, 30)
    const last60Days = subDays(now, 60)
    const last90Days = subDays(now, 90)

    let total30 = 0
    let total60 = 0
    let total90 = 0

    students.forEach(student => {
      const signupDate = parseISO(student.created_at)
      if (signupDate >= last30Days) total30++
      if (signupDate >= last60Days) total60++
      if (signupDate >= last90Days) total90++
    })

    return { "30": total30, "60": total60, "90": total90 }
  }, [students])

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-6">
          <CardTitle>New Student Signups</CardTitle>
          <CardDescription>
            Daily new student registrations
          </CardDescription>
        </div>
        {/* 4. Interactive header to switch between time ranges */}
        <div className="flex">
          {(["30", "60", "90"] as const).map((range) => (
            <button
              key={range}
              data-active={timeRange === range}
              className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
              onClick={() => setTimeRange(range)}
            >
              <span className="text-muted-foreground text-xs">
                Last {range} Days
              </span>
              <span className="text-lg leading-none font-bold sm:text-3xl">
                {loading.students ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  totals[range].toLocaleString()
                )}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:p-6">
        {loading.students ? (
          <div className="flex h-[250px] w-full items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  // Adjust for timezone to prevent off-by-one day errors
                  const utcDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000)
                  return utcDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="newStudents"
                    labelFormatter={(value) => {
                      const date = new Date(value)
                      const utcDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000)
                      return utcDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }}
                  />
                }
              />
              <Bar
                dataKey="newStudents"
                fill="var(--color-newStudents)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}