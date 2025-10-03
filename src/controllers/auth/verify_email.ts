import { UsersTable } from "@db/schemas";
import { validateToken } from "@utils/crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { HTTPException } from "hono/http-exception";
import { Handler } from "hono/types";

export const verifyEmail: Handler<{ Bindings: Env }> = async (ctx) => {
    const { token } = await ctx.req.json();

    if (!token) throw new HTTPException(422, { message: "Token is required" });

    // Validate token
    const data = await validateToken(token, ctx.env.VERIFY_EMAIL_SECRET);

    if (!data) throw new HTTPException(401, { message: "Invalid or expired token" });

    // Update user verification status
    const query = drizzle(ctx.env.DB)
        .update(UsersTable)
        .set({ emailVerified: true })
        .where(eq(UsersTable.id, data.id))
        .returning({ id: UsersTable.id });
    const updated = await query.get();

    if (!updated)
        throw new HTTPException(404, {
            message: `User with id '${data.id}' was not found or may have been deleted`
        });
    return ctx.body(null, 204);
};
