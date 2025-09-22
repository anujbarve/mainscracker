"use client";

import * as React from "react";
import Link from "next/link";
import { useAdminStore, Report } from "@/stores/admin";
import { format, parseISO } from "date-fns";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export default function ReportsPage() {
    const { reports, fetchReports, loading } = useAdminStore();

    React.useEffect(() => { fetchReports(); }, [fetchReports]);

    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
                {/* ✅ MODIFIED: Button is now a Link to the new page */}
                <Button asChild>
                    <Link href="/admin/reports/new">
                        <PlusCircle className="mr-2 h-4 w-4"/> Generate New Report
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Generated Reports</CardTitle>
                    <CardDescription>View past reports or generate a new one.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Date Range</TableHead>
                                <TableHead className="text-right">Generated At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading.reports ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-5 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : reports?.length ? (
                                reports.map((report: Report) => (
                                    <TableRow key={report.id}>
                                        <TableCell><Link className="font-medium text-primary hover:underline" href={`/admin/reports/${report.id}`}>{report.name}</Link></TableCell>
                                        <TableCell>{format(parseISO(report.parameters.startDate), "dd MMM yyyy")} - {format(parseISO(report.parameters.endDate), "dd MMM yyyy")}</TableCell>
                                        <TableCell className="text-right">{format(parseISO(report.generated_at), "dd MMM yyyy, hh:mm a")}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                               <TableRow><TableCell colSpan={3} className="h-24 text-center">No reports generated yet.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}