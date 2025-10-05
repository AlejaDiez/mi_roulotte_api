import { File } from "@models/files";
import { HTTPException } from "hono/http-exception";
import { Handler } from "hono/types";

export const getFileById: Handler<Env> = async (ctx) => {
    const { type, name } = ctx.req.param();
    const fields = ctx.req.query("fields")?.split(",");
    const query = ctx.env.BUCKET.get(`${type}/${name}`);
    const data = await query.then((e) => {
        if (!e) return undefined;
        return {
            name: e.key.split("/").pop()!,
            type: e.httpMetadata?.contentType,
            size: e.size,
            url: `${ctx.env.CDN_HOST}/${e.key}`,
            uploadedAt: e.uploaded
        };
    });

    if (!data)
        throw new HTTPException(404, {
            message: `File with type '${type}' and name '${name}' not found`
        });

    return ctx.json(File.filter(fields).parse(data), 200);
};
