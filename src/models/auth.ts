import z from "zod";

export const User = z
    .object({
        id: z.string(),
        username: z.string(),
        email: z.email(),
        role: z.enum(["admin", "editor", "reader"]),
        isActive: z.boolean(),
        emailVerified: z.boolean(),
        twoFactorAuthentication: z.boolean(),
        createdAt: z.date(),
        updatedAt: z.date().nullable()
    })
    .partial();

export const LoginUser = z.object({
    email: z.email({ error: "must be a valid email" }),
    password: z
        .string({ error: "must be a string" })
        .min(8, "must be at least 8 characters long")
        .refine((val) => /[A-Z]/.test(val), "must contain at least one uppercase letter")
        .refine((val) => /[a-z]/.test(val), "must contain at least one lowercase letter")
        .refine((val) => /[0-9]/.test(val), "must contain at least one number")
});

export const RegisterUser = z.object({
    username: z
        .string({ error: "must be a string" })
        .nonempty({ error: "must be a non-empty string" }),
    email: z.email({ error: "must be a valid email" }),
    password: z
        .string({ error: "must be a string" })
        .min(8, "must be at least 8 characters long")
        .refine((val) => /[A-Z]/.test(val), "must contain at least one uppercase letter")
        .refine((val) => /[a-z]/.test(val), "must contain at least one lowercase letter")
        .refine((val) => /[0-9]/.test(val), "must contain at least one number")
});

export const EditUser = z.object({
    username: z
        .string({ error: "must be a string" })
        .nonempty({ error: "must be a non-empty string" })
        .optional(),
    password: z
        .string({ error: "must be a string" })
        .min(8, "must be at least 8 characters long")
        .refine((val) => /[A-Z]/.test(val), "must contain at least one uppercase letter")
        .refine((val) => /[a-z]/.test(val), "must contain at least one lowercase letter")
        .refine((val) => /[0-9]/.test(val), "must contain at least one number")
        .optional()
});
