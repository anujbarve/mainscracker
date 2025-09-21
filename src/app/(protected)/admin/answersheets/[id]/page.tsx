"use client";

import * as React from "react";
import Link from 'next/link';
import { useAdminStore, AdminAnswerView } from "@/stores/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
    ChevronLeft, 
    User, 
    Book, 
    Clock, 
    CheckCircle, 
    FileText, 
    Award 
} from "lucide-react";
import { format, parseISO } from 'date-fns';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { useParams } from "next/navigation";

// =============================================================================
// HELPER COMPONENTS (Self-contained within this file for convenience)
// =============================================================================

const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: Record<string, string> = {
    pending_assignment: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800",
    assigned: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800",
    in_evaluation: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800",
    completed: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800",
    cancelled: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
  };
  return <Badge variant="outline" className={`capitalize ${statusStyles[status]}`}>{status.replace(/_/g, ' ')}</Badge>;
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), "dd MMM, yyyy 'at' hh:mm a");
  } catch (error) {
    return "Invalid Date";
  }
};

const FacultyAssigner = ({ answer }: { answer: AdminAnswerView }) => {
    const { faculty, reassignAnswer, loading } = useAdminStore();
    const isAssigning = loading[`answer_${answer.id}`];

    const handleAssign = (facultyId: string) => {
        if (!facultyId || facultyId === answer.assigned_faculty_id) return;
        toast.promise(reassignAnswer(answer.id, facultyId), {
            loading: 'Assigning faculty...',
            success: 'Faculty assigned successfully!',
            error: 'Failed to assign faculty.',
        });
    };

    if (answer.status !== 'pending_assignment' && answer.assigned_faculty) {
        return <p className="font-medium">{answer.assigned_faculty.full_name}</p>;
    }
    
    return (
        <Select onValueChange={handleAssign} defaultValue={answer.assigned_faculty_id || undefined} disabled={isAssigning}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Assign Faculty" />
            </SelectTrigger>
            <SelectContent>
                {faculty?.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.full_name}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

// ✅ COMPLETED: Reusable component for displaying info items
const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: React.ReactNode | string }) => (
    <div>
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <div className="flex items-center gap-2 pt-1">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{value}</span>
        </div>
    </div>
);


// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function AnswerDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const {
    currentAnswer,
    loading,
    fetchAnswerById,
    clearCurrentAnswer,
    fetchFaculty,
  } = useAdminStore();

  React.useEffect(() => {
    if (id) {
      fetchAnswerById(id);
      fetchFaculty();
    }
    return () => { clearCurrentAnswer(); };
  }, [id, fetchAnswerById, clearCurrentAnswer, fetchFaculty]);

  const isLoading = loading.currentAnswer || !currentAnswer;

  return (
    <div className="flex flex-col flex-1 space-y-6 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
            <Link href="/admin/answersheets"><ChevronLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Answer Details</h2>
            {/* ✅ FIX 1: Changed <p> to <div> to allow <Skeleton> as a child */}
            <div className="text-muted-foreground text-sm">
                {isLoading ? <Skeleton className="h-4 w-48 mt-1" /> : `ID: ${currentAnswer.id}`}
            </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Key Info & Status */}
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader><CardTitle>Key Information</CardTitle></CardHeader>
                <CardContent className="space-y-5">
                    <InfoItem icon={User} label="Student" value={isLoading ? <Skeleton className="h-5 w-32" /> : currentAnswer.student?.full_name} />
                    <InfoItem icon={Book} label="Subject" value={isLoading ? <Skeleton className="h-5 w-40" /> : currentAnswer.subjects?.name} />
                    <InfoItem icon={Clock} label="Submitted At" value={isLoading ? <Skeleton className="h-5 w-48" /> : formatDate(currentAnswer.submitted_at)} />
                    {!isLoading && currentAnswer.evaluated_at && <InfoItem icon={CheckCircle} label="Evaluated At" value={formatDate(currentAnswer.evaluated_at)} />}
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Status & Assignment</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Current Status</Label>
                        <div className="mt-1">{isLoading ? <Skeleton className="h-6 w-24" /> : <StatusBadge status={currentAnswer.status} />}</div>
                    </div>
                     <div>
                        <Label>Assigned Faculty</Label>
                        <div className="mt-1">{isLoading ? <Skeleton className="h-10 w-full" /> : <FacultyAssigner answer={currentAnswer} />}</div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Right Column: Submission & Evaluation Details */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle>Submission & Evaluation</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label className="text-base font-semibold">Question</Label>
                        <div className="mt-2 text-muted-foreground prose prose-sm dark:prose-invert">
                            {isLoading ? <><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></> : <div>{currentAnswer.question_text}</div>}
                        </div>
                    </div>
                    <Separator />
                    <div>
                        <Label className="text-base font-semibold">Files</Label>
                         <div className="mt-2 space-y-2">
                            {isLoading ? <><Skeleton className="h-10 w-full" />{currentAnswer?.evaluated_file_url && <Skeleton className="h-10 w-full" />}</> : (
                                <>
                                 <a href={currentAnswer.answer_file_url} target="_blank" rel="noopener noreferrer"><Button variant="outline" className="w-full justify-start gap-2 my-5"><FileText size={16}/> View Submitted Answer</Button></a>
                                   {currentAnswer.evaluated_file_url && (
                                        <a href={currentAnswer.evaluated_file_url} target="_blank" rel="noopener noreferrer"><Button variant="outline" className="w-full justify-start gap-2"><FileText size={16}/> View Evaluated File</Button></a>
                                   )}
                                </>
                            )}
                        </div>
                    </div>
                    
                    {!isLoading && currentAnswer?.status === 'completed' && (
                        <>
                         <Separator />
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                                <Label className="text-base font-semibold flex items-center gap-2"><Award size={16}/>Score</Label>
                                {/* ✅ FIX 2: Changed <p> to <div> to allow <Skeleton> as a child */}
                                <div className="mt-2 text-3xl font-bold text-primary">
                                    {isLoading ? <Skeleton className="h-8 w-24" /> : `${currentAnswer.marks_awarded} / 100`}
                                </div>
                            </div>
                         </div>
                         <div>
                            <Label className="text-base font-semibold">Faculty Remarks</Label>
                            {/* The 'prose' div is correct here as it can contain multiple <p> tags generated from markdown/text */}
                            <div className="mt-2 text-muted-foreground border p-4 rounded-md min-h-24 prose prose-sm dark:prose-invert">
                                {isLoading ? <Skeleton className="h-24 w-full" /> : (currentAnswer.faculty_remarks || "No remarks provided.")}
                            </div>
                        </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}