"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAdminStore } from "@/stores/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  User,
  Clock,
  CheckCircle,
  Video,
  FileText,
  BookOpen,
} from "lucide-react";
import { format, parseISO } from "date-fns";

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: Record<string, string> = {
    requested: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800",
    pending_confirmation: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800",
    confirmed: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800",
    completed: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800",
    cancelled: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
    student_absent: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800",
    mentor_absent: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800",
  };
  return (
    <Badge variant="outline" className={`capitalize ${statusStyles[status]}`}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), "dd MMM, yyyy 'at' hh:mm a");
  } catch {
    return "Invalid Date";
  }
};

// ✅ Reusable InfoItem
const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: React.ReactNode | string;
}) => (
  <div>
    <Label className="text-sm text-muted-foreground">{label}</Label>
    <div className="flex items-center gap-2 pt-1">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="font-medium text-sm">{value}</span>
    </div>
  </div>
);

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function MentorshipSessionDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const {
    currentMentorshipSession,
    loading,
    fetchMentorshipSessionById,
    clearCurrentMentorshipSession,
  } = useAdminStore();

  React.useEffect(() => {
    if (id) {
      fetchMentorshipSessionById(id);
    }
    return () => {
      clearCurrentMentorshipSession();
    };
  }, [id, fetchMentorshipSessionById, clearCurrentMentorshipSession]);

  const isLoading = loading.currentMentorshipSession || !currentMentorshipSession;

  return (
    <div className="flex flex-col flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/mentorships">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Mentorship Session
          </h2>
          <div className="text-muted-foreground text-sm">
            {isLoading ? (
              <Skeleton className="h-4 w-48 mt-1" />
            ) : (
              `ID: ${currentMentorshipSession.id}`
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Key Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <InfoItem
                icon={User}
                label="Student"
                value={
                  isLoading ? (
                    <Skeleton className="h-5 w-32" />
                  ) : (
                    currentMentorshipSession.student?.full_name
                  )
                }
              />
              <InfoItem
                icon={User}
                label="Mentor"
                value={
                  isLoading ? (
                    <Skeleton className="h-5 w-32" />
                  ) : (
                    currentMentorshipSession.mentor?.full_name || "Unassigned"
                  )
                }
              />
              <InfoItem
                icon={Clock}
                label="Scheduled At"
                value={
                  isLoading ? (
                    <Skeleton className="h-5 w-40" />
                  ) : (
                    formatDate(currentMentorshipSession.scheduled_at)
                  )
                }
              />
              <InfoItem
                icon={Clock}
                label="Duration"
                value={
                  isLoading ? (
                    <Skeleton className="h-5 w-20" />
                  ) : currentMentorshipSession.duration_minutes ? (
                    `${currentMentorshipSession.duration_minutes} mins`
                  ) : (
                    "N/A"
                  )
                }
              />
              <InfoItem
                icon={CheckCircle}
                label="Status"
                value={
                  isLoading ? (
                    <Skeleton className="h-5 w-24" />
                  ) : (
                    <StatusBadge status={currentMentorshipSession.status} />
                  )
                }
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Notes, Meeting Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Meeting URL */}
              <div>
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Video size={16} /> Meeting Link
                </Label>
                <div className="mt-2">
                  {isLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : currentMentorshipSession.meeting_url ? (
                    <a
                      href={currentMentorshipSession.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                      >
                        <Video size={16} /> Join Meeting
                      </Button>
                    </a>
                  ) : (
                    <span className="text-muted-foreground">No link provided</span>
                  )}
                </div>
              </div>

              <Separator />

              {/* Notes */}
              <div>
                <Label className="text-base font-semibold flex items-center gap-2">
                  <BookOpen size={16} /> Student Notes
                </Label>
                <div className="mt-2 text-muted-foreground border p-4 rounded-md min-h-24 prose prose-sm dark:prose-invert">
                  {isLoading ? (
                    <Skeleton className="h-24 w-full" />
                  ) : (
                    currentMentorshipSession.student_notes ||
                    "No notes provided."
                  )}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold flex items-center gap-2">
                  <FileText size={16} /> Mentor Notes
                </Label>
                <div className="mt-2 text-muted-foreground border p-4 rounded-md min-h-24 prose prose-sm dark:prose-invert">
                  {isLoading ? (
                    <Skeleton className="h-24 w-full" />
                  ) : (
                    currentMentorshipSession.mentor_notes ||
                    "No notes provided."
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
