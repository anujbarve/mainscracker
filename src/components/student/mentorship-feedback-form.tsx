"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  Star,
  Loader2,
  CheckCircle,
  MessageSquarePlus,
  User,
  Calendar,
  Clock,
  SearchX,
} from "lucide-react";

import { useStudentStore, MentorshipSessionWithMentor } from "@/stores/student";
import {
  mentorshipFeedbackSchema,
  type MentorshipFeedbackFormValues,
} from "./mentorship-feedback-schema";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// -----------------------------------------------------------------------------
// --- Main Component ---
// -----------------------------------------------------------------------------

type MentorshipFeedbackFormProps = {
  sessionId: string;
};

export function MentorshipFeedbackForm({
  sessionId,
}: MentorshipFeedbackFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRating, setSubmittedRating] = useState(0);

  const {
    submitMentorshipFeedback,
    fetchUserMentorshipSessions,
    mentorshipSessions,
    loading,
  } = useStudentStore();

  const session = useMemo(
    () => mentorshipSessions?.find((s) => s.id === sessionId) || null,
    [mentorshipSessions, sessionId]
  );

  useEffect(() => {
    if (!mentorshipSessions) {
      fetchUserMentorshipSessions();
    }
  }, [mentorshipSessions, fetchUserMentorshipSessions]);

  const form = useForm<MentorshipFeedbackFormValues>({
    resolver: zodResolver(mentorshipFeedbackSchema),
    defaultValues: { rating: "", feedback: "" },
  });

  const onSubmit: SubmitHandler<MentorshipFeedbackFormValues> = async (
    data
  ) => {
    const ratingNumber = Number(data.rating);
    const success = await submitMentorshipFeedback(
      sessionId,
      ratingNumber,
      data.feedback
    );

    if (success) {
      setSubmittedRating(ratingNumber);
      setIsSubmitted(true);
    }
  };

  if (loading && !session) {
    return <FeedbackPageSkeleton />;
  }

  if (!session) {
    return <NotFoundDisplay />;
  }

  if (isSubmitted) {
    return <SuccessDisplay rating={submittedRating} session={session} />;
  }

  return (
    <main className="w-full min-h-screen bg-muted/20 flex items-center justify-center p-4 sm:p-6 from-background to-muted/40 bg-gradient-to-br">
      <Card className="w-full max-w-3xl rounded-2xl shadow-2xl bg-background/80 backdrop-blur-sm border-white/10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="text-center p-8">
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                <MessageSquarePlus className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight">
                Share Your Feedback
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Your insights are valuable to us and our mentors.
              </CardDescription>
            </CardHeader>

            <SessionDetails session={session} />

            <CardContent className="px-8 pt-6">
              <div className="space-y-8">
                {/* --- RATING SECTION --- */}
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-lg font-semibold">
                        Overall Rating
                      </FormLabel>
                      <FormControl>
                        <StarRatingInput
                          value={Number(field.value)}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* --- FEEDBACK SECTION --- */}
                <FormField
                  control={form.control}
                  name="feedback"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">
                        Detailed Comments
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What did you like? What could be improved? Be specific!"
                          rows={6}
                          maxLength={1000}
                          className="rounded-xl resize-none text-base"
                          {...field}
                        />
                      </FormControl>
                      <div className="text-xs text-muted-foreground text-right">
                        {field.value?.length || 0} / 1000
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <CardFooter className="p-8 pt-6 flex justify-end">
              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="rounded-xl font-bold text-lg"
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Submit My Feedback
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </main>
  );
}

// -----------------------------------------------------------------------------
// --- UI Sub-components ---
// -----------------------------------------------------------------------------

const SessionDetails = ({
  session,
}: {
  session: MentorshipSessionWithMentor;
}) => (
  <div className="mx-8 mb-6 p-4 rounded-xl border bg-muted/50 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
    <div className="flex items-center gap-2 font-medium">
      <User className="h-5 w-5 text-primary" />
      <span>{session.mentor?.full_name || "N/A"}</span>
    </div>
    <div className="flex items-center gap-2 text-muted-foreground">
      <Calendar className="h-5 w-5" />
      <span>
        {new Date(
          session.completed_at || session.scheduled_at!
        ).toLocaleDateString("en-US", { dateStyle: "long" })}
      </span>
    </div>
  </div>
);

