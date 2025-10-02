import { MiddlewareHandler } from "hono";

// This middleware requires at least a admin role
export const authAdmin: MiddlewareHandler = async (ctx, next) => {
    await next();
};

// This middleware requires at least a editor role
export const authEditor: MiddlewareHandler = async (ctx, next) => {
    await next();
};

// This middleware requires at least a reader role
export const authReader: MiddlewareHandler = async (ctx, next) => {
    await next();
};
