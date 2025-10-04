import { OTPsTable, SessionsTable } from "@db/schemas";
import { generateHash, generateToken, validateToken } from "@utils/crypto";
import { and, eq, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { getConnInfo } from "hono/cloudflare-workers";
import { HTTPException } from "hono/http-exception";
import { Handler } from "hono/types";

export const verifyTwoFactorAuth: Handler<{ Bindings: Env }> = async (ctx) => {
    const body = await ctx.req.json();
    const data = await validateToken(body.token, ctx.env.VERIFY_2FA_SECRET);

    // Validate token
    if (!data) throw new HTTPException(401, { message: "Invalid or expired token" });

    const query = drizzle(ctx.env.DB)
        .delete(OTPsTable)
        .where(
            and(
                eq(OTPsTable.uid, data.id),
                eq(OTPsTable.code, body.code),
                gte(OTPsTable.expiresAt, sql`(unixepoch())`)
            )
        )
        .returning({ uid: OTPsTable.uid });
    const otpData = await query.get();

    if (!otpData)
        throw new HTTPException(401, { message: "OTP code is not valid, please try again" });

    // Create session
    const sessionQuery = drizzle(ctx.env.DB)
        .insert(SessionsTable)
        .values({
            uid: data.id,
            refresh: generateHash(),
            userAgent: ctx.req.header("User-Agent"),
            ipAddress: getConnInfo(ctx).remote.address,
            expiresAt: sql`(unixepoch() + ${60 * 60 * 24 * 30})` // 30 days,
        })
        .returning({
            id: SessionsTable.id,
            uid: SessionsTable.uid,
            refresh: SessionsTable.refresh
        });
    const sessionData = await sessionQuery.get();

    // Create tokens
    const token = await generateToken(
        {
            id: data.id,
            username: data.username,
            role: data.role
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
