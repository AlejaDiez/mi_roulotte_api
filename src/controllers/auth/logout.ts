import { SessionsTable } from "@db/schemas";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Handler } from "hono/types";

export const logout: Handler<Env> = async (ctx) => {
    const query = drizzle(ctx.env.DB)
        .delete(SessionsTable)
        .where(eq(SessionsTable.uid, ctx.var.uid));

    // Delete all sessions
    await query;
    return ctx.body(null, 204);
};
