import { SessionsTable, UsersTable } from "@db/schemas";
import { generateHash, generateToken, validateToken } from "@utils/crypto";
import { and, eq, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { getConnInfo } from "hono/cloudflare-workers";
import { HTTPException } from "hono/http-exception";
import { Handler } from "hono/types";

export const refresh: Handler<{ Bindings: Env }> = async (ctx) => {
    const body = await ctx.req.json();
    const data = await validateToken(body.token, ctx.env.REFRESH_AUTH_SECRET);

    // Validate token
    if (!data) if (!data) throw new HTTPException(401, { message: "Invalid or expired token" });

    // Validate if session exists and rotated token matches the one in the database
    const query = drizzle(ctx.env.DB)
        .select({ id: SessionsTable.id, uid: SessionsTable.uid })
        .from(SessionsTable)
        .where(
            and(
                eq(SessionsTable.id, data.id),
                eq(SessionsTable.uid, data.uid),
                eq(SessionsTable.refresh, data.refresh),
                gte(SessionsTable.expiresAt, sql`(unixepoch())`)
            )
        );
    let sessionData: any = await query.get();

    if (!sessionData)
        throw new HTTPException(404, {
            message: "Session not found, please login again to obtain a new token"
        });

    // Update rotated token and return new access token
    const sessionQuery = drizzle(ctx.env.DB)
        .update(SessionsTable)
        .set({
            refresh: generateHash(),
            userAgent: ctx.req.header("User-Agent"),
            ipAddress: getConnInfo(ctx).remote.address,
            expiresAt: sql`(unixepoch() + ${60 * 60 * 24 * 30})` // 30 days
        })
        .where(and(eq(SessionsTable.id, sessionData.id), eq(SessionsTable.uid, sessionData.uid)))
        .returning({
            id: SessionsTable.id,
            uid: SessionsTable.uid,
            refresh: SessionsTable.refresh
        });
    sessionData = await sessionQuery.get();

    // Create tokens
    const userQuery = drizzle(ctx.env.DB)
        .select({ id: UsersTable.id, username: UsersTable.username, role: UsersTable.role })
        .from(UsersTable)
        .where(eq(UsersTable.id, sessionData.uid));
    const userData = (await userQuery.get())!;
    const token = await generateToken(
        {
            id: userData.id,
            username: userData.username,
            role: userData.role
        },
        ctx.env.AUTH_SECRET,
        60 * 15 // 15 min
    );
    const refreshToken = await generateToken(
        {
            id: sessionData.id,
            uid: sessionData.uid,
            refresh: sessionData.refresh
        },
        ctx.env.REFRESH_AUTH_SECRET,
        60 * 60 * 24 * 30 // 30 days
    );

    return ctx.json(
        {
            token,
            refreshToken
        },
        200
    );
};
