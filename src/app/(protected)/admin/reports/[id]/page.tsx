"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAdminStore } from "@/stores/admin";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Download } from "lucide-react";

// Charting Components
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";

// =============================================================================
// REUSABLE CHART COMPONENTS (fed by the report's stored data)
// =============================================================================

const RevenueChart = ({ data }: { data: any[] }) => {
    if (!data) return null;
    const chartData = data.map(d => ({
        ...d,
        period_start: format(parseISO(d.period_start), "MMM d"),
    }));
    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
                <XAxis dataKey="period_start" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                <Tooltip
                    contentStyle={{ background: "var(--background)", borderColor: "var(--border)" }}
                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                />
                <Area type="monotone" dataKey="total_revenue" name="Revenue" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
            </AreaChart>
        </ResponsiveContainer>
    );
};

const PlanPerformanceChart = ({ data }: { data: any[] }) => {
    if (!data) return null;
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="#888888" fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="plan_name" stroke="#888888" fontSize={12} width={150} />
                <Tooltip
                    contentStyle={{ background: "var(--background)", borderColor: "var(--border)" }}
                    cursor={{ fill: 'var(--accent)' }}
                />
                <Bar dataKey="purchase_count" name="Total Purchases" fill="var(--primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function ReportDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const { currentReport, fetchReportById, loading } = useAdminStore();
    const reportContentRef = React.useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = React.useState(false);

    React.useEffect(() => { 
        if (id) {
            fetchReportById(id);
        }
    }, [id, fetchReportById]);

    
    if (loading.currentReport || !currentReport) {
        return (
            <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
                <Skeleton className="h-10 w-3/4" />
                <div className="space-y-6">
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-80 w-full" />
                </div>
            </div>
        );
    }

    const { name, parameters, data, generated_at } = currentReport;

    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{name}</h2>
                    <p className="text-muted-foreground">
                        Report for {format(parseISO(parameters.startDate), "dd MMM")} - {format(parseISO(parameters.endDate), "dd MMM, yyyy")}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild><Link href="/admin/reports"><ChevronLeft className="mr-2 h-4 w-4" /> Back to Reports</Link></Button>
                </div>
            </div>

            {/* This is the div that will be exported to PDF */}
            <div ref={reportContentRef} className="bg-background space-y-6 pt-4">
                
                {/* Dynamically render modules based on the report's stored data */}
                {data.revenueTrend && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue & Sales Trends</CardTitle>
                            <CardDescription>Daily revenue for the selected period.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RevenueChart data={data.revenueTrend} />
                        </CardContent>
                    </Card>
                )}

                {data.planPerformance && (
                     <Card>
                        <CardHeader>
                            <CardTitle>Plan Performance</CardTitle>
                            <CardDescription>A breakdown of total purchases for each active plan.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PlanPerformanceChart data={data.planPerformance} />
                        </CardContent>
                    </Card>
                )}

                {/* You can add more conditional rendering for other modules here */}

            </div>
        </div>
    );
}