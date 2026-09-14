import { z } from "zod";

export const trackUrlSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Product URL is required")
    .url("Please enter a valid HTTP/HTTPS URL"),
  category: z.string().min(1, "Category is required"),
});

export type TrackUrlSchemaType = z.infer<typeof trackUrlSchema>;
