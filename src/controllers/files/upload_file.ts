import {
    AudioTypes,
    DocumentTypes,
    ExtensionTypes,
    File,
    ImageTypes,
    TransformFileProps,
    VideoTypes
} from "@models/files";
import { generateHash } from "@utils/crypto";
import { arrayBufferToStream, streamToArrayBuffer } from "@utils/file";
import { HTTPException } from "hono/http-exception";
import { HonoRequest } from "hono/request";
import { Handler } from "hono/types";

const validateHeaders = (req: HonoRequest) => {
    const filename = req.header("X-Filename");
    const type = req.header("Content-Type");

    if (!filename) throw new HTTPException(400, { message: "X-Filename header is required" });
    if (!type) throw new HTTPException(400, { message: "Content-Type header is required" });
    if (!Object.keys(ExtensionTypes).includes(type))
        throw new HTTPException(415, { message: "Unsupported file type" });
    return { filename: `${filename}_${generateHash()}`, type };
};

export const uploadFile: Handler<Env> = async (ctx) => {
    const props = TransformFileProps.parse(ctx.req.query());
    const fields = ctx.req.query("fields")?.split(",");
    let { filename, type } = validateHeaders(ctx.req);
    let buffer: ArrayBuffer = await ctx.req.arrayBuffer();

    if (ImageTypes.includes(type)) {
        // Transform image
        if (Object.values(props).some((e) => e !== undefined)) {
            try {
                const img = await ctx.env.IMAGES.input(arrayBufferToStream(buffer))
                    .transform({
                        width: props.width,
                        height: props.height,
                        rotate: props.rotate as any,
                        fit: "scale-down"
                    })
                    .output({
                        format: props.format ?? type,
                        quality: props.quality ?? 100
                    });

                buffer = await streamToArrayBuffer(img.image());
                type = img.contentType();
            } catch (err) {
                throw new HTTPException(422, { message: "Image optimization failed" });
            }
        }
        filename = `images/${filename}.${ExtensionTypes[type]}`;
    } else if (AudioTypes.includes(type)) {
        filename = `audios/${filename}.${ExtensionTypes[type]}`;
    } else if (VideoTypes.includes(type)) {
        filename = `videos/${filename}.${ExtensionTypes[type]}`;
    } else if (DocumentTypes.includes(type)) {
        filename = `documents/${filename}.${ExtensionTypes[type]}`;
    } else {
        filename = `others/${filename}.${ExtensionTypes[type]}`;
    }

    // Upload file
    const data = await ctx.env.BUCKET.put(filename, buffer, {
        httpMetadata: {
            contentType: type,
            cacheControl: "public, max-age=31536000",
            contentDisposition: "inline"
        }
    }).then((e) => ({
        name: e.key.split("/").pop()!,
        type: e.httpMetadata?.contentType,
        size: e.size,
        url: `${ctx.env.CDN_HOST}/${e.key}`,
        uploadedAt: e.uploaded
    }));

    return ctx.json(File.filter(fields).parse(data), 200);
};
