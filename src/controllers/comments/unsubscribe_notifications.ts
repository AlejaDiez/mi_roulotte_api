import { CommentsTable } from "@db/schemas";
import { validateToken } from "@utils/crypto";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm/sql";
import { HTTPException } from "hono/http-exception";
import { Handler } from "hono/types";

export const unsubscribeNotifications: Handler<Env> = async (ctx) => {
    const { token } = await ctx.req.json();

    if (!token) throw new HTTPException(422, { message: "Token is required" });

    // Validate token
    const data = await validateToken(token, ctx.env.UNSUBSCRIBE_SECRET);

    if (!data) throw new HTTPException(401, { message: "Invalid or expired token" });

    // Update comment email
    const query = drizzle(ctx.env.DB)
        .update(CommentsTable)
        .set({ email: null })
        .where(eq(CommentsTable.id, data.id))
        .returning({ id: CommentsTable.id });
    const updated = await query.get();

    if (!updated)
        throw new HTTPException(404, {
            message: `Comment with id '${data.id}' was not found or may have been deleted`
        });
    return ctx.body(null, 204);
};
