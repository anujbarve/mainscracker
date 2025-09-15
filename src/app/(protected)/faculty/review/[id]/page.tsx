"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useFacultyStore } from "@/stores/faculty";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { AnswerPDFViewer } from "@/components/faculty/answer-pdf-viewer";
import { AnswerEvaluationForm } from "@/components/faculty/answer-evaluation-form";

export default function FacultyAnswerEvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const answerId = params.id as string;
  
  const [answerData, setAnswerData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch answer data when component mounts
  React.useEffect(() => {
    const fetchAnswerData = async () => {
      if (!answerId) return;

      setLoading(true);
      setError(null);

      try {
        const { createClient } = await import("@/utils/client");
        const supabase = await createClient();
        
        const { data, error } = await supabase
          .from("answers")
          .select(`
            *,
            subjects(id, name, category),
            student:profiles!student_id(id, full_name)
          `)
          .eq("id", answerId)
          .single();
        
        if (error) throw error;
        
        setAnswerData(data);
      } catch (err: any) {
        console.error("Error fetching answer data:", err);
        setError(err.message || "Failed to load answer data");
      } finally {
        setLoading(false);
      }
    };

    fetchAnswerData();
  }, [answerId]);

  // Handle loading state
  if (loading) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 @container/main">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </main>
    );
  }

  // Handle error state
  if (error) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 @container/main">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/faculty/review">
              <IconArrowLeft className="size-4 mr-2" />
              Back to Review Queue
            </Link>
          </Button>
        </div>
        <div className="flex h-full items-center justify-center p-6 text-destructive">
          <p>Error loading answer: {error}</p>
        </div>
      </main>
    );
  }

  // Handle case where answer is not found
  if (!answerData) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 @container/main">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/faculty/review">
              <IconArrowLeft className="size-4 mr-2" />
              Back to Review Queue
            </Link>
          </Button>
        </div>
        <div className="flex h-full items-center justify-center p-6">
          <p>Answer not found</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 @container/main">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/faculty/review">
            <IconArrowLeft className="size-4 mr-2" />
            Back to Review Queue
          </Link>
        </Button>
        <div>
          <h1 className="text-lg font-semibold md:text-2xl">
            Answer Evaluation
          </h1>
          <p className="text-sm text-muted-foreground">
            {answerData.student?.full_name} - {answerData.subjects?.name}
          </p>
        </div>
      </div>

      {/* Single Column Layout */}
      <div className="space-y-6">
        {/* Evaluation Form - Top */}
        <AnswerEvaluationForm 
          answerData={answerData}
          onSuccess={() => {
            router.push("/faculty/review");
          }}
        />

        {/* PDF Viewer - Bottom */}
        <AnswerPDFViewer 
          pdfUrl={answerData.answer_file_url}
          answerId={answerId}
        />
      </div>
    </main>
  );
}
