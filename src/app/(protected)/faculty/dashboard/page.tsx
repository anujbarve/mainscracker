"use client";

import * as React from "react";
import { useAuthStore } from "@/stores/auth";
import { useFacultyStore } from "@/stores/faculty";
import { Skeleton } from "@/components/ui/skeleton";
import { FacultyDashboardStats } from "@/components/faculty/faculty-dashboard-stats";
import { FacultyAvailabilityToggle } from "@/components/faculty/faculty-availability-toggle";

export default function FacultyDashboardPage() {
  const { profile, loading, error, refreshProfile } = useAuthStore();
  const { dashboardData, loading: facultyLoading, error: facultyError, fetchDashboardData } = useFacultyStore();

  // Fetch dashboard data when component mounts
  React.useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile, fetchDashboardData]);

  // Handle loading state
  if (loading || facultyLoading) {
    return (
      <div className="space-y-6 p-4 lg:p-6">
        <Skeleton className="h-8 w-1/2" />
        <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Handle error state
  if (error || facultyError) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-destructive">
        <p>Error loading dashboard: {error || facultyError}</p>
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 @container/main">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">
          Welcome, {profile?.full_name || "Faculty"}!
        </h1>
        <FacultyAvailabilityToggle 
          isAvailable={profile?.is_available ?? false}
          onToggle={async () => {
            await refreshProfile({ force: true });
          }}
        />
      </div>

      {/* Statistic Cards */}
      <FacultyDashboardStats 
        dashboardData={dashboardData}
        profile={profile}
      />
    </main>
  );
}
