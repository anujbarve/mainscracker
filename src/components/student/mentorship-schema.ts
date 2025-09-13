// src/lib/schemas/mentorship-schema.ts

import * as z from "zod";

export const mentorshipRequestSchema = z.object({
  student_notes: z
    .string()
    .min(10, "Please provide some notes for your mentor (at least 10 characters).")
    .max(1000, "Notes cannot exceed 1000 characters."),
  duration_minutes: z // Coerce converts the string from <Select> to a number
    .string()
    .min(1, "Please select a session duration."),
});

export type MentorshipRequestFormValues = z.infer<typeof mentorshipRequestSchema>;