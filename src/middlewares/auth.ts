import { refreshSession } from "@controllers/auth";
import { RoleHierarchy } from "@utils/auth_role";
import { generateToken, validateToken } from "@utils/crypto";
import { getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { MiddlewareHandler } from "hono/types";

const requireRole = (role?: keyof typeof RoleHierarchy): MiddlewareHandler<Env> => {
    return async (ctx, next) => {
        const auth = ctx.req.header("Authorization");
        const cookie = getCookie(ctx, "token");

        if (role && !((auth && auth.startsWith("Bearer ")) || cookie))
            throw new HTTPException(401, { message: "This endpoint requires authentication" });

        // Validate authentication
        if (auth) {
            // Validate token
            const data = await validateToken(auth!.replace("Bearer ", ""), ctx.env.AUTH_SECRET);

            // Check data
            if (data) {
                // Update data
                ctx.set("uid", data.id);
                ctx.set("username", data.username);
                ctx.set("role", data.role);
            } else if (role)
                throw new HTTPException(401, {
                    message: "Invalid or expired token, please refresh the token"
                });
        }
        // Validate cookies
        else if (cookie) {
            // Validate token
            const data = await validateToken(cookie, ctx.env.AUTH_SECRET);

            // Check data and refresh it if necessary
            if (data) {
                // Update data
                ctx.set("uid", data.id);
                ctx.set("username", data.username);
                ctx.set("role", data.role);
            } else {
                try {
                    const { user, session } = await refreshSession(ctx, {
                        token: getCookie(ctx, "refresh")
                    });

                    // Create tokens
                    const token = await generateToken(
                        {
                            id: user.id,
                            username: user.username,
                            role: user.role
                        },
                        ctx.env.AUTH_SECRET,
                        60 * 15 // 15 min
                    );
                    const refreshToken = await generateToken(
                        {
                            id: session.id,
                            uid: session.uid,
                            refresh: session.refresh
                        },
                        ctx.env.REFRESH_AUTH_SECRET,
                        60 * 60 * 24 * 30 // 30 days
                    );

                    // Create cookies
                    setCookie(ctx, "token", token, {
                        httpOnly: true,
                        secure: ctx.env.ENVIRONMENT === "production",
                        sameSite: "Strict",
                        path: "/",
                        maxAge: 60 * 15 // 15 min
                    });
                    setCookie(ctx, "refresh", refreshToken, {
                        httpOnly: true,
                        secure: ctx.env.ENVIRONMENT === "production",
                        sameSite: "Strict",
                        path: "/",
                        maxAge: 60 * 60 * 24 * 30 // 30 days
                    });

                    // Update data
                    ctx.set("uid", user.id);
                    ctx.set("username", user.username);
                    ctx.set("role", user.role);
                } catch (err) {
                    if (role) throw err;
                }
            }
        }

        // Check the role
        if (
            role &&
            (!ctx.var.role ||
                RoleHierarchy[ctx.var.role as keyof typeof RoleHierarchy] < RoleHierarchy[role])
        )
            throw new HTTPException(403, {
                message: `You need ${role} privileges to access this endpoint`
            });

        // Move on to the next action
        await next();
    };
};

// Specifics middlewares
export const authAdmin = requireRole("admin");
export const authEditor = requireRole("editor");
export const authReader = requireRole("reader");
export const authGuest = requireRole();
