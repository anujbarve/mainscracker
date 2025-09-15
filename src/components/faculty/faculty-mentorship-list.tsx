"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FacultyMentorshipSession } from "@/stores/faculty";
import { IconCalendar, IconClock, IconUser, IconMessageCircle, IconEye } from "@tabler/icons-react";

type FacultyMentorshipListProps = {
  sessions: FacultyMentorshipSession[];
  onSessionClick: (session: FacultyMentorshipSession) => void;
  onSessionUpdate: () => void;
};

const statusVariantMap: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  requested: "outline",
  assigned: "secondary",
  scheduled: "default",
  in_progress: "default",
  completed: "outline",
  cancelled: "destructive",
  no_show: "destructive",
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Not scheduled";
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export function FacultyMentorshipList({ 
  sessions, 
  onSessionClick, 
  onSessionUpdate 
}: FacultyMentorshipListProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <IconCalendar className="size-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
          <p className="text-sm text-muted-foreground text-center">
            There are no mentorship sessions matching your current filter.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <Card key={session.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconUser className="size-5" />
                  {session.student?.full_name || "Unknown Student"}
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <IconCalendar className="size-4" />
                    {formatDate(session.scheduled_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <IconClock className="size-4" />
                    {formatDuration(session.duration_minutes)}
                  </span>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusVariantMap[session.status] || "secondary"}>
                  {formatStatus(session.status)}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSessionClick(session)}
                >
                  <IconEye className="size-4 mr-2" />
                  View Details
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {session.student_notes && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <IconMessageCircle className="size-4" />
                  Student Notes
                </div>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">
                  {session.student_notes}
                </p>
              </div>
            )}
            
            {session.mentor_notes && (
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <IconMessageCircle className="size-4" />
                  Your Notes
                </div>
                <p className="text-sm bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                  {session.mentor_notes}
                </p>
              </div>
            )}

            {/* Student Rating and Feedback */}
            {(session.student_rating || session.student_feedback) && (
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <IconMessageCircle className="size-4" />
                  Student Evaluation
                </div>
                <div className="space-y-2">
                  {session.student_rating && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Rating:</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${
                              i < session.student_rating!
                                ? "text-yellow-500"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="text-sm text-muted-foreground ml-1">
                          ({session.student_rating}/5)
                        </span>
                      </div>
                    </div>
                  )}
                  {session.student_feedback && (
                    <p className="text-sm bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                      {session.student_feedback}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Session Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Platform</p>
                <p className="text-sm font-medium capitalize">{session.meeting_platform}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Requested</p>
                <p className="text-sm font-medium">
                  {new Date(session.requested_at).toLocaleDateString()}
                </p>
              </div>
              {session.started_at && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Started</p>
                  <p className="text-sm font-medium">
                    {new Date(session.started_at).toLocaleDateString()}
                  </p>
                </div>
              )}
              {session.completed_at && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Completed</p>
                  <p className="text-sm font-medium">
                    {new Date(session.completed_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
