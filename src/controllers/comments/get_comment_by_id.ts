import { HTTPException } from "hono/http-exception";
import { Handler } from "hono/types";

export const getCommentById: Handler<Env> = async (ctx) => {
    throw new HTTPException(501, { message: "This feature is not implemented yet" });
};
