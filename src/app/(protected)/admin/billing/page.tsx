import { ChartAreaLegend } from "@/components/admin/credit-economy-chart";
import { PlanPerformancePieChart } from "@/components/admin/plan-performance-chart";
import { RevenueOverTimeChart } from "@/components/admin/revenue-chart";

export default function Page() {
  return (
    <>
      <RevenueOverTimeChart></RevenueOverTimeChart>
      <ChartAreaLegend></ChartAreaLegend>
      <PlanPerformancePieChart></PlanPerformancePieChart>
      
    </>
  )
}