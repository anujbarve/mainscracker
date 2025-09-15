"use client";

import * as React from "react";
import { useFacultyStore } from "@/stores/faculty";
import { useAuthStore } from "@/stores/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { FacultyReviewTable } from "@/components/faculty/faculty-review-table";
import { FacultyReviewSearch } from "@/components/faculty/faculty-review-search";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconClipboardList, IconCircle } from "@tabler/icons-react";

export default function FacultyReviewPage() {
  const { profile } = useAuthStore();
  const { 
    assignedAnswers, 
    loading, 
    error, 
    fetchAssignedAnswers 
  } = useFacultyStore();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("pending");

  // Fetch assigned answers when component mounts
  React.useEffect(() => {
    if (profile) {
      fetchAssignedAnswers();
    }
  }, [profile, fetchAssignedAnswers]);

  // Filter answers based on search query
  const filteredAnswers = React.useMemo(() => {
    if (!assignedAnswers) return [];
    
    return assignedAnswers.filter((answer) => {
      const matchesSearch = searchQuery === "" || 
        answer.student?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        answer.subjects?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSearch;
    });
  }, [assignedAnswers, searchQuery]);

  // Separate answers by status
  const pendingAnswers = filteredAnswers.filter(
    (answer) => answer.status === "assigned" || answer.status === "in_evaluation"
  );
  
  const completedAnswers = filteredAnswers.filter(
    (answer) => answer.status === "completed"
  );

  // Handle loading state
  if (loading) {
    return (
      <div className="space-y-6 p-4 lg:p-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-destructive">
        <p>Error loading review queue: {error}</p>
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 @container/main">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold md:text-2xl">
            Answer Review Queue
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and evaluate assigned answer sheets
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <FacultyReviewSearch 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Tabs for Pending and Completed */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <IconClipboardList className="size-4" />
            Pending ({pendingAnswers.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <IconCircle className="size-4" />
            Completed ({completedAnswers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <FacultyReviewTable 
            answers={pendingAnswers}
            type="pending"
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <FacultyReviewTable 
            answers={completedAnswers}
            type="completed"
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}
