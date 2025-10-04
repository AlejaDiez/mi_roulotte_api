import { validateToken } from "@utils/crypto";
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

        if (!auth || !auth.startsWith("Bearer "))
            throw new HTTPException(401, { message: "This endpoint requires authentication" });

        // Validate token
        const data = await validateToken(auth.replace("Bearer ", ""), ctx.env.AUTH_SECRET);

        if (!data)
            throw new HTTPException(401, {
                message: "Invalid or expired token, please refresh the token"
            });
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
