import z from "zod";

export const Comment = z
    .object({
        id: z.string(),
        tripId: z.string(),
        stageId: z.string().nullable(),
        username: z.string(),
        email: z.email().nullable(),
        content: z.string(),
        repliedTo: z.string().nullable(),
        replies: z.array(z.any()),
        url: z.url(),
        userAgent: z.string().nullable(),
        ipAddress: z.string().nullable(),
        createdAt: z.date(),
        updatedAt: z.date().nullable()
    })
    .partial();

export const InsertComment = z.object({
    tripId: z.string(),
    stageId: z.string().nullish(),
    username: z.string(),
    email: z.email().nullish(),
    content: z.string()
});

export const ReplyComment = z.object({
    username: z.string(),
    email: z.email().nullish(),
    content: z.string()
});

export const UpdateComment = z.object({
    username: z.string().optional(),
    content: z.string().optional()
});
