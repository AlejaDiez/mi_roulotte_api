import { File } from "@models/files";
import { Handler } from "hono/types";

export const getAllFiles: Handler<Env> = async (ctx) => {
    const fields = ctx.req.query("fields")?.split(",");
    const query = ctx.env.BUCKET.list({
        include: ["httpMetadata"]
    }).then((e) => e.objects);
    const data = (await query).map((e) => ({
        name: e.key.split("/").pop()!,
        type: e.httpMetadata?.contentType,
        size: e.size,
        url: `${ctx.env.CDN_HOST}/${e.key}`,
        uploadedAt: e.uploaded
    }));

    return ctx.json(
        data.map((e) => File.filter(fields).parse(e)),
        200
    );
};
