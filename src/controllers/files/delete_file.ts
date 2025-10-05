import { Handler } from "hono/types";

export const deleteFile: Handler<Env> = async (ctx) => {
    const { type, name } = ctx.req.param();
    const query = ctx.env.BUCKET.delete(`${type}/${name}`);

    // Delete file
    await query;
    return ctx.body(null, 204);
};
