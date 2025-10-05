import z from "zod";

export const ImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];
export const AudioTypes = ["audio/mpeg", "audio/wav", "audio/ogg"];
export const VideoTypes = ["video/mp4", "video/webm", "video/ogg"];
export const DocumentTypes = ["application/pdf", "text/plain"];

export const ExtensionTypes: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/avif": "avif",
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/ogg": "ogv",
    "application/pdf": "pdf",
    "text/plain": "txt"
};

export const File = z
    .object({
        name: z.string(),
        type: z.enum(Object.keys(ExtensionTypes)),
        size: z.number().int(),
        url: z.url(),
        uploadedAt: z.date()
    })
    .partial();

export const TransformFileProps = z.object({
    width: z.coerce
        .number({
            error: "width must be a number"
        })
        .int("width must be an integer")
        .positive("width must be a positive number")
        .optional(),
    height: z.coerce
        .number({
            error: "height must be a number"
        })
        .int("height must be an integer")
        .positive("height must be a positive number")
        .optional(),
    rotate: z.coerce
        .number({
            error: "rotate must be a number"
        })
        .int("rotate must be an integer")
        .refine((val) => [0, 90, 180, 270].includes(val), {
            message: "rotate must be one of 0, 90, 180, 270"
        })
        .optional(),
    quality: z.coerce
        .number({
            error: "quality must be a number"
        })
        .int("quality must be an integer")
        .min(1, "quality must be at least 1")
        .max(100, "quality must be at most 100")
        .optional(),
    format: z
        .enum([...ImageTypes] as any, {
            message: "format is not supported"
        })
        .optional()
});
