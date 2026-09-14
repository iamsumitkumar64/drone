import { z } from "zod";

export const chatMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty"),
});

export type ChatMessageSchemaType = z.infer<typeof chatMessageSchema>;
