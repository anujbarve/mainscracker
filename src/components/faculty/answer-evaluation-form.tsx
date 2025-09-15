"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFacultyStore } from "@/stores/faculty";
import { toast } from "sonner";
import { IconUpload, IconCheck } from "@tabler/icons-react";

// Form validation schema
const evaluationSchema = z.object({
  marksAwarded: z.number().min(0, "Marks cannot be negative"),
  maxMarks: z.number().min(1, "Max marks must be at least 1"),
  facultyRemarks: z.string().min(1, "Faculty remarks are required"),
  status: z.enum(["completed", "in_evaluation", "cancelled", "revision_requested"]),
  studentRating: z.number().min(1, "Student rating must be at least 1").max(5, "Student rating cannot exceed 5").optional(),
  evaluatedFile: z.any().optional(),
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;

type AnswerEvaluationFormProps = {
  answerData: any;
  onSuccess: () => void;
};

export function AnswerEvaluationForm({ answerData, onSuccess }: AnswerEvaluationFormProps) {
  const { evaluateAnswer } = useFacultyStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = React.useState<string | null>(null);

  const form = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      marksAwarded: answerData.marks_awarded || 0,
      maxMarks: answerData.max_marks || 100,
      facultyRemarks: answerData.faculty_remarks || "",
      status: answerData.status === "assigned" ? "in_evaluation" : answerData.status || "completed",
      studentRating: answerData.student_rating || undefined,
    },
  });

  const handleFileUpload = async (file: File) => {
    try {
      const { createClient } = await import("@/utils/client");
      const supabase = createClient();
      
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `evaluated_${answerData.id}_${Date.now()}.${fileExt}`;
      const filePath = `evaluated-answers/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('evaluated-answers')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('evaluated-answers')
        .getPublicUrl(filePath);

      setUploadedFileUrl(publicUrl);
      toast.success("File uploaded successfully");
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    }
  };

  const onSubmit = async (data: EvaluationFormData) => {
    if (data.marksAwarded > data.maxMarks) {
      toast.error("Marks awarded cannot exceed max marks");
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await evaluateAnswer(
        answerData.id,
        data.marksAwarded,
        data.maxMarks,
        data.facultyRemarks,
        data.status,
        data.studentRating,
        uploadedFileUrl || undefined
      );

      if (success) {
        toast.success("Answer evaluated successfully!");
        onSuccess();
      } else {
        toast.error("Failed to evaluate answer");
      }
    } catch (error: any) {
      console.error("Error evaluating answer:", error);
      toast.error(error.message || "Failed to evaluate answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluation Form</CardTitle>
        <CardDescription>
          Provide marks, feedback, and submit your evaluation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Answer Information */}
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium">Answer Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Student:</span>
                  <p className="font-medium">{answerData.student?.full_name || "Unknown"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Subject:</span>
                  <p className="font-medium">{answerData.subjects?.name || "Unknown"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Submitted:</span>
                  <p className="font-medium">
                    {new Date(answerData.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <p className="font-medium capitalize">
                    {answerData.status.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
            </div>

            {/* Question Text */}
            {answerData.question_text && (
              <div className="space-y-2">
                <Label>Question</Label>
                <div className="p-3 bg-muted/50 rounded-lg text-sm">
                  {answerData.question_text}
                </div>
              </div>
            )}

            {/* Marks Awarded */}
            <FormField
              control={form.control}
              name="marksAwarded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marks Awarded</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter marks awarded"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Max Marks */}
            <FormField
              control={form.control}
              name="maxMarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Marks</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter maximum marks"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Faculty Remarks */}
            <FormField
              control={form.control}
              name="facultyRemarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faculty Remarks</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide detailed feedback and remarks..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Student Rating */}
            <FormField
              control={form.control}
              name="studentRating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student Rating (Optional)</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={(value) => field.onChange(value === "none" ? undefined : Number(value))} 
                      value={field.value?.toString() || "none"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Rate student performance (1-5)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No rating</SelectItem>
                        {Array.from({ length: 5 }, (_, i) => i + 1).map((rating) => (
                          <SelectItem key={rating} value={rating.toString()}>
                            {rating} - {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very Good" : "Excellent"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Evaluated File (Optional)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center">
                  <IconUpload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload annotated PDF or evaluation document
                  </p>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                    className="max-w-xs mx-auto"
                  />
                  {uploadedFileUrl && (
                    <div className="mt-2 flex items-center justify-center gap-2 text-sm text-green-600">
                      <IconCheck className="size-4" />
                      File uploaded successfully
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Final Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in_evaluation">In Evaluation</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="revision_requested">Revision Requested</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Evaluation"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
