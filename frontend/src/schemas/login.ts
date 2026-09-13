import { z } from "zod"

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .transform((val) => val.replace(/\s+/g, " "))
        .pipe(
            z
                .string()
                .min(1, "Email is required")
                .email("Invalid email")
        ),
    password: z.string().min(3, "Password must be at least 3 characters")
})

export type LoginSchemaType = z.infer<typeof loginSchema>