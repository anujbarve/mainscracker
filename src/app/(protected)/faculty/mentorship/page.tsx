"use client";

import * as React from "react";
import { useFacultyStore } from "@/stores/faculty";
import { useAuthStore } from "@/stores/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { FacultyMentorshipList } from "@/components/faculty/faculty-mentorship-list";
import { FacultyMentorshipFilters } from "@/components/faculty/faculty-mentorship-filters";
import { FacultyMentorshipDetailsModal } from "@/components/faculty/faculty-mentorship-details-modal";
import { FacultyMentorshipSession } from "@/stores/faculty";

export default function FacultyMentorshipPage() {
  const { profile } = useAuthStore();
  const {
    mentorshipSessions,
    loading,
    error,
    fetchMentorshipSessions
  } = useFacultyStore();

  const [selectedFilter, setSelectedFilter] = React.useState<"all" | "requested" | "assigned" | "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show">("all");
  const [selectedSession, setSelectedSession] = React.useState<FacultyMentorshipSession | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (profile) {
      fetchMentorshipSessions();
    }
  }, [profile, fetchMentorshipSessions]);

  // Calculate session counts for each status
  const sessionCounts = React.useMemo(() => {
    if (!mentorshipSessions) {
      return {
        all: 0,
        requested: 0,
        assigned: 0,
        scheduled: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
        no_show: 0,
      };
    }

    return {
      all: mentorshipSessions.length,
      requested: mentorshipSessions.filter(s => s.status === "requested").length,
      assigned: mentorshipSessions.filter(s => s.status === "assigned").length,
      scheduled: mentorshipSessions.filter(s => s.status === "scheduled").length,
      in_progress: mentorshipSessions.filter(s => s.status === "in_progress").length,
      completed: mentorshipSessions.filter(s => s.status === "completed").length,
      cancelled: mentorshipSessions.filter(s => s.status === "cancelled").length,
      no_show: mentorshipSessions.filter(s => s.status === "no_show").length,
    };
  }, [mentorshipSessions]);

  // Filter sessions based on selected filter
  const filteredSessions = React.useMemo(() => {
    if (!mentorshipSessions) return [];
    
    if (selectedFilter === "all") {
      return mentorshipSessions;
    }
    
    return mentorshipSessions.filter(session => session.status === selectedFilter);
  }, [mentorshipSessions, selectedFilter]);

  const handleSessionClick = (session: FacultyMentorshipSession) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  const handleSessionUpdate = () => {
    // Refresh the sessions list after update
    fetchMentorshipSessions({ force: true });
    handleModalClose();
  };

  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 @container/main">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 @container/main">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-destructive mb-2">Error loading mentorship sessions</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 @container/main">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl">
            Mentorship Sessions
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your mentorship sessions with students
          </p>
        </div>
      </div>

      {/* Filters */}
      <FacultyMentorshipFilters
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        sessionCounts={sessionCounts}
      />

      {/* Sessions List */}
      <FacultyMentorshipList
        sessions={filteredSessions}
        onSessionClick={handleSessionClick}
        onSessionUpdate={handleSessionUpdate}
      />

      {/* Session Details Modal */}
      {selectedSession && (
        <FacultyMentorshipDetailsModal
          session={selectedSession}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onUpdate={handleSessionUpdate}
        />
      )}
    </main>
  );
}
