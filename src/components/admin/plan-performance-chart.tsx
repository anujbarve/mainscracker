// src/components/charts/PlanPerformancePieChart.tsx
"use client";

import * as React from "react";
import { Pie, PieChart, Label, ResponsiveContainer } from "recharts";
import { useAdminStore } from "@/stores/admin";
import { PieChart as PieChartIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

export function PlanPerformancePieChart() {
  const { planPerformanceData, loading, fetchPlanPerformance } = useAdminStore();
  const [dataType, setDataType] = React.useState<"total_revenue" | "purchase_count">("total_revenue");

  React.useEffect(() => {
    fetchPlanPerformance(90);
  }, [fetchPlanPerformance]);

  const { chartData, chartConfig, totalValue } = React.useMemo(() => {
    if (!planPerformanceData) {
      return { chartData: [], chartConfig: {}, totalValue: 0 };
    }
    const chartColors = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"];

    const data = planPerformanceData.map((plan, index) => ({
      ...plan,
      fill: `var(${chartColors[index % chartColors.length]})`,
    }));

    const config: ChartConfig = data.reduce((acc, plan) => {
      acc[plan.plan_name] = {
        label: plan.plan_name,
        color: plan.fill,
      };
      return acc;
    }, {} as ChartConfig);

    const total = data.reduce((acc, curr) => acc + (curr[dataType] || 0), 0);

    return { chartData: data, chartConfig: config, totalValue: total };
  }, [planPerformanceData, dataType]);

  if (loading.planPerformance) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-56" />
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center pb-0">
          <Skeleton className="h-[250px] w-[250px] rounded-full" />
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <ChartContainer config={chartConfig}>
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Plan Performance</CardTitle>
          <CardDescription>Last 90 Days</CardDescription>
        </CardHeader>

        {chartData.length === 0 ? (
          <CardContent className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <PieChartIcon className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No plan data available for this period.
            </p>
          </CardContent>
        ) : (
          <>
            <CardContent className="flex-1 pb-0">
              <div className="mx-auto aspect-square max-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={chartData}
                      dataKey={dataType}
                      nameKey="plan_name"
                      innerRadius={60} // donut hole
                      strokeWidth={5}
                    >
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="fill-foreground text-xl font-bold"
                                >
                                  {totalValue.toLocaleString()}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 20}
                                  className="fill-muted-foreground text-xs"
                                >
                                  {dataType === "total_revenue" ? "Revenue" : "Purchases"}
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>

            <CardFooter className="flex-col gap-4 text-sm">
              <div className="flex w-full items-center justify-center gap-2 font-medium leading-none">
                <button
                  data-active={dataType === "total_revenue"}
                  className="rounded-md p-2 px-3 data-[active=true]:bg-muted"
                  onClick={() => setDataType("total_revenue")}
                >
                  By Revenue
                </button>
                <button
                  data-active={dataType === "purchase_count"}
                  className="rounded-md p-2 px-3 data-[active=true]:bg-muted"
                  onClick={() => setDataType("purchase_count")}
                >
                  By Purchases
                </button>
              </div>
              <ChartLegend content={<ChartLegendContent nameKey="plan_name" />} />
            </CardFooter>
          </>
        )}
      </Card>
    </ChartContainer>
  );
}
