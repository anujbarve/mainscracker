// /app/student/dashboard/_components/RecentAnswersTable.tsx
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
import { Badge } from "@/components/ui/badge";
import { AnswerWithDetails, AnswerStatus } from "@/stores/student";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type RecentAnswersTableProps = {
  answers: AnswerWithDetails[] | null;
};

// ✅ Helper updated to include all status types
const statusVariantMap: Record<
  AnswerStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending_assignment: "secondary",
  assigned: "default",
  in_evaluation: "default",
  revision_requested: "secondary",
  completed: "outline",
  cancelled: "destructive",
};

export function RecentAnswersTable({ answers }: RecentAnswersTableProps) {
  const recentAnswers = answers?.slice(0, 5) ?? []; // Show latest 5

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Submissions</CardTitle>
        <CardDescription>
          Your latest 5 answer sheets and their evaluation status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentAnswers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted On</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAnswers.map((answer) => (
                <TableRow key={answer.id}>
                  <TableCell className="font-medium">
                    {answer.subjects?.name ?? "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariantMap[answer.status] ?? "secondary"} className="capitalize">
                      {answer.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(answer.submitted_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/student/answers-list/${answer.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 rounded-md border border-dashed p-8 text-center">
            <h3 className="text-lg font-semibold">No Submissions Yet</h3>
            <p className="text-sm text-muted-foreground">
              When you submit your first answer, it will appear here.
            </p>
            <Button asChild>
              <Link href="/student/answers/submit">Submit an Answer</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}