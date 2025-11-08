import { SessionsTable, UsersTable } from "@db/schemas";
import { generateHash, validateToken } from "@utils/crypto";
import { drizzle } from "drizzle-orm/d1";
import { and, eq, sql } from "drizzle-orm/sql";
import { getConnInfo } from "hono/cloudflare-workers";
import { getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { MiddlewareHandler } from "hono/types";

const roleHierarchy = {
    reader: 1,
    editor: 2,
    admin: 3
};

const requireRole = (role: keyof typeof roleHierarchy): MiddlewareHandler<Env> => {
    return async (ctx, next) => {
        const auth = ctx.req.header("Authorization");
        const cookie = getCookie(ctx, "user");
        let data: any | null = null;

        if (!(auth && auth.startsWith("Bearer ")) && !cookie)
            throw new HTTPException(401, { message: "This endpoint requires authentication" });

        // Validate authentication
        if (auth) {
            // Validate token
            data = await validateToken(auth!.replace("Bearer ", ""), ctx.env.AUTH_SECRET);

            // Check data
            if (!data)
                throw new HTTPException(401, {
                    message: "Invalid or expired token, please refresh the token"
                });
        }
        // Validate cookies
        else if (cookie) {
            const username = getCookie(ctx, "username");
            const role = getCookie(ctx, "role");

            if (username && role) {
                data = {
                    id: cookie,
                    username,
                    role
                };
            } else {
                const refresh = getCookie(ctx, "refresh");

                if (!refresh)
                    throw new HTTPException(401, {
                        message: "Invalid or expired cookies, please login again"
                    });

                // Refresh session
                const userQuery = drizzle(ctx.env.DB)
                    .select({
                        id: UsersTable.id,
                        username: UsersTable.username,
                        role: UsersTable.role
                    })
                    .from(UsersTable)
                    .where(and(eq(UsersTable.id, cookie), eq(UsersTable.isActive, true)));
                const userData = (await userQuery.get())!;

                if (!userData)
                    throw new HTTPException(403, {
                        message: "Your account has been disabled"
                    });

                // Update rotated token and return new cookies
                const sessionQuery = drizzle(ctx.env.DB)
                    .update(SessionsTable)
                    .set({
                        refresh: generateHash(),
                        userAgent: ctx.req.header("User-Agent"),
                        ipAddress: getConnInfo(ctx).remote.address,
                        expiresAt: sql`(unixepoch() + ${60 * 60 * 24 * 30})` // 30 days
                    })
                    .where(and(eq(SessionsTable.id, refresh), eq(SessionsTable.uid, cookie)))
                    .returning({
                        id: SessionsTable.id,
                        uid: SessionsTable.uid,
                        refresh: SessionsTable.refresh
                    });
                const sessionData = await sessionQuery.get();

                setCookie(ctx, "username", userData.username, {
                    httpOnly: true,
                    secure: ctx.env.ENVIRONMENT === "production",
                    sameSite: "Strict",
                    path: "/",
                    maxAge: 60 * 15 // 15 min
                });
                setCookie(ctx, "role", userData.role, {
                    httpOnly: true,
                    secure: ctx.env.ENVIRONMENT === "production",
                    sameSite: "Strict",
                    path: "/",
                    maxAge: 60 * 15 // 15 min
                });
                setCookie(ctx, "user", sessionData.uid, {
                    httpOnly: true,
                    secure: ctx.env.ENVIRONMENT === "production",
                    sameSite: "Strict",
                    path: "/",
                    maxAge: 60 * 60 * 24 * 30 // 30 days
                });
                setCookie(ctx, "refresh", sessionData.id, {
                    httpOnly: true,
                    secure: ctx.env.ENVIRONMENT === "production",
                    sameSite: "Strict",
                    path: "/",
                    maxAge: 60 * 60 * 24 * 30 // 30 days
                });
                data = {
                    id: userData.id,
                    username: userData.username,
                    role: userData.role
                };
            }
        }

        // Check the role
        if (
            !data.role ||
            roleHierarchy[data.role as keyof typeof roleHierarchy] < roleHierarchy[role]
        )
            throw new HTTPException(403, {
                message: `You need ${role} privileges to access this endpoint`
            });

        // Save data
        ctx.set("uid", data.id);
        ctx.set("username", data.username);
        ctx.set("role", data.role);
        await next();
    };
};

// Middlewares específicos
export const authAdmin = requireRole("admin");
export const authEditor = requireRole("editor");
export const authReader = requireRole("reader");
