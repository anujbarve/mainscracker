"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { useAuthStore } from "@/stores/auth";
import { useStudentStore } from "@/stores/student";
import { createClient } from "@/utils/client";
import { toast } from "sonner";
import Link from "next/link";

import {
  answerFormSchema,
  type AnswerFormValues,
} from "./answer-schema"; // Adjust path if needed

// Shadcn UI & Icons
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Loader2, FileUp, CheckCircle, Sparkles, CreditCard, XCircle, Info, ArrowRight } from "lucide-react";

type Subject = {
  id: string;
  name: string;
  category: 'gs' | 'specialized';
};

export function AnswerSubmissionForm() {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const { user, profile } = useAuthStore();
  const { subjects, fetchSubjects, submitAnswerSheet } = useStudentStore();
  const storeLoading = useStudentStore((state) => state.loading);

  const form = useForm<AnswerFormValues>({
    resolver: zodResolver(answerFormSchema),
    defaultValues: { subject_id: "", question_text: "", answer_file: undefined },
  });

  useEffect(() => {
    if (!subjects) fetchSubjects();
  }, [fetchSubjects, subjects]);

  const hasEnoughCredits = useMemo(() => {
    if (!profile || !selectedSubject) return false;
    const cost = 1;
    const balance = selectedSubject.category === 'specialized' ? profile.specialized_credit_balance : profile.gs_credit_balance;
    return balance >= cost;
  }, [profile, selectedSubject]);

  const handleSubjectChange = (subjectId: string) => {
    const subject = subjects?.find((s) => s.id === subjectId) || null;
    setSelectedSubject(subject);
    form.setValue("subject_id", subjectId);
  };

  const onSubmit: SubmitHandler<AnswerFormValues> = async (data) => {
    // These client-side checks are still valuable for a good user experience
    if (!user || !selectedSubject) {
      toast.error("Please ensure you are logged in and have selected a subject.");
      return;
    }
    if (!hasEnoughCredits) {
      toast.error("You don't have enough credits for this submission.");
      return;
    }
    
    setIsUploading(true);
    try {
      const supabase = await createClient();
      const file = data.answer_file;
      const uniqueFileName = `${uuidv4()}-${file.name}`;
      
      // Ensure the path and bucket name are correct
      const filePath = `${user.id}/${uniqueFileName}`;
      const bucketName = "answers"; // Use your actual bucket name

      // 1. Upload the file to storage (this remains the same)
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      // 2. Get the public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      if (!urlData?.publicUrl) throw new Error("Could not get file URL.");

      // 3. ✅ Call the simplified store action.
      // The store now handles the RPC call to your function.
      await submitAnswerSheet({
        subject_id: data.subject_id,
        question_text: data.question_text,
        answer_file_url: urlData.publicUrl,
      });

      // 4. Reset the form on success
      form.reset();
      setFileName(null);
      setSelectedSubject(null);
      
    } catch (error: any) {
      // This will now also catch errors from the RPC function, like "Insufficient credits"
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsUploading(false);
    }
  };

  const totalLoading = isUploading || storeLoading;

  if (!profile || !subjects) return <SubmissionPageSkeleton />;

  return (
    <main className="w-full min-h-[calc(100vh-theme(spacing.16))] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-screen-2xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Answer Submission</h1>
          <p className="mt-1 text-muted-foreground">Upload your completed answer sheet for evaluation by our faculty.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 xl:gap-12 items-start">
          
          {/* Main Form Panel */}
          <div className="lg:col-span-3">
            <Card className="shadow-sm">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="p-6">
                    <div className="space-y-8">
                      {/* Step 1 */}
                      <div className="space-y-4">
                        <FormStep title="Step 1: Select Subject" description="Choose the subject to see the credit cost." />
                        <FormField control={form.control} name="subject_id" render={({ field }) => (
                          <FormItem><Select onValueChange={handleSubjectChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a subject..." /></SelectTrigger></FormControl><SelectContent>{subjects.map((s) => (<SelectItem key={s.id} value={s.id}><div className="flex w-full items-center justify-between"><span>{s.name}</span><Badge variant="outline" className="capitalize">{s.category === 'gs' ? 'General' : 'Specialized'} - 1 Credit</Badge></div></SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>
                        )} />
                      </div>
                      
                      <Separator />

                      {/* Step 2 */}
                      <div className="space-y-4">
                        <FormStep title="Step 2: Provide Question" description="Please type the exact question you are answering." />
                        <FormField control={form.control} name="question_text" render={({ field }) => (<FormItem><FormControl><Textarea placeholder="Type the question here..." rows={6} {...field} /></FormControl><FormMessage /></FormItem>)} />
                      </div>

                      <Separator />

                      {/* Step 3 */}
                      <div className="space-y-4">
                        <FormStep title="Step 3: Upload File" description="Your answer sheet must be a single PDF file under 5MB." />
                        <FormField control={form.control} name="answer_file" render={({ field: { onChange, value, ...rest } }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative"><Input type="file" accept=".pdf" {...rest} onChange={(e) => { const file = e.target.files?.[0]; if (file) { onChange(file); setFileName(file.name); } }} className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" /><div className="flex min-h-[120px] items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-4 transition-colors hover:border-primary">{fileName ? (<div className="text-center font-medium text-green-600"><CheckCircle className="mx-auto mb-2 h-10 w-10" /><p>{fileName}</p></div>) : (<div className="text-center text-muted-foreground"><FileUp className="mx-auto mb-2 h-10 w-10" /><p>Click or drag your PDF here</p></div>)}</div></div>
                            </FormControl><FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 px-6 py-4">
                    <Button type="submit" className="ml-auto" disabled={totalLoading || !selectedSubject || !hasEnoughCredits}>
                      {totalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isUploading ? "Uploading..." : "Submit for Evaluation"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 space-y-6">
            <Card>
              <CardHeader><CardTitle>Credit Wallet</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <CreditBalanceRow icon={CreditCard} label="General Credits" balance={profile.gs_credit_balance} />
                <CreditBalanceRow icon={Sparkles} label="Specialized Credits" balance={profile.specialized_credit_balance} />
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/student/plans">Buy More Credits <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </CardFooter>
            </Card>
            
            {selectedSubject && (
              <Alert variant={hasEnoughCredits ? "default" : "destructive"}>
                {hasEnoughCredits ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <AlertTitle>Submission Check</AlertTitle>
                <AlertDescription>
                  This {selectedSubject.category === 'gs' ? 'General' : 'Specialized'} subject costs{" "}
                  <b>1 {selectedSubject.category === 'gs' ? 'General' : 'Specialized'} credit</b>.{" "}
                  {hasEnoughCredits ? "You have enough to proceed." : "You do not have enough credits."}
                </AlertDescription>
              </Alert>
            )}
             <Alert>
                <Info className="h-4 w-4" /><AlertTitle>Submission Guide</AlertTitle><AlertDescription>Please ensure your PDF is legible and under 5MB. Submissions are final, and credits will be deducted immediately.</AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </main>
  );
}

// Helper Components
const FormStep = ({ title, description }: { title: string; description: string }) => (
  <div>
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);
const CreditBalanceRow = ({ icon: Icon, label, balance }: { icon: React.ElementType, label: string, balance: number }) => (<div className="flex items-center justify-between rounded-lg border bg-background p-3"><div className="flex items-center"><Icon className="mr-3 h-5 w-5 text-muted-foreground" /><span className="text-sm font-medium text-foreground">{label}</span></div><span className="text-lg font-bold text-foreground">{balance}</span></div>);

function SubmissionPageSkeleton() {
  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-screen-2xl">
        <header className="mb-8"><Skeleton className="h-9 w-1/3" /><Skeleton className="mt-2 h-5 w-1/2" /></header>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 xl:gap-12 items-start">
          <div className="lg:col-span-3"><Card><CardContent className="space-y-8 p-6"><div className="space-y-4"><Skeleton className="h-6 w-1/4" /><Skeleton className="h-10 w-full" /></div><Separator /><div className="space-y-4"><Skeleton className="h-6 w-1/4" /><Skeleton className="h-24 w-full" /></div><Separator /><div className="space-y-4"><Skeleton className="h-6 w-1/4" /><Skeleton className="h-32 w-full" /></div></CardContent><CardFooter className="bg-muted/50 p-4"><Skeleton className="ml-auto h-10 w-32" /></CardFooter></Card></div>
          <div className="lg:col-span-2 space-y-6"><Card><CardHeader><Skeleton className="h-7 w-1/2" /></CardHeader><CardContent className="space-y-3"><Skeleton className="h-14 w-full" /><Skeleton className="h-14 w-full" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card></div>
        </div>
      </div>
    </div>
  );
}