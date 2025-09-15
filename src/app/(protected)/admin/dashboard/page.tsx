"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useAdminStore } from "@/stores/admin";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
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
import { format, parseISO } from 'date-fns';

// Helper function to format dates
const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), "dd MMM, yyyy");
  } catch (error) {
    return "Invalid Date";
  }
};

export default function AdminDashboardPage() {
  // 1. Connect to the Zustand store and get ALL necessary data and functions
  const {
    dashboardStats,
    students,
    answers,
    loading,
    fetchDashboardStats,
    fetchStudents,
    fetchAnswers,
  } = useAdminStore();

  // 2. Fetch all required data when the component mounts
  useEffect(() => {
    // We call all the functions needed to populate the dashboard
    fetchDashboardStats();
    fetchStudents();
    fetchAnswers('pending_assignment'); // Specifically fetch pending answers for the actionable table
  }, [fetchDashboardStats, fetchStudents, fetchAnswers]); // Dependencies for useEffect

  // 3. Process student data to create a "non-dummy" chart
  // This memoized calculation runs only when the 'students' data changes
  const newStudentsChartData = useMemo(() => {
    if (!students) return [];

    const monthlySignups = students.reduce((acc, student) => {
      const month = format(parseISO(student.created_at), 'MMM yyyy');
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month]++;
      return acc;
    }, {} as Record<string, number>);

    // Convert to the format Recharts expects and sort by date
    return Object.entries(monthlySignups)
      .map(([month, count]) => ({
        month,
        "New Students": count,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6); // Show last 6 months
  }, [students]);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Section 1: KPI Cards - Powered by fetchDashboardStats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading.dashboard || !dashboardStats ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">{dashboardStats.total_students}</div>
            )}
            <p className="text-xs text-muted-foreground">All active student accounts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Faculty</CardTitle>
            <BookCopy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading.dashboard || !dashboardStats ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">{dashboardStats.total_faculty}</div>
            )}
            <p className="text-xs text-muted-foreground">Available for evaluations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Answers</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading.dashboard || !dashboardStats ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">{dashboardStats.pending_answers}</div>
            )}
            <p className="text-xs text-muted-foreground">Awaiting assignment/evaluation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (30d)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading.dashboard || !dashboardStats ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold">₹{dashboardStats.total_revenue_last_30d.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground">Based on successful orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Chart and Recent Activity Table */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>New Student Signups</CardTitle>
            <CardDescription>Monthly new student registrations.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {loading.students ? (
               <div className="flex h-[350px] w-full items-center justify-center">
                 <Skeleton className="h-full w-full" />
               </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={newStudentsChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                  <Legend />
                  <Bar dataKey="New Students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

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
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {answers?.slice(0, 5).map((answer) => (
                    <TableRow key={answer.id}>
                      <TableCell>
                        <div className="font-medium">{answer.student?.full_name || 'N/A'}</div>
                      </TableCell>
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