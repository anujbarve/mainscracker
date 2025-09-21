"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useStudentStore } from "@/stores/student";

// Shadcn UI & Icons
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  UserCheck,
  Clock,
  AlertCircle,
  Hash,
  MessageSquare,
  Video,
} from "lucide-react";

// --- Helper Components ---
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    pending: { label: "Pending", color: "bg-yellow-400/20 text-yellow-600 border-yellow-400/30" },
    accepted: { label: "Accepted", color: "bg-blue-400/20 text-blue-600 border-blue-400/30" },
    completed: { label: "Completed", color: "bg-green-400/20 text-green-600 border-green-400/30" },
    cancelled: { label: "Cancelled", color: "bg-red-400/20 text-red-600 border-red-400/30" },
  }[status] || { label: "Unknown", color: "bg-gray-400/20 text-gray-600 border-gray-400/30" };
  return <Badge variant="outline" className={statusConfig.color}>{statusConfig.label}</Badge>;
};

const DetailItem = ({ icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) => (
  <div className="flex items-start">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
      {React.createElement(icon, { className: "h-5 w-5" })}
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="text-sm font-semibold">{children}</div>
    </div>
  </div>
);

// --- Main Page ---
export default function MentorshipSessionDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { mentorshipSessions, fetchUserMentorshipSessions } = useStudentStore();

  React.useEffect(() => {
    if (!mentorshipSessions) {
      fetchUserMentorshipSessions();
    }
  }, [mentorshipSessions, fetchUserMentorshipSessions]);

  // Guard: loading state
  if (!mentorshipSessions) {
    return <MentorshipSessionDetailSkeleton />;
  }

  // Find session
  const session = mentorshipSessions.find((s) => s.id === id);

  if (!session) {
    return (
      <main className="flex min-h-[calc(100vh-theme(spacing.16))] w-full flex-col items-center justify-center p-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Session Not Found</h1>
        <p className="text-muted-foreground">The session you are looking for does not exist or you do not have permission to view it.</p>
        <Button asChild className="mt-6">
          <Link href="/student/mentorship-sessions">Back to Sessions</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="w-full min-h-[calc(100vh-theme(spacing.16))] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Session Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Session Notes
              </CardTitle>
              <CardDescription>
                Your requested discussion topic for this session.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap bg-muted p-4 rounded-md">
                {session.student_notes}
              </p>
            </CardContent>
          </Card>

          {/* Meeting Link (if available) */}
          {session.meeting_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-6 w-6" />
                  Meeting Link
                </CardTitle>
                <CardDescription>
                  Click the button below to join your scheduled session.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full justify-center gap-2">
                  <Link href={session.meeting_url} target="_blank" rel="noopener noreferrer">
                    <Video className="h-4 w-4" /> Join Session
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Session Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <DetailItem icon={Clock} label="Status">
                <StatusBadge status={session.status} />
              </DetailItem>
              <DetailItem icon={UserCheck} label="Mentor">
                {session.mentor?.full_name || "Not Assigned"}
              </DetailItem>
              <Separator />
              <DetailItem icon={Calendar} label="Requested On">
                {new Date(session.requested_at).toLocaleString()}
              </DetailItem>
              <DetailItem icon={Calendar} label="Completed On">
                {session.completed_at ? new Date(session.completed_at).toLocaleString() : "Pending"}
              </DetailItem>
              <DetailItem icon={Hash} label="Session ID">
                <span className="font-mono text-xs">{session.id}</span>
              </DetailItem>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

// --- Skeleton ---
function MentorshipSessionDetailSkeleton() {
  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-4 w-1/3 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-4 w-1/3 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-1/3" />
            </CardContent>
          </Card>
        </div>
        {/* Right */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
