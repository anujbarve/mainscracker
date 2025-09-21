"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useStudentStore } from "@/stores/student";
import { AnswerStatus } from "@/stores/types";

// Shadcn UI & Icons
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  MessageSquare,
  Award,
  Calendar,
  UserCheck,
  Download,
  Clock,
  AlertCircle,
  Hash,
  Edit, // ✅ Icon for Revision Requested
} from "lucide-react";

// --- Helper Components ---

const StatusBadge = ({ status }: { status: AnswerStatus }) => {
  const statusConfig: Record<
    AnswerStatus,
    { label: string; icon: React.ElementType; color: string }
  > = {
    pending_assignment: {
      label: "Pending Assignment",
      icon: Clock,
      color: "bg-yellow-400/20 text-yellow-600 border-yellow-400/30",
    },
    // ✅ ADDED: "assigned" status
    assigned: {
      label: "Assigned",
      icon: UserCheck,
      color: "bg-purple-400/20 text-purple-600 border-purple-400/30",
    },
    in_evaluation: {
      label: "In Evaluation",
      icon: FileText,
      color: "bg-blue-400/20 text-blue-600 border-blue-400/30",
    },
    completed: {
      label: "Completed",
      icon: Award,
      color: "bg-green-400/20 text-green-600 border-green-400/30",
    },
    cancelled: {
      label: "Cancelled",
      icon: AlertCircle,
      color: "bg-red-400/20 text-red-600 border-red-400/30",
    },
    // ✅ ADDED: "revision_requested" status
    revision_requested: {
      label: "Revision Requested",
      icon: Edit,
      color: "bg-orange-400/20 text-orange-600 border-orange-400/30",
    },
  };

  const current = statusConfig[status] || {
    label: "Unknown",
    icon: Clock,
    color: "bg-gray-400/20 text-gray-600 border-gray-400/30",
  };

  return (
    <Badge variant="outline" className={`gap-x-1.5 ${current.color}`}>
      {React.createElement(current.icon, { className: "h-3 w-3" })}
      {current.label}
    </Badge>
  );
};

const MarksBadge = ({ marks }: { marks: number | null }) => {
  if (marks === null)
    return <span className="text-sm text-muted-foreground">Not Graded</span>;
  const color =
    marks >= 75 ? "text-green-500" : marks >= 50 ? "text-yellow-500" : "text-red-500";
  return (
    <span className={`text-2xl font-bold ${color}`}>{marks.toFixed(2)}</span>
  );
};

const DetailItem = ({
  icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) => (
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

// --- Main Page Component ---
export default function SubmissionDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { answers, fetchUserAnswers } = useStudentStore();

  React.useEffect(() => {
    if (!answers) {
      fetchUserAnswers();
    }
  }, [answers, fetchUserAnswers]);

  if (!answers) {
    return <SubmissionDetailPageSkeleton />;
  }

  const submission = answers.find((ans) => ans.id === id);

  if (!submission) {
    return (
      <main className="flex min-h-[calc(100vh-theme(spacing.16))] w-full flex-col items-center justify-center p-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Submission Not Found</h1>
        <p className="text-muted-foreground">
          The submission you are looking for does not exist.
        </p>
        <Button asChild className="mt-6">
          <Link href="/student/answers-list">Back to Submissions</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="w-full min-h-[calc(100vh-theme(spacing.16))] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Main content */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6" />
                Submission Details
              </CardTitle>
              <CardDescription>
                Subject: {submission.subjects?.name || "N/A"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">Question:</h3>
              <p className="text-muted-foreground whitespace-pre-wrap bg-muted p-4 rounded-md">
                {submission.question_text}
              </p>
            </CardContent>
          </Card>

          {/* ✅ ADDED: Card for Revision Requests */}
          {submission.status === "revision_requested" && (
            <Card className="border-orange-500/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Edit className="h-6 w-6" />
                  Revision Requested
                </CardTitle>
                <CardDescription>
                  Your evaluator has requested changes. Please see their remarks below.
                </CardDescription>
              </CardHeader>
              {submission.faculty_remarks && (
                 <CardContent>
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="font-semibold">Evaluator's Remarks</AlertTitle>
                      <AlertDescription className="mt-2 whitespace-pre-wrap">
                        {submission.faculty_remarks}
                      </AlertDescription>
                    </Alert>
                 </CardContent>
              )}
            </Card>
          )}

          {/* Faculty Evaluation Card - Now shows for 'completed' status */}
          {submission.status === "completed" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  Faculty Evaluation
                </CardTitle>
                <CardDescription>
                  Feedback and marks provided by your evaluator.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submission.faculty_remarks ? (
                  <Alert>
                    <AlertTitle className="font-semibold">
                      Evaluator's Remarks
                    </AlertTitle>
                    <AlertDescription className="mt-2 whitespace-pre-wrap">
                      {submission.faculty_remarks}
                    </AlertDescription>
                  </Alert>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No remarks were provided.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Metadata and Actions */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Submission Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <DetailItem icon={Clock} label="Status">
                <StatusBadge status={submission.status} />
              </DetailItem>
              <DetailItem icon={Award} label="Marks Awarded">
                <MarksBadge marks={submission.marks_awarded} />
              </DetailItem>
              <DetailItem icon={UserCheck} label="Evaluator">
                {submission.assigned_faculty?.full_name || "Not Assigned"}
              </DetailItem>
              <Separator />
              <DetailItem icon={Calendar} label="Submitted On">
                {new Date(submission.submitted_at).toLocaleString()}
              </DetailItem>
              <DetailItem icon={Calendar} label="Evaluated On">
                {submission.evaluated_at
                  ? new Date(submission.evaluated_at).toLocaleString()
                  : "Pending"}
              </DetailItem>
              <DetailItem icon={Hash} label="Submission ID">
                <span className="font-mono text-xs">{submission.id}</span>
              </DetailItem>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Files & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start gap-2">
                <Link
                  href={submission.answer_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4" /> Download Your Submission
                </Link>
              </Button>
              {submission.evaluated_file_url && (
                <Button
                  asChild
                  variant="secondary"
                  className="w-full justify-start gap-2"
                >
                  <Link
                    href={submission.evaluated_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4" /> Download Evaluation
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

// --- Skeleton Component for Loading State (Unchanged) ---
function SubmissionDetailPageSkeleton() {
  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-5 w-1/5 mb-2" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Separator />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}