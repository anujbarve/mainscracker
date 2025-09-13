// /app/student/dashboard/_components/DashboardStatCards.tsx
import {
  IconBook,
  IconBrain,
  IconMessageCircle,
  IconFileText,
} from "@tabler/icons-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Profile } from "@/stores/auth";
import { AnswerWithDetails } from "@/stores/student";

type DashboardStatCardsProps = {
  profile: Profile | null,
  answers: AnswerWithDetails[] | null;
};

export function DashboardStatCards({ profile, answers }: DashboardStatCardsProps) {
  const gsCredits = profile?.gs_credit_balance ?? 0;
  const specializedCredits = profile?.specialized_credit_balance ?? 0;
  const mentorshipCredits = profile?.mentorship_credit_balance ?? 0;
  const totalSubmissions = answers?.length ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-0 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconBook className="size-4 text-muted-foreground" />
            GS Credits Left
          </CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">
            {gsCredits}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconBrain className="size-4 text-muted-foreground" />
            Specialized Credits Left
          </CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">
            {specializedCredits}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconMessageCircle className="size-4 text-muted-foreground" />
            Mentorship Sessions Left
          </CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">
            {mentorshipCredits}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconFileText className="size-4 text-muted-foreground" />
            Total Submissions
          </CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">
            {totalSubmissions}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}