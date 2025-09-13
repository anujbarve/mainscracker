"use client";

import { useMemo } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";

import { useAuthStore } from "@/stores/auth";
import { useStudentStore } from "@/stores/student";

import {
  mentorshipRequestSchema,
  type MentorshipRequestFormValues,
} from "./mentorship-schema";

import {
  Button,
} from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  CheckCircle,
  CreditCard,
  XCircle,
  ArrowRight,
} from "lucide-react";

// ---------------- MAIN COMPONENT ----------------
export function MentorshipRequestForm() {
  const { profile } = useAuthStore();
  const { requestMentorshipSession, loading } = useStudentStore();

  const form = useForm<MentorshipRequestFormValues>({
    resolver: zodResolver(mentorshipRequestSchema),
    defaultValues: {
      student_notes: "",
      duration_minutes: "",
    },
  });

  const MENTORSHIP_COST = 1;

  const hasEnoughCredits = useMemo(() => {
    if (!profile) return false;
    return profile.mentorship_credit_balance >= MENTORSHIP_COST;
  }, [profile]);

  const onSubmit: SubmitHandler<MentorshipRequestFormValues> = async (data) => {
    if (!hasEnoughCredits) {
      toast.error("You don't have enough credits for this request.");
      return;
    }

    try {
      const newSessionId = await requestMentorshipSession({
        student_notes: data.student_notes,
        duration_minutes: Number(data.duration_minutes),
      });

      if (newSessionId) {
        form.reset();
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    }
  };

  if (!profile) return <SubmissionPageSkeleton />;

  return (
    <main className="w-full min-h-[calc(100vh-theme(spacing.16))] p-6 lg:p-10">
      <div className="mx-auto max-w-6xl grid gap-10 lg:grid-cols-5">
        {/* ---------------- LEFT: FORM ---------------- */}
        <div className="lg:col-span-3">
          <Card className="rounded-2xl shadow-lg border border-border/30">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold">
                    Request a Session
                  </CardTitle>
                  <CardDescription>
                    Share your learning needs & choose duration.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 pt-2">
                  {/* Notes */}
                  <FormField
                    control={form.control}
                    name="student_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discussion Topic</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Help with React hooks, debugging project setup..."
                            rows={5}
                            className="rounded-xl resize-none"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          Provide clear details so mentor can prepare.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Duration */}
                  <FormField
                    control={form.control}
                    name="duration_minutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Duration</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select duration..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                          Pick how long the session should last.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>

                <CardFooter className="flex justify-end bg-muted/40 rounded-b-2xl px-6 py-4">
                  <Button
                    type="submit"
                    disabled={loading || !hasEnoughCredits}
                    className="rounded-xl px-6 font-semibold shadow-sm"
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Request Session ({MENTORSHIP_COST} Credit)
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>

        {/* ---------------- RIGHT: SUMMARY ---------------- */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Credit Wallet
              </CardTitle>
              <CardDescription>
                Manage your mentorship credits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreditBalanceRow
                icon={CreditCard}
                label="Mentorship Credits"
                balance={profile.mentorship_credit_balance}
              />
            </CardContent>
            <CardFooter>
              <Button asChild variant="secondary" className="w-full rounded-xl">
                <Link href="/student/plans">
                  Buy More Credits
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Alert
            variant={hasEnoughCredits ? "default" : "destructive"}
            className="rounded-xl"
          >
            {hasEnoughCredits ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertTitle className="font-semibold">
              {hasEnoughCredits ? "Ready to Go!" : "Insufficient Credits"}
            </AlertTitle>
            <AlertDescription>
              {hasEnoughCredits
                ? `This request will use ${MENTORSHIP_COST} credit.`
                : `You need at least ${MENTORSHIP_COST} credit to continue.`}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </main>
  );
}

// ---------------- HELPERS ----------------
const CreditBalanceRow = ({
  icon: Icon,
  label,
  balance,
}: {
  icon: React.ElementType;
  label: string;
  balance: number;
}) => (
  <div className="flex items-center justify-between rounded-lg border bg-background p-3">
    <div className="flex items-center">
      <Icon className="mr-3 h-5 w-5 text-muted-foreground" />
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
    <span className="text-lg font-bold text-foreground">{balance}</span>
  </div>
);

// ---------------- SKELETON ----------------
function SubmissionPageSkeleton() {
  return (
    <div className="w-full p-6 lg:p-10">
      <div className="mx-auto max-w-6xl grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/3" />
              <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-8 p-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter className="bg-muted/40 p-4">
              <Skeleton className="h-10 w-32 ml-auto" />
            </CardFooter>
          </Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-14 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
