import { z } from "zod";

export const searchSchema = z
    .string()
    .trim()
    .transform((val) => val.replace(/\s+/g, " "))
    .refine((val) => val === "" || val.length >= 2, {
        message: "Search must be at least 2 characters",
    })
    .refine((val) => val.length <= 50, {
        message: "Search cannot exceed 50 characters",
    })
    .refine((val) => !/[<>{}[\]\\]/.test(val), {
        message: "Special characters are not allowed",
    });

export type SearchSchemaType = z.infer<typeof searchSchema>;
