import { 
  IconClipboardList, 
  IconCircle, 
  IconTrendingUp, 
  IconUsers 
} from "@tabler/icons-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Profile } from "@/stores/auth";

type FacultyDashboardStatsProps = {
  dashboardData: any;
  profile: Profile | null;
};

export function FacultyDashboardStats({ dashboardData, profile }: FacultyDashboardStatsProps) {
  // Extract stats from dashboard data or use profile data as fallback
  const stats = dashboardData?.stats || {};
  const pendingEvaluations = stats.pending_evaluations ?? 0;
  const completedEvaluations = stats.completed_evaluations ?? 0;
  const totalEvaluations = profile?.total_answers_evaluated ?? 0;
  const totalMentorshipSessions = profile?.total_mentorship_sessions ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-0 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Pending Evaluations Card */}
      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconClipboardList className="size-4 text-muted-foreground" />
            Pending Evaluations
          </CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">
            {pendingEvaluations}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Answers waiting for your evaluation
          </p>
        </CardContent>
      </Card>

      {/* Completed Evaluations Card */}
      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconCircle className="size-4 text-muted-foreground" />
            Completed This Period
          </CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">
            {completedEvaluations}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Recently completed evaluations
          </p>
        </CardContent>
      </Card>

      {/* Total Evaluations Card */}
      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconTrendingUp className="size-4 text-muted-foreground" />
            Total Evaluations
          </CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">
            {totalEvaluations}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All-time evaluation count
          </p>
        </CardContent>
      </Card>

      {/* Mentorship Sessions Card */}
      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconUsers className="size-4 text-muted-foreground" />
            Mentorship Sessions
          </CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">
            {totalMentorshipSessions}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Total mentorship sessions conducted
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
