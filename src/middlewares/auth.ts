import { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";

export const auth: MiddlewareHandler = async (ctx, next) => {
    const apiKey = ctx.req.header("x-api-key");

    if (!apiKey || apiKey !== process.env.API_KEY)
        throw new HTTPException(403, { message: "Forbidden, invalid or missing API key" });
    await next();
};