const StarRatingInput = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: string) => void;
}) => {
  const [hoverValue, setHoverValue] = useState(0);
  const labels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];
  const displayValue = hoverValue || value;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      <div
        className="flex items-center space-x-1"
        onMouseLeave={() => setHoverValue(0)}
      >
        {[1, 2, 3, 4, 5].map((starValue) => (
          <label key={starValue} className="cursor-pointer">
            <input
              type="radio"
              name="rating"
              value={starValue}
              className="sr-only"
              onClick={() => onChange(String(starValue))}
              onFocus={() => setHoverValue(starValue)}
            />
            <Star
              className={`h-10 w-10 transition-all duration-200 ${
                starValue <= displayValue
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-muted-foreground/30"
              }`}
              onMouseEnter={() => setHoverValue(starValue)}
            />
          </label>
        ))}
      </div>
      <span className="h-6 text-lg font-semibold text-primary min-w-[100px]">
        {displayValue > 0 && labels[displayValue - 1]}
      </span>
    </div>
  );
};

// -----------------------------------------------------------------------------
// --- State Display Components (Success, Not Found, Skeleton) ---
// -----------------------------------------------------------------------------

const SuccessDisplay = ({
  rating,
  session,
}: {
  rating: number;
  session: MentorshipSessionWithMentor;
}) => (
  <main className="w-full min-h-screen bg-muted/20 flex items-center justify-center p-4 sm:p-6 from-background to-muted/40 bg-gradient-to-br">
    <Card className="w-full max-w-lg text-center rounded-2xl shadow-2xl p-8">
      <CardHeader className="items-center">
        <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-full">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <CardTitle className="text-3xl font-bold mt-6">
          Thank You!
        </CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          Your feedback has been successfully submitted.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Separator />
        <p className="text-muted-foreground">
          You rated your session with{" "}
          <span className="font-semibold text-primary">
            {session.mentor?.full_name}
          </span>{" "}
          as:
        </p>
        <div className="flex justify-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
            />
          ))}
        </div>
        <Separator />
      </CardContent>
      <CardFooter>
        <Button asChild size="lg" className="w-full rounded-xl font-bold">
          <Link href="/student/mentorship-list">Back to My Sessions</Link>
        </Button>
      </CardFooter>
    </Card>
  </main>
);

const NotFoundDisplay = () => (
  <main className="w-full min-h-screen bg-muted/20 flex items-center justify-center p-4 sm:p-6 from-background to-muted/40 bg-gradient-to-br">
    <Card className="w-full max-w-md text-center rounded-2xl shadow-2xl p-8">
      <CardHeader className="items-center">
        <div className="p-4 bg-amber-100 dark:bg-amber-900/50 rounded-full">
          <SearchX className="h-12 w-12 text-amber-500" />
        </div>
        <CardTitle className="text-3xl font-bold mt-6">
          Session Not Found
        </CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          This feedback link may be invalid or the session has been removed.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button asChild size="lg" className="w-full rounded-xl font-bold">
          <Link href="/student/mentorship-list">Back to My Sessions</Link>
        </Button>
      </CardFooter>
    </Card>
  </main>
);

function FeedbackPageSkeleton() {
  return (
    <main className="w-full min-h-screen bg-muted/20 flex items-center justify-center p-4 sm:p-6 from-background to-muted/40 bg-gradient-to-br">
      <Card className="w-full max-w-3xl rounded-2xl shadow-2xl">
        <CardHeader className="text-center p-8">
          <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto mt-2" />
        </CardHeader>
        <div className="mx-8 mb-6 p-4 rounded-xl border">
          <Skeleton className="h-6 w-full" />
        </div>
        <CardContent className="p-8 space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-1/2" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
        <CardFooter className="p-8 flex justify-end">
          <Skeleton className="h-12 w-48 rounded-xl" />
        </CardFooter>
      </Card>
    </main>
  );
}