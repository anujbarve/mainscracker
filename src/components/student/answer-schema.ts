// src/lib/schemas/answer-schema.ts

import * as z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_FILE_TYPES = ["application/pdf"];

export const answerFormSchema = z.object({
  subject_id: z.string().min(1, "Please select a subject."),
  question_text: z
    .string()
    .min(10, { message: "Question must be at least 10 characters long." })
    .max(5000, { message: "Question cannot exceed 5000 characters." }),
  answer_file: z
    .instanceof(File, { message: "An answer sheet file is required." })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: `File size must be less than 5 MB.`,
    })
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
      message: "Only .pdf files are accepted.",
    }),
});

export type AnswerFormValues = z.infer<typeof answerFormSchema>;