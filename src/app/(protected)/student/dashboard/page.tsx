// /app/student/dashboard/page.tsx
"use client";

import * as React from "react";
import { useStudentStore } from "@/stores/student";
import { useAuthStore } from "@/stores/auth";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have a Skeleton component
import { DashboardStatCards } from "@/components/student/dashboard-stat-card";
import { RecentAnswersTable } from "@/components/student/recent-answers-table";
import { UpcomingMentorshipSessions } from "@/components/student/upcoming-mentorship-sessions";

export default function StudentDashboardPage() {
  // Get state and actions from the Zustand stores
  const {
    answers,
    mentorshipSessions,
    loading,
    error,
    fetchUserAnswers,
    fetchUserMentorshipSessions,
  } = useStudentStore();

  const { profile, refreshProfile } = useAuthStore();

  // Fetch data when the component mounts
  React.useEffect(() => {
    // Fetch everything needed for the dashboard
    refreshProfile(); // Ensures credit balances are up-to-date
    fetchUserAnswers();
    fetchUserMentorshipSessions();
  }, [fetchUserAnswers, fetchUserMentorshipSessions, refreshProfile]);

  // Handle loading state
 if (loading && !profile) {
    return (
      <div className="space-y-6 p-4 lg:p-6">
        <Skeleton className="h-8 w-1/2" />
        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        {/* ✅ 2. Add a skeleton for the chart */}
        <Skeleton className="h-[350px] w-full" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 w-full lg:col-span-2" />
          <Skeleton className="h-64 w-full lg:col-span-1" />
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-destructive">
        <p>Error loading dashboard data: {error}</p>
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 @container/main">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">
          Welcome back, {profile?.full_name || "Student"}!
        </h1>
      </div>

      {/* Stat Cards Section */}
      <DashboardStatCards profile={profile} answers={answers} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Answers Section */}
        <div className="lg:col-span-2">
          <RecentAnswersTable answers={answers} />
        </div>

        {/* Mentorship Sessions Section */}
        <div className="lg:col-span-1">
          <UpcomingMentorshipSessions sessions={mentorshipSessions} />
        </div>
      </div>
    </main>
  );
}