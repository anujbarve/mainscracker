import { z } from "zod";

export const mentorshipFeedbackSchema = z.object({
  rating: z
    .string()
    .refine((val) => ["1", "2", "3", "4", "5"].includes(val), {
      message: "Please select a rating from 1 to 5.",
    }),
  feedback: z
    .string()
    .min(10, "Feedback must be at least 10 characters long.")
    .max(1000, "Feedback cannot exceed 1000 characters."),
});

export type MentorshipFeedbackFormValues = z.infer<
  typeof mentorshipFeedbackSchema
>;