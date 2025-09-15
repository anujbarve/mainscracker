import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FacultyAnswer } from "@/stores/faculty";
import { IconEye, IconClock, IconCircle } from "@tabler/icons-react";
import Link from "next/link";

type FacultyReviewTableProps = {
  answers: FacultyAnswer[];
  type: "pending" | "completed";
};

// Helper to map status to badge variant
const statusVariantMap: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  assigned: "secondary",
  in_evaluation: "default",
  completed: "outline",
  cancelled: "destructive",
};

// Helper to format status display
const formatStatus = (status: string) => {
  return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

// Helper to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function FacultyReviewTable({ answers, type }: FacultyReviewTableProps) {
  if (answers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4 text-center">
            {type === "pending" ? (
              <>
                <IconClock className="size-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">No Pending Evaluations</h3>
                  <p className="text-sm text-muted-foreground">
                    You don't have any pending answer evaluations at the moment.
                  </p>
                </div>
              </>
            ) : (
              <>
                <IconCircle className="size-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">No Completed Evaluations</h3>
                  <p className="text-sm text-muted-foreground">
                    You haven't completed any evaluations yet.
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === "pending" ? (
            <>
              <IconClock className="size-5" />
              Pending Evaluations
            </>
          ) : (
            <>
              <IconCircle className="size-5" />
              Completed Evaluations
            </>
          )}
        </CardTitle>
        <CardDescription>
          {type === "pending" 
            ? "Answer sheets waiting for your evaluation"
            : "Previously evaluated answer sheets"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {answers.map((answer) => (
              <TableRow key={answer.id}>
                <TableCell className="font-medium">
                  {answer.student?.full_name || "Unknown Student"}
                </TableCell>
                <TableCell>
                  {answer.subjects?.name || "Unknown Subject"}
                </TableCell>
                <TableCell>
                  {formatDate(answer.submitted_at)}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariantMap[answer.status] || "secondary"}>
                    {formatStatus(answer.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {type === "pending" ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/faculty/review/${answer.id}`}>
                        <IconEye className="size-4 mr-2" />
                        Evaluate
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/faculty/review/${answer.id}`}>
                        <IconEye className="size-4 mr-2" />
                        View
                      </Link>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
