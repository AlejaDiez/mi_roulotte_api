import { HTTPException } from "hono/http-exception";
import type { Handler } from "hono/types";

export const deleteStage: Handler = async (ctx) => {
    throw new HTTPException(501, { message: "This feature is not implemented yet" });
};
