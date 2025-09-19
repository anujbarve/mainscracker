// src/components/charts/RevenueOverTimeChart.tsx
"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { useAdminStore } from "@/stores/admin"; // Adjust path as needed

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton"; // For loading state

// 1. Define the chart configuration with our new data keys
const chartConfig = {
    revenue: {
        label: "Revenue",
        color: "var(--chart-3)", // Added color for revenue
    },
    recurring: {
        label: "Recurring",
        color: "var(--chart-1)", // Example color
    },
    one_time: {
        label: "One-Time",
        color: "var(--chart-2)", // Example color
    },
} satisfies ChartConfig;

export function RevenueOverTimeChart() {
    // 2. Connect the component to the Zustand store
    const { revenueData, loading, error, fetchRevenueData } = useAdminStore();

    const [activeChart, setActiveChart] =
        React.useState<keyof typeof chartConfig>("recurring");

    // 3. Fetch data when the component mounts
    React.useEffect(() => {
        // Fetch daily data for the last 90 days
        fetchRevenueData('daily', 90);
    }, [fetchRevenueData]);

    // 4. Transform the data and calculate totals
    const chartData = React.useMemo(() => {
        return revenueData.map(item => ({
            date: item.period_start,
            recurring: item.recurring,
            one_time: item.one_time,
        }));
    }, [revenueData]);

    const total = React.useMemo(
        () => ({
            recurring: chartData.reduce((acc, curr) => acc + curr.recurring, 0),
            one_time: chartData.reduce((acc, curr) => acc + curr.one_time, 0),
        }),
        [chartData]
    );

    // 5. Handle loading and error states
    if (loading.revenueData) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                    <CardDescription>Could not load revenue data.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive">{error}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-4">
                    <CardTitle>Revenue Over Time</CardTitle>
                    <CardDescription>
                        Showing daily revenue for the last 90 days
                    </CardDescription>
                </div>
                {/* 6. Update the interactive buttons */}
                <div className="flex">
                    {(["recurring", "one_time"] as const).map((key) => (
                        <button
                            key={key}
                            data-active={activeChart === key}
                            className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left data-[active=true]:bg-muted/50 even:border-l sm:border-l sm:border-t-0"
                            onClick={() => setActiveChart(key)}
                        >
                            <span className="text-xs text-muted-foreground">
                                {chartConfig[key].label}
                            </span>
                            <span className="text-lg font-bold leading-none sm:text-3xl">
                                {total[key].toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "INR", // Or your default currency
                                    minimumFractionDigits: 0,
                                })}
                            </span>
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                // Adjust for potential timezone offset issues
                                const userTimezoneOffset = date.getTimezoneOffset() * 60000;
                                return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                });
                            }}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    nameKey="revenue"
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        });
                                    }}
                                    formatter={(value) =>
                                        value.toLocaleString("en-US", {
                                            style: "currency",
                                            currency: "INR", // Or your default currency
                                            minimumFractionDigits: 2,
                                        })
                                    }
                                />
                            }
                        />
                        {/* 7. Dynamically render the active bar */}
<Bar
              dataKey={activeChart}
              fill={chartConfig[activeChart].color}
              radius={4}
            />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
