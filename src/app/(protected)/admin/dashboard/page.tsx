"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAdminStore } from "@/stores/admin";
import { StudentSignupsChart } from "@/components/admin/student-signup-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, Users, BookCopy, FileCheck, DollarSign } from "lucide-react";
// ✅ ADDED: More date-fns helpers for daily calculations
import { format, parseISO, subDays, eachDayOfInterval } from 'date-fns';
// ✅ ADDED: Tabs component for time range selection
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


// Helper function to format dates
const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), "dd MMM, yyyy");
  } catch (error) {
    return "Invalid Date";
  }
};

export default function AdminDashboardPage() {
  const {
    dashboardStats,
    students,
    answers,
    loading,
    fetchDashboardStats,
    fetchStudents,
    fetchAnswers,
  } = useAdminStore();

  // ✅ ADDED: State to manage the selected time range for the chart
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    fetchDashboardStats();
    fetchStudents();
    fetchAnswers('pending_assignment');
  }, [fetchDashboardStats, fetchStudents, fetchAnswers]);

  // ✅ REWRITTEN: This memoized calculation now processes daily signups based on the selected time range
  const dailySignupsChartData = useMemo(() => {
    if (!students) return [];

    const now = new Date();
    const daysToSubtract = parseInt(timeRange);
    const startDate = subDays(now, daysToSubtract - 1); // e.g., for 30 days, go back 29 days

    // 1. Create a complete interval of dates to ensure days with 0 signups are shown
    const dateInterval = eachDayOfInterval({ start: startDate, end: now });
    const dailyCounts = new Map<string, number>();
    dateInterval.forEach(day => {
      const formattedDate = format(day, 'dd MMM');
      dailyCounts.set(formattedDate, 0);
    });

    // 2. Filter students within the time range and aggregate by day
    students
      .filter(student => parseISO(student.created_at) >= startDate)
      .forEach(student => {
        const signupDate = format(parseISO(student.created_at), 'dd MMM');
        if (dailyCounts.has(signupDate)) {
          dailyCounts.set(signupDate, dailyCounts.get(signupDate)! + 1);
        }
      });

    // 3. Convert the map to the format Recharts expects
    return Array.from(dailyCounts.entries()).map(([date, count]) => ({
      date,
      "New Students": count,
    }));
  }, [students, timeRange]); // Re-calculates when students or timeRange changes

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Section 1: KPI Cards - No changes here */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading.dashboard || !dashboardStats ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{dashboardStats.total_students}</div>}
            <p className="text-xs text-muted-foreground">All active student accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Faculty</CardTitle>
            <BookCopy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading.dashboard || !dashboardStats ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{dashboardStats.total_faculty}</div>}
            <p className="text-xs text-muted-foreground">Available for evaluations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Answers</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading.dashboard || !dashboardStats ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{dashboardStats.pending_answers}</div>}
            <p className="text-xs text-muted-foreground">Awaiting assignment/evaluation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (30d)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading.dashboard || !dashboardStats ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">₹{dashboardStats.total_revenue_last_30d.toLocaleString()}</div>}
            <p className="text-xs text-muted-foreground">Based on successful orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Chart and Recent Activity Table */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* ✅ MODIFIED: The chart card is now wrapped in a Tabs component */}
        <div className="col-span-1 lg:col-span-4">
           <StudentSignupsChart />
        </div>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Pending Answersheets</CardTitle>
              <CardDescription>
                Top 5 answers needing assignment or evaluation.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/admin/answersheets">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading.answers ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Subject</TableHead><TableHead className="text-right">Submitted</TableHead></TableRow></TableHeader>
                <TableBody>
                  {answers?.slice(0, 5).map((answer) => (
                    <TableRow key={answer.id}>
                      <TableCell><div className="font-medium">{answer.student?.full_name || 'N/A'}</div></TableCell>
                      <TableCell>{answer.subjects?.name || 'N/A'}</TableCell>
                      <TableCell className="text-right">{formatDate(answer.submitted_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}