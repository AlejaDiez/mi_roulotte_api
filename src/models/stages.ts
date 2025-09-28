import z from "zod";

export const Stage = z
    .object({
        id: z.string(),
        tripId: z.string(),
        name: z.string(),
        date: z.date(),
        title: z.string(),
        description: z.string().nullable(),
        image: z.string().nullable(),
        content: z.array(z.any()),
        keywords: z.array(z.string()).nullable(),
        published: z.boolean(),
        url: z.string(),
        createdAt: z.date(),
        updatedAt: z.date().nullable()
    })
    .partial();

export const StagePreview = Stage.pick({
    name: true,
    date: true,
    title: true,
    description: true,
    image: true,
    url: true
});

export const InsertStage = z.object({
    id: z
        .string({
            error: "must be a string"
        })
        .nonempty({
            error: "must be a non-empty string"
        }),
    // tripId: z
    //     .string({
    //         error: "must be a string"
    //     })
    //     .nonempty({
    //         error: "must be a non-empty string"
    //     }),
    name: z.string({
        error: "must be a string"
    }),
    date: z
        .string({
            error: "must be a string in a valid format"
        })
        .refine((val) => !isNaN(Date.parse(val)), { message: "invalid format" })
        .transform((val) => new Date(val)),
    title: z.string({
        error: "must be a string"
    }),
    description: z
        .string({
            error: "must be a string"
        })
        .nullish(),
    image: z.url({ error: "must be a valid url" }).nullish(),
    content: z
        .array(z.any(), {
            error: "must be an array"
        })
        .default([]),
    keywords: z
        .array(
            z.string({
                error: "must be an array of strings"
            }),
            { error: "must be an array of strings" }
        )
        .nullish(),
    published: z
        .boolean({
            error: "must be true or false"
        })
        .optional()
});

export const SetStage = z.object({
    id: z
        .string({
            error: "must be a string"
        })
        .nonempty({
            error: "must be a non-empty string"
        })
        .optional(),
    // tripId: z
    //     .string({
    //         error: "must be a string"
    //     })
    //     .nonempty({
    //         error: "must be a non-empty string"
    //     })
    //     .optional(),
    name: z
        .string({
            error: "must be a string"
        })
        .optional(),
    date: z
        .string({
            error: "must be a string in a valid format"
        })
        .refine((val) => !isNaN(Date.parse(val)), { message: "invalid format" })
        .transform((val) => new Date(val))
        .optional(),
    title: z
        .string({
            error: "must be a string"
        })
        .optional(),
    description: z
        .string({
            error: "must be a string"
        })
        .nullish(),
    image: z.url({ error: "must be a valid url" }).nullish(),
    content: z
        .array(z.any(), {
            error: "must be an array"
        })
        .optional(),
    keywords: z
        .array(
            z.string({
                error: "must be an array of strings"
            }),
            { error: "must be an array of strings" }
        )
        .nullish(),
    published: z
        .boolean({
            error: "must be true or false"
        })
        .optional()
});
