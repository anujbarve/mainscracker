// /app/student/dashboard/_components/UpcomingMentorshipSessions.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MentorshipSessionWithMentor } from "@/stores/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type UpcomingMentorshipSessionsProps = {
  sessions: MentorshipSessionWithMentor[] | null;
};

export function UpcomingMentorshipSessions({ sessions }: UpcomingMentorshipSessionsProps) {
  // Filter for sessions that are not completed or cancelled
  const upcomingSessions = sessions?.filter(
    (s) => s.status === 'requested' || s.status === 'scheduled'
  ) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mentorship</CardTitle>
        <CardDescription>
          Your pending and scheduled mentorship sessions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingSessions.length > 0 ? (
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between rounded-md border p-4">
                <div>
                  <p className="font-medium">
                    {session.mentor ? `Session with ${session.mentor.full_name}` : "Pending Assignment"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Requested on {new Date(session.requested_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={session.status === 'scheduled' ? 'default' : 'secondary'}>
                  {session.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 rounded-md border border-dashed p-8 text-center">
             <h3 className="text-lg font-semibold">No Upcoming Sessions</h3>
            <p className="text-sm text-muted-foreground">
              Book a session to get expert guidance.
            </p>
            <Button asChild>
              <Link href="/student/mentorship/request">Request a Session</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}