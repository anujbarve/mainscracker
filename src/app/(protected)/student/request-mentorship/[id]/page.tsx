"use client";

import { useParams } from "next/navigation";
import { MentorshipFeedbackForm } from "@/components/student/mentorship-feedback-form";

export default function MentorshipFeedbackPage() {
  const params = useParams();
  const sessionId = params?.id as string;

  // Render the form component and pass the session ID as a prop
  return <MentorshipFeedbackForm sessionId={sessionId} />;
}